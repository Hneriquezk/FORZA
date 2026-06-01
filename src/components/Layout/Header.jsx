import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'  // ← ADICIONADO

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()  // ← ADICIONADO

  // APENAS a página Sobre Nós deve ser diferente
  const isSobreNosPage = location.pathname === '/' || location.pathname === '/sobre-nos'
  
  // Páginas de autenticação (login/cadastro) - só logo
  const isAuthPage = location.pathname === '/login' || location.pathname === '/cadastro'

  const isActive = (path) => location.pathname === path

  return (
    <header className="main-header">
      <Link to={isSobreNosPage ? '/' : '/sobre-nos'} className="header-logo-link">
        <img src="/img/logo.png.png" alt="Forza" className="header-logo" />
      </Link>
      
      {/* Para página Sobre Nós - NÃO mostrar links de navegação */}
      {!isSobreNosPage && !isAuthPage && (
        <nav className="header-nav">
          <Link to="/painel" className={`header-nav-link ${isActive('/painel') ? 'active' : ''}`}>PAINEL</Link>
          <Link to="/planos" className={`header-nav-link ${isActive('/planos') ? 'active' : ''}`}>TREINAMENTO</Link>
          <Link to="/clubes" className={`header-nav-link ${isActive('/clubes') ? 'active' : ''}`}>CLUBES</Link>
          <Link to="/desafios" className={`header-nav-link ${isActive('/desafios') ? 'active' : ''}`}>DESAFIOS</Link>
        </nav>
      )}
      
      {/* Para página Sobre Nós - mostrar botões de Entrar e Cadastrar */}
      {isSobreNosPage && (
        <div className="header-auth-buttons">
          <button className="header-login-btn" onClick={() => navigate('/login')}>
            Entrar
          </button>
          <button className="header-signup-btn" onClick={() => navigate('/cadastro')}>
            Cadastrar
          </button>
        </div>
      )}
      
      {/* Para páginas comuns e autenticadas - mostrar ícones normais */}
      {!isSobreNosPage && !isAuthPage && (
        <div className="header-icons">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          <img 
            src={user?.avatar || '/img/usuarios/default.jpg'}  // ← ALTERADO (dinâmico)
            alt={user?.nome || 'Perfil'}                       // ← ALTERADO
            className="header-profile"
            onClick={() => navigate('/perfil')}
            onError={(e) => { e.target.src = '/img/profile.jpg.png' }}
          />
        </div>
      )}

      {/* Para páginas de login/cadastro - não mostrar nada além do logo */}
      {isAuthPage && (
        <div style={{ width: '100px' }}></div>
      )}

      <style jsx>{`
        .main-header {
          background: #000;
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 60px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          flex-wrap: wrap;
          gap: 16px;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .header-logo-link {
          text-decoration: none;
        }
        
        .header-logo {
          height: 32px;
          object-fit: contain;
          cursor: pointer;
        }
        
        .header-nav {
          display: flex;
          gap: 42px;
          flex-wrap: wrap;
          align-items: center;
          height: 100%;
        }
        
        .header-nav-link {
          color: #aaa;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.3px;
          transition: 0.2s;
          padding-bottom: 6px;
          position: relative;
        }
        
        .header-nav-link:hover {
          color: #fff;
        }
        
        .header-nav-link.active {
          color: #fff;
        }
        
        .header-nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -25px;
          left: -12px;
          right: -12px;
          height: 3px;
          background: #ff1e2d;
          border-radius: 2px;
        }
        
        .header-auth-buttons {
          display: flex;
          gap: 16px;
        }
        
        .header-login-btn {
          background: transparent;
          border: 1px solid #ff1e2d;
          padding: 8px 24px;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }
        
        .header-login-btn:hover {
          background: rgba(255, 30, 45, 0.1);
          transform: scale(1.02);
        }
        
        .header-signup-btn {
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 8px 24px;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }
        
        .header-signup-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(255, 30, 45, 0.3);
        }
        
        .header-icons {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        
        .theme-toggle-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          color: #fff;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .theme-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }
        
        .header-profile {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #ff1e2d;
          object-fit: cover;
        }
        
        @media (max-width: 768px) {
          .main-header {
            padding: 15px 20px;
          }
          .header-nav {
            gap: 20px;
          }
          .header-nav-link {
            font-size: 12px;
          }
          .header-nav-link.active::after {
            bottom: -22px;
            left: -8px;
            right: -8px;
          }
          .header-auth-buttons {
            width: 100%;
            justify-content: center;
          }
        }
        
        @media (max-width: 600px) {
          .header-nav {
            gap: 15px;
          }
          .header-nav-link {
            font-size: 11px;
          }
          .header-nav-link.active::after {
            bottom: -20px;
            left: -6px;
            right: -6px;
          }
        }
      `}</style>
    </header>
  )
}

export default Header