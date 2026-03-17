'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import styles from './notifications.module.scss';

interface Notificacion {
  id: number;
  mensaje: string;
  leida: boolean;
  fecha: string;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotificaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notificaciones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setNotifs(data);
    } catch (error) {
      console.error("Error cargando notificaciones", error);
    } finally {
      setLoading(false);
    }
  };

  const marcarLeida = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notificaciones/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifs(notifs.map(n => n.id === id ? { ...n, leida: true } : n));
      }
    } catch (error) {
      console.error("No se pudo marcar como leída");
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  // FUNCIÓN PARA CORREGIR EL DESFASE DE HORA
  const formatTimeCorrection = (fechaOriginal: string, mensajeOriginal: string) => {
    // Forzamos el formato UTC añadiendo la 'Z'
    const utcDate = fechaOriginal.includes('Z') ? fechaOriginal : `${fechaOriginal.replace(' ', 'T')}Z`;
    const date = new Date(utcDate);

    // Formato para la fecha detallada (la de abajo)
    const fechaFormateada = date.toLocaleString('es-MX', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'America/Mexico_City'
    });

    // Formato para la hora del título (la que va dentro del mensaje)
    const horaTitulo = date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24h como en tu captura (05:10 -> 23:10)
      timeZone: 'America/Mexico_City'
    });

    // Reemplazamos la hora vieja en el mensaje por la corregida
    // Ejemplo: "ENTRADA registrada a las 05:10" -> "ENTRADA registrada a las 23:10"
    const mensajeCorregido = mensajeOriginal.replace(/\d{2}:\d{2}/, horaTitulo);

    return { mensajeCorregido, fechaFormateada };
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.push('/main')} className={styles.backBtn}>← Menú</button>
        <h1>Notificaciones</h1>
      </header>

      {loading ? (
        <p className={styles.msg}>Buscando avisos...</p>
      ) : notifs.length > 0 ? (
        <div className={styles.list}>
          {notifs.map((n) => {
            const { mensajeCorregido, fechaFormateada } = formatTimeCorrection(n.fecha, n.mensaje);
            
            return (
              <div 
                key={n.id} 
                className={`${styles.card} ${n.leida ? styles.read : styles.unread}`}
                onClick={() => !n.leida && marcarLeida(n.id)}
              >
                <div className={styles.icon}>
                  {n.mensaje.includes('ENTRADA') ? '🚗' : '🏁'}
                </div>
                <div className={styles.content}>
                  <p>{mensajeCorregido}</p>
                  <span>{fechaFormateada}</span>
                </div>
                {!n.leida && <div className={styles.dot} />}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>Todo en orden por aquí. No tienes avisos nuevos.</p>
        </div>
      )}
    </div>
  );
}