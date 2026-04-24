import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import NotificationBell from '../Common/NotificationBell'
import './Header.css' // Vamos criar um arquivo CSS separado

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const isAuthPage = location.pathname === '/login' || location.pathname === '/cadastro'
  const isActive = (path) => location.pathname === path

  return (
    <header className="main-header">
      <Link to={isAuthPage ? '/login' : '/painel'} className="header-logo-link">
        <img src="/img/logo.png.png" alt="Forza" className="header-logo" />
      </Link>
      
      {!isAuthPage && (
        <>
          <nav className="header-nav">
            <Link to="/painel" className={`header-nav-link ${isActive('/painel') ? 'active' : ''}`}>PAINEL</Link>
            <Link to="/planos" className={`header-nav-link ${isActive('/planos') ? 'active' : ''}`}>TREINAMENTO</Link>
            <Link to="/clubes" className={`header-nav-link ${isActive('/clubes') ? 'active' : ''}`}>CLUBES</Link>
            <Link to="/desafios" className={`header-nav-link ${isActive('/desafios') ? 'active' : ''}`}>DESAFIOS</Link>
          </nav>
          
          <div className="header-icons">
            <NotificationBell />
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <img 
              src="/img/usuarios/vitor_vaz.jpg" 
              alt="Perfil" 
              className="header-profile"
              onClick={() => navigate('/perfil')}
              onError={(e) => { e.target.src = '/img/profile.jpg.png' }}
            />
            <div className="plus-btn" onClick={() => alert('Nova atividade em breve!')}>
              <img src="/img/Plus circle.png" alt="+" />
            </div>
          </div>
        </>
      )}
    </header>
  )
}

export default Header