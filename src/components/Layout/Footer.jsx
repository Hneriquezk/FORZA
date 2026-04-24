import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-left">
          <div className="footer-logo">
            <img 
              src="/img/logo.png.png" 
              alt="Forza" 
              onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 32\'%3E%3Ctext x=\'0\' y=\'24\' fill=\'white\' font-weight=\'bold\' font-size=\'22\'%3EFORZA%3C/text%3E%3C/svg%3E' }}
            />
          </div>
          <div className="socials">
            <Link to="https://www.instagram.com/forza.og?igsh=NnFqeGtzcXd6dzRw"><i className="fa-brands fa-instagram"></i></Link>
            <Link to="https://www.tiktok.com/@forzaog?lang=pt-BR&is_from_webapp=1&sender_device=mobile&sender_web_id=7627563566270481938"><i className="fa-brands fa-tiktok"></i></Link>
            <Link to="https://www.youtube.com/@FORZAOG"><i className="fa-brands fa-youtube"></i></Link>
          </div>
        </div>
        <div className="footer-col">
          <Link to="#">Sobre Nós</Link>
          <Link to="#">FORZA</Link>
          <Link to="#">Política De Privacidade</Link>
        </div>
        <div className="footer-col">
          <Link to="/sobre">Suporte</Link>
          <Link to="/sobre">Central de Ajuda</Link>
          <Link to="#">Novidades</Link>
          <Link to="#">Empresas</Link>
        </div>
        <div className="footer-col">
          <Link to="#">Privacidade</Link>
          <Link to="#">Política de cookies</Link>
          <Link to="#">Termos</Link>
          <Link to="/Login"><h4>Login</h4></Link>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: var(--footer-bg);
          padding: 60px 80px;
          margin-top: 50px;
          width: 100%;
          clear: both;
          transition: background 0.3s ease;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 40px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .footer-left {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .footer-logo img {
          height: 32px;
        }
        
        .socials {
          display: flex;
          gap: 20px;
        }
        
        .socials i {
          font-size: 24px;
          color: #aaa;
          cursor: pointer;
          transition: color 0.2s;
        }
        
        .socials i:hover {
          color: #ff1e2d;
        }
        
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .footer-col a {
          color: #aaa;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }
        
        .footer-col a:hover {
          color: #ff1e2d;
        }

        .footer-col h4 {
          color: #ff1e2d;
        
        @media (max-width: 900px) {
          .footer {
            padding: 40px 30px;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
        }
        
        @media (max-width: 760px) {
          .footer-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .footer-left {
            align-items: center;
          }
          .footer-col {
            align-items: center;
          }
          .socials {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer