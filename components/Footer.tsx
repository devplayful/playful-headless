import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="playful-footer">
    <div className="playful-footer-content-wrapper">

        {/* Columna 1: Tarjeta flotante (Contacto / Logo) */}
        <div className="footer-contact-card">
            <div className="footer-logo-section">
                {/* Asegúrate de que esta ruta sea correcta en Next.js */}
                <img src="/images/playful-logo.svg" alt="Playful Logo" className="footer-logo" />
                <p className="footer-logo-text">playful</p>
            </div>

            {/* Íconos de redes sociales */}
            <div className="footer-social-icons">
                <a href="#"><span className="icon-circle facebook-icon">f</span></a>
                <a href="#"><span className="icon-circle instagram-icon">📷</span></a>
                <a href="#"><span className="icon-circle linkedin-icon">in</span></a>
                <a href="#"><span className="icon-circle youtube-icon">▶️</span></a>
            </div>
            
            {/* Botón de Contacto usando tu estilo turquesa*/}
            <button className="footer-contact-button playful-boton-header">
                <span className="contact-icon" role="img" aria-label="emoji-chat">💬</span> Contáctanos
            </button>
        </div>

        {/* Columna 2: Navegación Nosotros */}
        <div className="footer-nav-group nosotros">
            <h4 className="footer-title">NOSOTROS</h4>
            <ul className="footer-links">
                <li><a href="#">Sobre Playful</a></li>
                <li><a href="#">Casos de éxito</a></li>
                <li><a href="#">Nuestro Blog</a></li>
            </ul>
        </div>

        {/* Columna 3: Servicios */}
        <div className="footer-nav-group servicios">
            <h4 className="footer-title">SERVICIOS</h4>
            <ul className="footer-links">
                <li><a href="#">Agencia SEO</a></li>
                <li><a href="#">Agencia WEB</a></li>
                <li><a href="#">Agencia CRO</a></li>
                <li><a href="#">Anuncios</a></li>
            </ul>
        </div>

        {/* Columna 4: Legal */}
        <div className="footer-nav-group legal">
            <h4 className="footer-title">LEGAL</h4>
            <ul className="footer-links">
                <li><a href="#">Política de Privacidad</a></li>
                <li><a href="#">Política de Cookies</a></li>
            </ul>
        </div>

    </div>
    {/* Este div puede usarse para un patrón de fondo si lo deseas */}
    <div className="footer-background-pattern"></div>
</footer>
  )
}
