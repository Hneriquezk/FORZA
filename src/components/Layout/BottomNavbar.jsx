import React from 'react'
import { NavLink } from 'react-router-dom'

const BottomNavbar = () => {
  return (
    <div className="bottom-navbar">
      <div className="bottom-menu">
        <NavLink to="/painel" end>
          <i className="fas fa-home"></i> <span>Início</span>
        </NavLink>
        <NavLink to="/planos">
          <i className="fas fa-chart-line"></i> <span>Treino</span>
        </NavLink>
        <NavLink to="/clubes">
          <i className="fas fa-users"></i> <span>Clubes</span>
        </NavLink>
        <NavLink to="/desafios">
          <i className="fas fa-trophy"></i> <span>Desafios</span>
        </NavLink>
        <NavLink to="/perfil">
          <i className="fas fa-user"></i> <span>Perfil</span>
        </NavLink>
      </div>

      <style jsx>{`
        .bottom-navbar {
          background: transparent;
          padding: 12px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 99;
        }
        
        .bottom-menu {
          display: flex;
          gap: 48px;
          background: rgba(0, 0, 0, 0.05);
          padding: 6px 28px;
          border-radius: 60px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }
        
        [data-theme="dark"] .bottom-menu {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .bottom-menu a {
          color: var(--text-primary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          padding: 8px 6px;
          transition: all 0.2s;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .bottom-menu a i {
          font-size: 16px;
        }
        
        .bottom-menu a.active {
          color: #ff1e2d;
          border-bottom: 2px solid #ff1e2d;
          margin-bottom: -2px;
        }
        
        .bottom-menu a:hover {
          color: #ff1e2d;
        }
        
        @media (max-width: 600px) {
          .bottom-menu {
            gap: 24px;
            padding: 5px 16px;
          }
          .bottom-menu a span {
            display: none;
          }
          .bottom-menu a i {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default BottomNavbar