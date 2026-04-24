import React, { useEffect } from 'react'

const Toast = ({ title, message, type = 'info' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      const toast = document.querySelector('.toast-notification')
      if (toast) toast.remove()
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  const getIcon = () => {
    switch (type) {
      case 'success': return 'fa-check-circle'
      case 'warning': return 'fa-exclamation-circle'
      case 'error': return 'fa-times-circle'
      default: return 'fa-info-circle'
    }
  }

  const getColor = () => {
    switch (type) {
      case 'success': return '#10b981'
      case 'warning': return '#f59e0b'
      case 'error': return '#ff1e2d'
      default: return '#3b82f6'
    }
  }

  return (
    <div className="toast-notification" style={{ borderLeftColor: getColor() }}>
      <div className="toast-icon" style={{ background: `${getColor()}20` }}>
        <i className={`fas ${getIcon()}`} style={{ color: getColor() }}></i>
      </div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
      </div>

      <style jsx>{`
        .toast-notification {
          position: fixed;
          bottom: 80px;
          right: 20px;
          background: var(--bg-card);
          padding: 12px 16px;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
          z-index: 10002;
          animation: slideInRight 0.3s ease;
          border-left: 3px solid;
          display: flex;
          gap: 12px;
          align-items: center;
          max-width: 350px;
          cursor: pointer;
        }
        
        .toast-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .toast-icon i {
          font-size: 20px;
        }
        
        .toast-content {
          flex: 1;
        }
        
        .toast-title {
          font-weight: 700;
          font-size: 14px;
          color: var(--text-primary);
        }
        
        .toast-message {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 2px;
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @media (max-width: 768px) {
          .toast-notification {
            bottom: 70px;
            right: 10px;
            left: 10px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  )
}

export default Toast