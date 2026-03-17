from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class UsuarioCreate(BaseModel):
    nombre: str
    tipo_usuario: str
    password: str


class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    tipo_usuario: str
    codigo_qr: UUID
    activo: bool
    fecha_registro: datetime

    class Config:
        from_attributes = True


class EscaneoQR(BaseModel):
    codigo_qr: UUID


class RegistroResponse(BaseModel):
    id: int
    fecha_entrada: datetime
    fecha_salida: Optional[datetime]
    estado: str

    class Config:
        from_attributes = True


class NotificacionResponse(BaseModel):
    id: int
    mensaje: str
    leida: bool
    fecha: datetime

    class Config:
        from_attributes = True