import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'

const Footer = () => {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const { addNotification } = useNotifications()

  const handleLogout = async () => {
    const confirmed = await window.confirm('Tem certeza que deseja sair da sua conta?')
    if (confirmed) {
      logout()
      addNotification('Até logo!', 'Você saiu da sua conta. Volte sempre!', 'info', 'fa-sign-out-alt')
      navigate('/login')
    }
  }

  return (
    <footer className="footer">
      <div className="footer-bar">
        <div className="footer-logo">
          <img
            src="/img/logo.png.png"
            alt="Forza"
            onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 32\'%3E%3Ctext x=\'0\' y=\'24\' fill=\'white\' font-weight=\'bold\' font-size=\'22\'%3EFORZA%3C/text%3E%3C/svg%3E' }}
          />
        </div>

        <nav className="footer-nav">
          <Link to="/sobre-nos">Sobre Nós</Link>
          <Link to="/privacidade">Política De Privacidade</Link>
          <Link to="#">Política de cookies</Link>
          <Link to="/sobre">Central de Ajuda</Link>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="footer-logout-btn">
              Sair
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>

        <div className="footer-socials">
          <Link to="https://www.instagram.com/forza.og?igsh=NnFqeGtzcXd6dzRw" aria-label="Instagram">
            <i className="fa-brands fa-instagram"></i>
          </Link>
          <Link to="https://www.tiktok.com/@forzaog?lang=pt-BR&is_from_webapp=1&sender_device=mobile&sender_web_id=7627563566270481938" aria-label="TikTok">
            <i className="fa-brands fa-tiktok"></i>
          </Link>
          <Link to="https://www.youtube.com/@FORZAOG" aria-label="YouTube">
            <i className="fa-brands fa-youtube"></i>
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 FORZA. Todos os direitos reservados.</p>
      </div>

      <style jsx>{`
        .footer {
          background: var(--footer-bg);
          padding: 24px 40px 16px;
          width: 100%;
          transition: background 0.3s ease;
        }

        .footer-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .footer-logo img {
          height: 30px;
        }

        .footer-nav {
          display: flex;
          gap: 28px;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
        }

        .footer-nav a {
          color: #ccc;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }

        .footer-nav a:hover {
          color: #ff1e2d;
        }

        .footer-logout-btn {
          background: none;
          border: none;
          color: #ccc;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s;
          font-family: inherit;
          padding: 0;
        }

        .footer-logout-btn:hover {
          color: #ff1e2d;
        }

        .footer-socials {
          display: flex;
          gap: 18px;
        }

        .footer-socials i {
          font-size: 20px;
          color: #aaa;
          transition: color 0.2s;
        }

        .footer-socials i:hover {
          color: #ff1e2d;
        }

        .footer-bottom {
          margin-top: 24px;
          padding-top: 16px;
          text-align: center;
        }

        .footer-bottom p {
          font-size: 13px;
          color: #777;
          margin: 0;
        }

        @media (max-width: 768px) {
          .footer-bar {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 18px;
          }
          .footer-nav {
            gap: 20px;
          }
          .footer-nav h4 {
            color: #ff1e2d;
            margin: 0;
          }
          .footer-socials {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer