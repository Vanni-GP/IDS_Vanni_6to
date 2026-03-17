'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import styles from './login.module.scss';

export default function LoginRegisterPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Estados para capturar los datos del formulario
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState(''); 
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      
      if (isLogin) {
        // --- LÓGICA DE LOGIN (FastAPI OAuth2 espera form-data) ---
        const formData = new URLSearchParams();
        formData.append('username', nombre); // FastAPI usa 'username'
        formData.append('password', password);

        response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData,
        });
      } else {
        // --- LÓGICA DE REGISTRO (JSON normal) ---
        const body = { 
          nombre: nombre, 
          tipo_usuario: tipo, // Ajustado para schemas.UsuarioCreate
          password: password 
        };

        response = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // Guardamos el token de acceso
          localStorage.setItem('token', data.access_token);
          router.push('/main');
        } else {
          // Registro exitoso
          alert("¡Usuario registrado! Ahora puedes iniciar sesión.");
          setIsLogin(true); // Cambiamos automáticamente a la pestaña de login
          setNombre('');
          setPassword('');
        }
      } else {
        // Mostramos el error real que viene de FastAPI (detail)
        const errorMsg = data.detail || 'Error en la operación';
        alert(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } catch (error) {
      alert('Error: No se pudo conectar con el backend. Verifica que esté corriendo en el puerto 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.blob}></div>
      <div className={styles.card}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>E</div>
          <span className={styles.logoText}>
            Estaciona<span className={styles.logoBold}>Tec</span>
          </span>
        </div>

        <h1 className={styles.title}>{isLogin ? 'Bienvenido' : 'Crea tu cuenta'}</h1>
        
        <div className={styles.tabs}>
          <button 
            type="button"
            className={isLogin ? styles.activeTab : ''} 
            onClick={() => setIsLogin(true)}
          >
            Entrar
          </button>
          <button 
            type="button"
            className={!isLogin ? styles.activeTab : ''} 
            onClick={() => setIsLogin(false)}
          >
            Registrar
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Nombre de usuario" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required 
          />

          {!isLogin && (
            <select 
              required 
              className={styles.select}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="" disabled>Selecciona tu rol</option>
              <option value="alumno">Alumno</option>
              <option value="docente">Docente</option>
            </select>
          )}

          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Conectando...' : (isLogin ? 'Iniciar Sesión' : 'Registrar Cuenta')}
          </button>
        </form>

        <div className={styles.footer}>
          {isLogin && <a href="#">¿Olvidaste tu contraseña?</a>}
        </div>
      </div>
    </div>
  );
}