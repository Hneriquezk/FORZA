import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}>
      <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
      
      <style jsx>{`
        .theme-toggle {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
          color: #fff;
          font-size: 18px;
        }
        
        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }
        
        [data-theme="dark"] .theme-toggle {
          background: rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </button>
  )
}

export default ThemeToggle