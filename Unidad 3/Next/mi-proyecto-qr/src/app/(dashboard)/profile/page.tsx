'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import styles from './profile.module.scss';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/perfil`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();

        if (res.ok) {
          setUser(data);
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Función para descargar el QR físicamente
  const descargarQR = async () => {
    if (!user?.codigo_qr) return;
    
    try {
      const response = await fetch(`${API_URL}/static/qrcodes/${user.codigo_qr}.png`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_EstacionaTec_${user.nombre}.png`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("No se pudo descargar el archivo. Intenta de nuevo.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.push('/main')} className={styles.backBtn}>← Menú</button>
        <h1>Mi Perfil</h1>
      </header>

      {loading ? (
        <p className={styles.loader}>Cargando datos...</p>
      ) : user ? (
        <div className={styles.profileCard}>
          <div className={styles.avatar}>{user.nombre?.charAt(0).toUpperCase()}</div>
          <h2 className={styles.userName}>{user.nombre}</h2>
          <span className={styles.userRole}>{user.tipo_usuario?.toUpperCase()}</span>
          
          <div className={styles.qrContainer}>
            <div className={styles.qrFrame}>
              {user.codigo_qr ? (
                <img 
                  src={`${API_URL}/static/qrcodes/${user.codigo_qr}.png`} 
                  alt="QR"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${user.codigo_qr}`;
                  }}
                />
              ) : (
                <p>No se encontró UUID de QR</p>
              )}
            </div>

            {user.codigo_qr && (
              <button onClick={descargarQR} className={styles.downloadBtn}>
                💾 Descargar mi QR
              </button>
            )}
          </div>
          
          <div className={styles.details}>
            <p><strong>ID de Usuario:</strong> #00{user.id}</p>
            <p><strong>Estatus:</strong> {user.activo ? '✅ Activo' : '❌ Inactivo'}</p>
          </div>
        </div>
      ) : (
        <p className={styles.error}>Error al cargar perfil</p>
      )}
    </div>
  );
}