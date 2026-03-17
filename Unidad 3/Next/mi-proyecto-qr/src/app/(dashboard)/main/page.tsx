'use client';

import React from 'react';
import styles from './main.module.scss';
import { useRouter } from 'next/navigation';

export default function MainPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.clear();
    router.push('/');
  };

  const navItems = [
    { name: 'Historial', icon: '🕒', path: '/history' },
    { name: 'Mi Perfil', icon: '👤', path: '/profile' },
    { name: 'Ajustes', icon: '⚙️', path: '/settings' },
  ];

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => router.push('/main')}>
          Estaciona<span>Tec</span>
        </div>
        <div className={styles.userSection}>
          <div 
            className={styles.notifications} 
            onClick={() => router.push('/notifications')}
          >
            🔔
          </div>
          <div 
            className={styles.avatar} 
            onClick={() => router.push('/profile')}
          ></div>
        </div>
      </header>

      <div className={styles.mainWrapper}>
        {/* SIDEBAR IZQUIERDO */}
        <aside className={styles.sidebar}>
          <nav className={styles.navList}>
            {navItems.map((item) => (
              <div 
                key={item.name} 
                className={styles.navItem} 
                onClick={() => router.push(item.path)}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.text}>{item.name}</span>
              </div>
            ))}
            <div className={`${styles.navItem} ${styles.exit}`} onClick={handleLogout}>
              <span className={styles.icon}>🚪</span>
              <span className={styles.text}>Salir</span>
            </div>
          </nav>
        </aside>

        {/* CONTENIDO DERECHO */}
        <main className={styles.contentArea}>
          <div className={`${styles.card} ${styles.large}`} onClick={() => router.push('/scan')}>
            <div className={styles.iconTag}>📸</div>
            <h2>Escanear QR</h2>
            <p>Registra tu entrada o salida rápidamente</p>
            <div className={styles.actionHint}>Toca para abrir cámara</div>
          </div>
        </main>
      </div>
    </div>
  );
}