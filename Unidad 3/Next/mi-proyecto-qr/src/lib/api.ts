// src/lib/api.ts
export const API_URL = 'http://10.131.48.234:8000'; 

export const authService = {
  login: async (nombre: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', nombre); 
    params.append('password', password);

    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    return res.json();
  },
  
  // Cambiamos el nombre de la ruta aquí:
  registro: async (datos: any) => {
    const res = await fetch(`${API_URL}/register`, { // <--- Cambiado a /register
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    return res.json();
  }
};