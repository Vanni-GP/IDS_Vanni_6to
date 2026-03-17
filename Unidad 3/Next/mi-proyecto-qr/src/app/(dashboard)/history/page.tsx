'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import styles from './history.module.scss';

interface Registro {
  id: number;
  fecha_entrada: string;
  fecha_salida: string | null;
  estado: string;
}

export default function HistoryPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchHistorial = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/historial?t=${Date.now()}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setRegistros(data.sort((a: Registro, b: Registro) => b.id - a.id));
      }
    } catch (error) {
      console.error("Error al obtener historial", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  // FUNCIÓN ACTUALIZADA: Formatea la hora ajustando el desfase UTC a México
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '---';
    // Normalizamos el string para que JS lo entienda como UTC (añadiendo 'Z' y cambiando espacio por 'T')
    const utcDate = dateStr.includes('Z') ? dateStr : `${dateStr.replace(' ', 'T')}Z`;
    const date = new Date(utcDate);

    return date.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true,
      timeZone: 'America/Mexico_City' 
    });
  };

  // FUNCIÓN ACTUALIZADA: Formatea la fecha ajustando el desfase UTC a México
  const formatDate = (dateStr: string) => {
    const utcDate = dateStr.includes('Z') ? dateStr : `${dateStr.replace(' ', 'T')}Z`;
    const date = new Date(utcDate);

    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'America/Mexico_City'
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.push('/main')} className={styles.backBtn}>← Menú</button>
        <h1>Mi Historial de Accesos</h1>
      </header>

      {loading ? (
        <div className={styles.loader}>Cargando movimientos...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((reg) => (
                <tr key={reg.id} className={reg.fecha_salida ? styles.rowOut : styles.rowIn}>
                  <td>{formatDate(reg.fecha_entrada)}</td>
                  <td className={styles.timeIn}>{formatTime(reg.fecha_entrada)}</td>
                  <td className={styles.timeOut}>{formatTime(reg.fecha_salida)}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[reg.estado]}`}>
                      {reg.estado === 'dentro' ? '🟢 En Plantel' : '🔴 Fuera'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {registros.length === 0 && (
            <p className={styles.empty}>Aún no tienes registros de acceso.</p>
          )}
        </div>
      )}
    </div>
  );
}