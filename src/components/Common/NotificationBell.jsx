import React, { useState, useEffect, useRef } from 'react'

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('unread')
  const modalRef = useRef(null)
  
  const [unreadNotifications, setUnreadNotifications] = useState([
    {
      id: 1,
      titulo: "Nova conquista!",
      mensagem: "Você completou 50km este mês! Continue assim!",
      tempo: "Agora mesmo",
      icone: "fa-trophy"
    },
    {
      id: 2,
      titulo: "Coach IA tem uma dica",
      mensagem: "Seus treinos intervalados estão 12% mais rápidos. Ótimo progresso!",
      tempo: "5 minutos atrás",
      icone: "fa-brain"
    },
    {
      id: 3,
      titulo: "Lembrete de treino",
      mensagem: "Seu treino de hoje: Fartlek 40min. Não esqueça de se hidratar!",
      tempo: "1 hora atrás",
      icone: "fa-bell"
    },
    {
      id: 4,
      titulo: "Meta próxima de ser batida",
      mensagem: "Você está a apenas 26km de atingir sua meta mensal de 100km!",
      tempo: "2 horas atrás",
      icone: "fa-chart-line"
    }
  ])

  const [readNotifications, setReadNotifications] = useState([
    {
      id: 5,
      titulo: "Bem-vindo ao Forza!",
      mensagem: "Seja bem-vindo à sua nova jornada fitness. Estamos aqui para te ajudar!",
      tempo: "Ontem",
      icone: "fa-hand-peace"
    },
    {
      id: 6,
      titulo: "Desafio da semana",
      mensagem: "Desafio: Complete 5 treinos esta semana e ganhe uma medalha exclusiva!",
      tempo: "2 dias atrás",
      icone: "fa-medal"
    }
  ])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && !event.target.closest('.notification-wrapper')) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const toggleModal = () => setIsOpen(!isOpen)

  const handleMarkAsRead = (id) => {
    const notification = unreadNotifications.find(n => n.id === id)
    if (notification) {
      setUnreadNotifications(prev => prev.filter(n => n.id !== id))
      setReadNotifications(prev => [notification, ...prev])
    }
  }

  const handleMarkAllAsRead = () => {
    if (unreadNotifications.length === 0) return
    setReadNotifications(prev => [...unreadNotifications, ...prev])
    setUnreadNotifications([])
  }

  const handleRemove = (id, isRead) => {
    if (isRead) {
      setReadNotifications(prev => prev.filter(n => n.id !== id))
    } else {
      setUnreadNotifications(prev => prev.filter(n => n.id !== id))
    }
  }

  const currentUnreadCount = unreadNotifications.length

  return (
    <>
      <div className="notification-wrapper" onClick={toggleModal}>
        <i className="fa-solid fa-bell"></i>
        {currentUnreadCount > 0 && (
          <span className="notification-badge">{currentUnreadCount}</span>
        )}
      </div>

      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)}></div>
          <div className="notification-modal" ref={modalRef}>
            <div className="notification-header">
              <h3>
                <i className="fas fa-bell"></i>
                Notificações
              </h3>
              <button className="close-modal-btn" onClick={() => setIsOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="notification-tabs">
              <button 
                className={`tab ${activeTab === 'unread' ? 'active' : ''}`} 
                onClick={() => setActiveTab('unread')}
              >
                Não lidas ({unreadNotifications.length})
              </button>
              <button 
                className={`tab ${activeTab === 'read' ? 'active' : ''}`} 
                onClick={() => setActiveTab('read')}
              >
                Lidas ({readNotifications.length})
              </button>
            </div>
            
            <div className="notification-list">
              {activeTab === 'unread' && unreadNotifications.length === 0 && (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>Nenhuma notificação não lida</p>
                </div>
              )}
              
              {activeTab === 'read' && readNotifications.length === 0 && (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>Nenhuma notificação lida</p>
                </div>
              )}
              
              {activeTab === 'unread' && unreadNotifications.map(notif => (
                <div key={notif.id} className="notification-item unread">
                  <div className="notification-icon">
                    <i className={`fas ${notif.icone}`}></i>
                  </div>
                  <div className="notification-content" onClick={() => handleMarkAsRead(notif.id)}>
                    <div className="notification-title">{notif.titulo}</div>
                    <div className="notification-message">{notif.mensagem}</div>
                    <div className="notification-time">
                      <i className="far fa-clock"></i> {notif.tempo}
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => handleRemove(notif.id, false)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
              
              {activeTab === 'read' && readNotifications.map(notif => (
                <div key={notif.id} className="notification-item">
                  <div className="notification-icon">
                    <i className={`fas ${notif.icone}`}></i>
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notif.titulo}</div>
                    <div className="notification-message">{notif.mensagem}</div>
                    <div className="notification-time">
                      <i className="far fa-clock"></i> {notif.tempo}
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => handleRemove(notif.id, true)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
            
            {activeTab === 'unread' && unreadNotifications.length > 0 && (
              <div className="notification-footer">
                <button onClick={handleMarkAllAsRead}>Marcar todas como lidas</button>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        .notification-wrapper {
          position: relative;
          cursor: pointer;
        }
        
        .notification-wrapper i {
          color: #bbb;
          font-size: 20px;
        }
        
        .notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff1e2d;
          color: white;
          font-size: 10px;
          font-weight: bold;
          border-radius: 50%;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }
        
        .notification-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }
        
        .notification-modal {
          position: fixed;
          top: 70px;
          right: 20px;
          width: 400px;
          max-width: calc(100vw - 40px);
          background: var(--bg-card, white);
          box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.3);
          z-index: 1001;
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 16px;
          animation: slideInRight 0.3s ease;
          overflow: hidden;
        }
        
        .notification-header {
          padding: 14px 18px;
          border-bottom: 1px solid var(--border-color, #e0e0e0);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-card, white);
        }
        
        .notification-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #1a1a1a);
          margin: 0;
        }
        
        .close-modal-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary, #666);
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
        }
        
        .close-modal-btn:hover {
          color: #ff1e2d;
        }
        
        .notification-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color, #e0e0e0);
          background: var(--bg-card, white);
        }
        
        .tab {
          flex: 1;
          padding: 10px;
          text-align: center;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary, #666);
          background: transparent;
          border: none;
          transition: 0.2s;
        }
        
        .tab:hover {
          color: #ff1e2d;
        }
        
        .tab.active {
          color: #ff1e2d;
          border-bottom: 2px solid #ff1e2d;
        }
        
        /* Altura máxima e scroll para muitas notificações */
        .notification-list {
          max-height: 380px;
          overflow-y: auto;
          background: var(--bg-card, white);
        }
        
        .notification-list::-webkit-scrollbar {
          width: 4px;
        }
        
        .notification-list::-webkit-scrollbar-track {
          background: var(--border-light, #f0f0f0);
          border-radius: 10px;
        }
        
        .notification-list::-webkit-scrollbar-thumb {
          background: #ff1e2d;
          border-radius: 10px;
        }
        
        .notification-item {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color, #e0e0e0);
          display: flex;
          gap: 12px;
          position: relative;
          transition: background 0.2s;
        }
        
        .notification-item:hover {
          background: var(--chat-bg, #f5f5f5);
        }
        
        .notification-item.unread {
          background: #ff1e2d08;
          border-left: 3px solid #ff1e2d;
        }
        
        .notification-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ff1e2d20;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .notification-icon i {
          font-size: 16px;
          color: #ff1e2d;
        }
        
        .notification-content {
          flex: 1;
          cursor: pointer;
        }
        
        .notification-title {
          font-weight: 600;
          color: var(--text-primary, #1a1a1a);
          margin-bottom: 4px;
          font-size: 13px;
        }
        
        .notification-message {
          font-size: 12px;
          color: var(--text-secondary, #666);
          margin-bottom: 4px;
          line-height: 1.4;
        }
        
        .notification-time {
          font-size: 10px;
          color: var(--text-light, #999);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .remove-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: transparent;
          border: none;
          color: var(--text-light, #999);
          cursor: pointer;
          font-size: 10px;
          opacity: 0;
          transition: 0.2s;
        }
        
        .notification-item:hover .remove-btn {
          opacity: 1;
        }
        
        .remove-btn:hover {
          color: #ff1e2d;
        }
        
        .empty-state {
          padding: 50px 20px;
          text-align: center;
          color: var(--text-secondary, #666);
        }
        
        .empty-state i {
          font-size: 40px;
          margin-bottom: 12px;
          opacity: 0.5;
        }
        
        .empty-state p {
          font-size: 13px;
          margin: 0;
        }
        
        .notification-footer {
          padding: 10px 16px;
          border-top: 1px solid var(--border-color, #e0e0e0);
          text-align: center;
          background: var(--bg-card, white);
        }
        
        .notification-footer button {
          background: transparent;
          border: none;
          color: #ff1e2d;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 20px;
          transition: 0.2s;
        }
        
        .notification-footer button:hover {
          background: #ff1e2d20;
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
        
        @media (max-width: 480px) {
          .notification-modal {
            top: 60px;
            right: 10px;
            left: 10px;
            width: auto;
          }
        }
      `}</style>
    </>
  )
}

export default NotificationBell