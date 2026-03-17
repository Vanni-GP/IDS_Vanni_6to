from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, date
from jose import jwt, JWTError
from passlib.context import CryptContext
import uuid
import qrcode
import os

# SERVIR IMÁGENES CON SOPORTE PARA DESCARGA (CORS)
from fastapi.staticfiles import StaticFiles

from database import SessionLocal, engine
import models
import schemas

# ==========================
# APP + CONFIGURACIÓN
# ==========================
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Clase personalizada para permitir la descarga de archivos estáticos desde el Frontend
class CORSStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response

# Montamos la carpeta de QRs usando la nueva clase con soporte CORS
app.mount("/static/qrcodes", CORSStaticFiles(directory="qrcodes"), name="static")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <--- Permite todo temporalmente
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

SECRET_KEY = "estacionatec_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ==========================
# DB
# ==========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================
# PASSWORD
# ==========================
def hash_password(password: str):
    return pwd_context.hash(password[:72])

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password[:72], hashed_password)

# ==========================
# TOKEN
# ==========================
def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Token inválido o expirado"
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        if username is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(models.Usuario).filter(
        models.Usuario.nombre == username
    ).first()

    if user is None:
        raise credentials_exception

    return user

# ==========================
# CONTROL DE ROLES
# ==========================
def require_role(role: str):
    def role_checker(user: models.Usuario = Depends(get_current_user)):
        if user.tipo_usuario != role:
            raise HTTPException(status_code=403, detail="No tienes permisos")
        return user
    return role_checker


# ==========================
# REGISTER
# ==========================
@app.post("/register")
def register(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):

    if usuario.tipo_usuario not in ["alumno", "docente", "administrador"]:
        raise HTTPException(status_code=400, detail="Tipo de usuario inválido")

    usuario_existente = db.query(models.Usuario).filter(
        models.Usuario.nombre == usuario.nombre
    ).first()

    if usuario_existente:
        raise HTTPException(status_code=400, detail="Usuario ya existe")

    nuevo_uuid = uuid.uuid4()

    nuevo_usuario = models.Usuario(
        nombre=usuario.nombre,
        tipo_usuario=usuario.tipo_usuario,
        codigo_qr=nuevo_uuid,
        password_hash=hash_password(usuario.password)
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    if not os.path.exists("qrcodes"):
        os.makedirs("qrcodes")

    img = qrcode.make(str(nuevo_uuid))
    img.save(f"qrcodes/{nuevo_uuid}.png")

    return {"mensaje": "Usuario registrado correctamente"}


# ==========================
# LOGIN
# ==========================
@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    usuario = db.query(models.Usuario).filter(
        models.Usuario.nombre == form_data.username
    ).first()

    if not usuario:
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")

    if not usuario.activo:
        raise HTTPException(status_code=400, detail="Usuario desactivado")

    if not verify_password(form_data.password, usuario.password_hash):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")

    access_token = create_access_token({"sub": usuario.nombre})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ==========================
# PERFIL
# ==========================
@app.get("/perfil")
def perfil(usuario_actual: models.Usuario = Depends(get_current_user)):
    return {
        "id": usuario_actual.id,
        "nombre": usuario_actual.nombre,
        "tipo_usuario": usuario_actual.tipo_usuario,
        "codigo_qr": usuario_actual.codigo_qr, 
        "activo": usuario_actual.activo,
        "fecha_registro": usuario_actual.fecha_registro
    }

# ==========================
# HISTORIAL PERSONAL
# ==========================
@app.get("/historial", response_model=list[schemas.RegistroResponse])
def historial(
    usuario_actual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.RegistroAcceso).filter(
        models.RegistroAcceso.usuario_id == usuario_actual.id
    ).all()


# ==========================
# ESCANEAR QR (Ciclo Entrada/Salida Blindado)
# ==========================
@app.post("/escanear")
def escanear_qr(
    data: schemas.EscaneoQR,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(get_current_user)
):
    # 1. Buscar al dueño del QR
    usuario_qr = db.query(models.Usuario).filter(
        models.Usuario.codigo_qr == data.codigo_qr
    ).first()

    if not usuario_qr:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if not usuario_qr.activo:
        raise HTTPException(status_code=400, detail="El usuario está desactivado")

    # 2. Buscar el registro más reciente de este usuario
    ultimo_registro = db.query(models.RegistroAcceso).filter(
        models.RegistroAcceso.usuario_id == usuario_qr.id
    ).order_by(models.RegistroAcceso.fecha_entrada.desc()).first()

    ahora = datetime.utcnow()

    # --- SEGURO ANTI-DOBLE ESCANEO (10 segundos) ---
    if ultimo_registro and (ahora - ultimo_registro.fecha_entrada).total_seconds() < 10:
        return {"mensaje": "Escaneo duplicado ignorado. Espera un momento."}

    # 3. Lógica del Ciclo
    # Si no hay registros o el último ya tiene salida registrada -> TOCA ENTRADA
    if not ultimo_registro or ultimo_registro.fecha_salida is not None:
        nuevo_registro = models.RegistroAcceso(
            usuario_id=usuario_qr.id,
            fecha_entrada=ahora,
            estado="dentro"
        )
        db.add(nuevo_registro)
        
        mensaje_resp = f"¡Bienvenido {usuario_qr.nombre}! ENTRADA registrada"
        msg_notif = f"ENTRADA registrada a las {ahora.strftime('%H:%M')}"
    
    else:
        # Si el último registro NO tiene fecha de salida -> TOCA SALIDA
        ultimo_registro.fecha_salida = ahora
        ultimo_registro.estado = "fuera"
        
        mensaje_resp = f"¡Hasta pronto {usuario_qr.nombre}! SALIDA registrada"
        msg_notif = f"SALIDA registrada a las {ahora.strftime('%H:%M')}"

    # 4. Crear Notificación
    nueva_notificacion = models.Notificacion(
        usuario_id=usuario_qr.id,
        mensaje=msg_notif,
        fecha=ahora
    )
    db.add(nueva_notificacion)

    db.commit()
    return {"mensaje": mensaje_resp}


# ==========================
# ADMIN - VER USUARIOS
# ==========================
@app.get("/admin/usuarios")
def ver_todos_los_usuarios(
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(require_role("administrador"))
):
    return db.query(models.Usuario).all()


# ==========================
# ADMIN - VER REGISTROS
# ==========================
@app.get("/admin/registros")
def ver_todos_los_registros(
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(require_role("administrador"))
):
    return db.query(models.RegistroAcceso).all()


# ==========================
# ADMIN - DESACTIVAR USUARIO
# ==========================
@app.put("/admin/desactivar/{usuario_id}")
def desactivar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(require_role("administrador"))
):

    usuario = db.query(models.Usuario).filter(
        models.Usuario.id == usuario_id
    ).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.activo = False
    db.commit()

    return {"mensaje": "Usuario desactivado correctamente"}


# ==========================
# ADMIN - ESTADÍSTICAS COMPLETAS
# ==========================
@app.get("/admin/estadisticas")
def estadisticas(
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(require_role("administrador"))
):

    hoy = date.today()

    total_usuarios = db.query(models.Usuario).count()

    total_alumnos = db.query(models.Usuario).filter(
        models.Usuario.tipo_usuario == "alumno"
    ).count()

    total_docentes = db.query(models.Usuario).filter(
        models.Usuario.tipo_usuario == "docente"
    ).count()

    total_admins = db.query(models.Usuario).filter(
        models.Usuario.tipo_usuario == "administrador"
    ).count()

    personas_dentro = db.query(models.RegistroAcceso).filter(
        models.RegistroAcceso.fecha_salida == None
    ).count()

    entradas_hoy = db.query(models.RegistroAcceso).filter(
        func.date(models.RegistroAcceso.fecha_entrada) == hoy
    ).count()

    salidas_hoy = db.query(models.RegistroAcceso).filter(
        func.date(models.RegistroAcceso.fecha_salida) == hoy
    ).count()

    return {
        "usuarios": {
            "total": total_usuarios,
            "alumnos": total_alumnos,
            "docentes": total_docentes,
            "administradores": total_admins
        },
        "actividad_actual": {
            "personas_dentro": personas_dentro
        },
        "movimientos_hoy": {
            "entradas": entradas_hoy,
            "salidas": salidas_hoy
        }
    }


# ==========================
# MIS NOTIFICACIONES
# ==========================
@app.get("/notificaciones", response_model=list[schemas.NotificacionResponse])
def mis_notificaciones(
    db: Session = Depends(get_db),
    usuario: models.Usuario = Depends(get_current_user)
):
    return db.query(models.Notificacion).filter(
        models.Notificacion.usuario_id == usuario.id
    ).order_by(models.Notificacion.fecha.desc()).all()


# ==========================
# MARCAR COMO LEÍDA
# ==========================
@app.put("/notificaciones/{notificacion_id}")
def marcar_como_leida(
    notificacion_id: int,
    db: Session = Depends(get_db),
    usuario: models.Usuario = Depends(get_current_user)
):

    notificacion = db.query(models.Notificacion).filter(
        models.Notificacion.id == notificacion_id,
        models.Notificacion.usuario_id == usuario.id
    ).first()

    if not notificacion:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")

    notificacion.leida = True
    db.commit()

    return {"mensaje": "Notificación marcada como leída"}


# ==========================
# ADMIN - VER TODAS LAS NOTIFICACIONES
# ==========================
@app.get("/admin/notificaciones")
def ver_todas_notificaciones(
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(require_role("administrador"))
):
    return db.query(models.Notificacion).order_by(
        models.Notificacion.fecha.desc()
    ).all()

# ==========================
# USUARIO - CAMBIAR CONTRASEÑA
# ==========================
@app.put("/usuario/cambiar-password")
def cambiar_password(
    nueva_password: str,
    usuario_actual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    usuario_actual.password_hash = hash_password(nueva_password)
    db.commit()
    return {"mensaje": "Contraseña actualizada correctamente"}

# ==========================
# ADMIN - ACTIVAR USUARIO
# ==========================
@app.put("/admin/activar/{usuario_id}")
def activar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(require_role("administrador"))
):
    usuario = db.query(models.Usuario).filter(
        models.Usuario.id == usuario_id
    ).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.activo = True
    db.commit()

    return {"mensaje": "Usuario activado correctamente"}