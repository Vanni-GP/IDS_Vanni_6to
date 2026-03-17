'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import styles from './scan.module.scss';

export default function ScanPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<any>(''); // Soporta texto u objetos de error
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const router = useRouter();

  // Función para enviar datos al Backend
  const enviarDatosEscaneo = async (uuid: string) => {
    setStatus('loading');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/escanear`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ codigo_qr: uuid })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.mensaje);
      } else {
        setStatus('error');
        // CORRECCIÓN: Si 'detail' es un objeto (Error 422), extraemos un texto legible
        const errorDetail = typeof data.detail === 'string' 
          ? data.detail 
          : "Código QR no válido para EstacionaTec";
        
        setMessage(errorDetail);
      }
    } catch (err) {
      setStatus('error');
      setMessage("Error de conexión con el servidor");
    }
  };

  // Iniciar Cámara
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        html5QrCode.stop().then(() => {
          enviarDatosEscaneo(decodedText);
        }).catch(() => {
          enviarDatosEscaneo(decodedText);
        });
      },
      () => { /* Escaneo en curso... */ }
    ).catch(err => console.error("Error al iniciar cámara", err));

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop();
      }
    };
  }, []);

  // Subir Imagen desde Galería
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        const result = await scannerRef.current.scanFile(file, true);
        enviarDatosEscaneo(result);
      } catch (err) {
        setStatus('error');
        setMessage("No se detectó un código QR en esta imagen");
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.push('/main')} className={styles.backBtn}>← Volver</button>
        <h1>Control de Acceso</h1>
      </header>

      <div className={styles.scannerWrapper}>
        <div id="reader" className={styles.reader}></div>
        
        {status !== 'idle' && (
          <div className={`${styles.result} ${styles[status]}`}>
            <p>{message}</p>
            <button onClick={() => window.location.reload()}>Nuevo Escaneo</button>
          </div>
        )}
      </div>

      <div className={styles.uploadSection}>
        <div className={styles.divider}><span>O TAMBIÉN</span></div>
        <label className={styles.uploadBtn}>
          <span className={styles.uploadIcon}>📁</span>
          <div className={styles.uploadText}>
            <strong>Subir imagen</strong>
            <span>Seleccionar de la galería</span>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
        </label>
      </div>
    </div>
  );
}