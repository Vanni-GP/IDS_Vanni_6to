import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Esto cambia el nombre de la pestaña en el navegador
export const metadata: Metadata = {
  title: "ESTACIONATEC | IT Frontera Comalapa",
  description: "Sistema de Control de Acceso",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        
        {/* Contenedor principal para organizar la página */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh', // Ocupa toda la altura de la pantalla
          margin: 0 
        }}>
          
          {/* Aquí se renderizan todas tus páginas (Login, Menú, etc.) */}
          <main style={{ flex: '1 0 auto' }}>
            {children}
          </main>

          {/* FOOTER CON TUS DATOS Y DERECHOS RESERVADOS */}
          <footer style={{
            flexShrink: 0, // Evita que el footer se aplaste
            textAlign: 'center',
            padding: '25px 15px',
            fontSize: '13px',
            color: '#666',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e5e5e5',
            lineHeight: '1.5'
          }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <p style={{ 
                margin: '0 0 5px 0', 
                fontWeight: 'bold', 
                color: '#333',
                fontSize: '14px'
              }}>
                © 2026 ESTACIONATEC - Instituto Tecnológico de Frontera Comalapa
              </p>
              
              <p style={{ margin: '0 0 10px 0' }}>
                Todos los derechos reservados.
              </p>

              <div style={{ 
                marginTop: '10px', 
                paddingTop: '10px', 
                borderTop: '1px dashed #eee',
                color: '#888',
                fontSize: '12px'
              }}>
                <strong>Desarrollado por:</strong>
                <br />
                Alan Eduardo Rodríguez Silvestre • Madeni Pérez Mazariegos • Eddi Uriel Castillo Sánchez • Vanni Gutiérrez Pérez
              </div>
            </div>
          </footer>

        </div>
      </body>
    </html>
  );
}