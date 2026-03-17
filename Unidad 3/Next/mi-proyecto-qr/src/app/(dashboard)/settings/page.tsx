'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import styles from './settings.module.scss';

export default function SettingsPage() {
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nuevaPassword !== confirmarPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      // Enviamos la nueva contraseña como query parameter según tu endpoint
      const res = await fetch(`${API_URL}/usuario/cambiar-password?nueva_password=${nuevaPassword}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok) {
        alert("¡Contraseña actualizada con éxito!");
        setNuevaPassword('');
        setConfirmarPassword('');
      } else {
        alert(data.detail || "Error al actualizar");
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.push('/main')} className={styles.backBtn}>← Volver</button>
        <h1>Configuración</h1>
      </header>

      <div className={styles.card}>
        <div className={styles.section}>
          <h3>Seguridad</h3>
          <p className={styles.subtitle}>Actualiza tu contraseña para mantener tu cuenta segura.</p>
          
          <form onSubmit={handleUpdatePassword} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Nueva Contraseña</label>
              <input 
                type="password" 
                placeholder="Mínimo 8 caracteres"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Confirmar Contraseña</label>
              <input 
                type="password" 
                placeholder="Repite tu contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? 'Guardando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <h3>Sesión</h3>
          <button 
            className={styles.logoutBtn}
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/');
            }}
          >
            Cerrar Sesión de EstacionaTec
          </button>
        </div>
      </div>
    </div>
  );
}