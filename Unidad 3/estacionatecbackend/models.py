from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    tipo_usuario = Column(String(20), nullable=False)
    codigo_qr = Column(UUID(as_uuid=True), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    activo = Column(Boolean, default=True)
    fecha_registro = Column(TIMESTAMP, server_default=func.now())

    registros = relationship("RegistroAcceso", back_populates="usuario")
    notificaciones = relationship("Notificacion", back_populates="usuario")


class RegistroAcceso(Base):
    __tablename__ = "registro_acceso"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    fecha_entrada = Column(TIMESTAMP)
    fecha_salida = Column(TIMESTAMP, nullable=True)
    estado = Column(String(20))
    creado_en = Column(TIMESTAMP, server_default=func.now())

    usuario = relationship("Usuario", back_populates="registros")


class Notificacion(Base):
    __tablename__ = "notificaciones"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    mensaje = Column(String(255), nullable=False)
    leida = Column(Boolean, default=False)
    fecha = Column(TIMESTAMP, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="notificaciones")