import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'

const ClubeChat = ({ clubeId, clubeNome, onClose }) => {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Carregar mensagens do localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_${clubeId}`)
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    } else {
      // Mensagens iniciais de exemplo
      const initialMessages = [
        {
          id: 1,
          usuario: "Sistema",
          avatar: "/img/forza icon.png",
          mensagem: `Bem-vindo ao chat do ${clubeNome}!`,
          hora: new Date().toLocaleTimeString(),
          data: new Date().toISOString()
        },
        {
          id: 2,
          usuario: "Henrique Santosz",
          avatar: "/img/usuarios/henrique_santosz.jpg",
          mensagem: "E aí pessoal! Treino hoje às 18h?",
          hora: "18:30",
          data: new Date().toISOString()
        },
        {
          id: 3,
          usuario: "Giovanni Borsoi",
          avatar: "/img/usuarios/giovanni_borsoi.jpg",
          mensagem: "Bora! Tô dentro!",
          hora: "18:32",
          data: new Date().toISOString()
        }
      ]
      setMessages(initialMessages)
      localStorage.setItem(`chat_${clubeId}`, JSON.stringify(initialMessages))
    }
  }, [clubeId, clubeNome])

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const enviarMensagem = () => {
    if (!newMessage.trim()) return

    const novaMensagem = {
      id: Date.now(),
      usuario: user?.nome || "Você",
      avatar: user?.avatar || "/img/usuarios/vitor_vaz.jpg",
      mensagem: newMessage,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data: new Date().toISOString()
    }

    const updatedMessages = [...messages, novaMensagem]
    setMessages(updatedMessages)
    localStorage.setItem(`chat_${clubeId}`, JSON.stringify(updatedMessages))
    setNewMessage('')
    
    // Simular resposta automática (opcional)
    if (Math.random() > 0.7) {
      setTimeout(() => {
        const respostas = [
          "Boa! 👏",
          "Legal! Continue assim!",
          "🔥🔥🔥",
          "Vamos treinar!"
        ]
        const respostaAleatoria = respostas[Math.floor(Math.random() * respostas.length)]
        const respostaBot = {
          id: Date.now() + 1,
          usuario: "Coach Forza",
          avatar: "/img/forza icon.png",
          mensagem: respostaAleatoria,
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: new Date().toISOString()
        }
        setMessages(prev => [...prev, respostaBot])
        localStorage.setItem(`chat_${clubeId}`, JSON.stringify([...updatedMessages, respostaBot]))
      }, 1000)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensagem()
    }
  }

  const handleTyping = () => {
    setIsTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000)
  }

  return (
    <div className="clube-chat-container">
      <div className="clube-chat-header">
        <div className="chat-header-info">
          <div className="chat-clube-icon">
            <i className="fas fa-users"></i>
          </div>
          <div>
            <h3>{clubeNome}</h3>
            <span>{messages.length} mensagens</span>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="clube-chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.usuario === (user?.nome || "Você") ? 'my-message' : ''}`}>
            <img src={msg.avatar} alt={msg.usuario} className="chat-message-avatar" />
            <div className="chat-message-content">
              <div className="chat-message-header">
                <strong>{msg.usuario}</strong>
                <span className="chat-message-time">{msg.hora}</span>
              </div>
              <p>{msg.mensagem}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="clube-chat-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          onKeyUp={handleTyping}
          placeholder="Digite sua mensagem..."
          rows="2"
        />
        <button onClick={enviarMensagem}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>

      <style jsx>{`
        .clube-chat-container {
          background: var(--bg-card);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          height: 500px;
          border: 1px solid var(--border-color);
          overflow: hidden;
        }
        
        .clube-chat-header {
          padding: 16px 20px;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .chat-clube-icon {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .chat-clube-icon i {
          font-size: 20px;
        }
        
        .chat-header-info h3 {
          font-size: 16px;
          margin: 0 0 2px 0;
        }
        
        .chat-header-info span {
          font-size: 11px;
          opacity: 0.8;
        }
        
        .chat-close-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          color: white;
          cursor: pointer;
        }
        
        .clube-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--chat-bg);
        }
        
        .chat-message {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        
        .chat-message.my-message {
          flex-direction: row-reverse;
        }
        
        .chat-message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .chat-message-content {
          max-width: 70%;
          padding: 10px 14px;
          border-radius: 16px;
          background: var(--bg-card);
          box-shadow: var(--shadow);
        }
        
        .chat-message.my-message .chat-message-content {
          background: #ff1e2d;
          color: white;
        }
        
        .chat-message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          font-size: 12px;
        }
        
        .chat-message-header strong {
          font-size: 12px;
        }
        
        .chat-message-time {
          font-size: 10px;
          opacity: 0.7;
        }
        
        .chat-message-content p {
          margin: 0;
          font-size: 13px;
          line-height: 1.4;
          word-break: break-word;
        }
        
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 12px;
          background: var(--bg-card);
          border-radius: 20px;
          width: fit-content;
        }
        
        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #999;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
        
        .clube-chat-input {
          padding: 12px 16px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 10px;
          background: var(--bg-card);
        }
        
        .clube-chat-input textarea {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid var(--border-color);
          border-radius: 20px;
          background: var(--input-bg);
          color: var(--text-primary);
          resize: none;
          font-family: inherit;
          font-size: 13px;
        }
        
        .clube-chat-input textarea:focus {
          outline: none;
          border-color: #ff1e2d;
        }
        
        .clube-chat-input button {
          width: 44px;
          height: 44px;
          background: #ff1e2d;
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: 0.2s;
        }
        
        .clube-chat-input button:hover {
          transform: scale(1.05);
        }
        
        .clube-chat-messages::-webkit-scrollbar {
          width: 4px;
        }
        
        .clube-chat-messages::-webkit-scrollbar-track {
          background: var(--border-light);
          border-radius: 10px;
        }
        
        .clube-chat-messages::-webkit-scrollbar-thumb {
          background: #ff1e2d;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}

export default ClubeChat