import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import ClubeChat from '../components/ClubeChat'

const Clubes = () => {
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [clubes, setClubes] = useState([])
  const [membros, setMembros] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState(null)

  // ==================== CARREGAR CLUBES DO BANCO ====================
  const carregarClubes = async () => {
    try {
      const { data, error } = await supabase
        .from('clubes')
        .select('*')
        .order('nome')
      
      if (error) throw error
      setClubes(data || [])
    } catch (error) {
      console.error('Erro ao carregar clubes:', error)
    }
  }

  // ==================== CARREGAR MEMBROS DO USUÁRIO ====================
  const carregarMembros = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('clubes_membros')
        .select('clube_id')
        .eq('usuario_id', user.id)
      
      if (error) throw error
      
      const membrosIds = data.map(item => item.clube_id)
      setMembros(membrosIds)
    } catch (error) {
      console.error('Erro ao carregar membros:', error)
    }
  }

  // ==================== ENTRAR/SAIR DO CLUBE ====================
  const entrarClube = async (clubeId, clubeNome) => {
    if (!user) {
      addNotification('Faça login', 'Você precisa estar logado para entrar em um clube.', 'warning')
      navigate('/login')
      return
    }
    
    const isMembro = membros.includes(clubeId)
    
    if (isMembro) {
      const confirmed = await window.confirm(`Deseja sair do clube "${clubeNome}"?`)
      
      if (confirmed) {
        const { error } = await supabase
          .from('clubes_membros')
          .delete()
          .eq('usuario_id', user.id)
          .eq('clube_id', clubeId)
        
        if (error) throw error
        
        setMembros(prev => prev.filter(id => id !== clubeId))
        addNotification('Saiu do clube', `Você saiu do clube "${clubeNome}".`, 'info', 'fa-sign-out-alt')
        
        if (selectedChat?.id === clubeId) setSelectedChat(null)
      }
    } else {
      const confirmed = await window.confirm(`Deseja entrar no clube "${clubeNome}"?`)
      
      if (confirmed) {
        const { error } = await supabase
          .from('clubes_membros')
          .insert([{ usuario_id: user.id, clube_id: clubeId }])
        
        if (error) throw error
        
        setMembros(prev => [...prev, clubeId])
        addNotification('Bem-vindo ao clube!', `Você entrou no clube "${clubeNome}".`, 'success', 'fa-check-circle')
      }
    }
  }

  // ==================== IR PARA PÁGINA DO CLUBE ====================
  const irParaClube = (clubeId) => {
    navigate(`/clube/${clubeId}`)
  }

  // ==================== LOADING INICIAL ====================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await carregarClubes()
      await carregarMembros()
      setLoading(false)
    }
    loadData()
  }, [user])

  // ==================== FILTRAR CLUBES ====================
  const filteredClubes = clubes.filter(clube => {
    const matchCategory = activeCategory === 'todos' || 
      (activeCategory === 'corrida' && clube.categoria === 'Corrida') ||
      (activeCategory === 'ciclismo' && clube.categoria === 'Ciclismo') ||
      (activeCategory === 'fitness' && clube.categoria === 'Fitness') ||
      (activeCategory === 'natacao' && clube.categoria === 'Natação')
    
    const matchSearch = clube.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       clube.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       clube.localizacao?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchCategory && matchSearch
  })

  const clubesParticipantes = clubes.filter(clube => membros.includes(clube.id))

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando clubes...</p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <div className="container">
        <div className="clubes-hero">
          <h1>Clubes</h1>
          <p>Encontre grupos de pessoas com os mesmos objetivos que você. Treine junto, <br /> compartilhe experiências e evolua!</p>
        </div>

        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Pesquise clube por nome, tipo ou localização..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="categoria-tabs">
          <button className={`categoria-btn ${activeCategory === 'todos' ? 'active' : ''}`} onClick={() => setActiveCategory('todos')}>
            <i className="fas fa-globe"></i> Todos
          </button>
          <button className={`categoria-btn ${activeCategory === 'corrida' ? 'active' : ''}`} onClick={() => setActiveCategory('corrida')}>
            <i className="fas fa-running"></i> Corrida
          </button>
          <button className={`categoria-btn ${activeCategory === 'ciclismo' ? 'active' : ''}`} onClick={() => setActiveCategory('ciclismo')}>
            <i className="fas fa-bicycle"></i> Ciclismo
          </button>
          <button className={`categoria-btn ${activeCategory === 'fitness' ? 'active' : ''}`} onClick={() => setActiveCategory('fitness')}>
            <i className="fas fa-dumbbell"></i> Fitness
          </button>
          <button className={`categoria-btn ${activeCategory === 'natacao' ? 'active' : ''}`} onClick={() => setActiveCategory('natacao')}>
            <i className="fas fa-water"></i> Natação
          </button>
        </div>

        <div className="clubes-grid">
          {filteredClubes.map(clube => {
            const isMembro = membros.includes(clube.id)
            return (
              <div key={clube.id} className="clube-card" onClick={() => isMembro && irParaClube(clube.id)}>
                <div className="clube-capa">
                  <img src={clube.capa || clube.logo || '/img/clube_capa_default.jpg'} alt={clube.nome} />
                  <div className="clube-avatar-wrapper">
                    <img src={clube.logo || '/img/clube_default.jpg'} alt={clube.nome} />
                  </div>
                </div>
                <div className="clube-content">
                  <div className="clube-header">
                    <h3>{clube.nome}</h3>
                    <span className="clube-tipo">{clube.categoria}</span>
                  </div>
                  <p className="clube-descricao">{clube.descricao || 'Clube de atividades físicas'}</p>
                  <div className="clube-stats">
                    <div className="stat">
                      <i className="fas fa-users"></i>
                      <strong>{clube.membros_total?.toLocaleString() || 0}</strong> membros
                    </div>
                    {clube.localizacao && (
                      <div className="stat">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{clube.localizacao}</span>
                      </div>
                    )}
                  </div>
                  {!isMembro ? (
                    <button className="btn-entrar" onClick={(e) => { e.stopPropagation(); entrarClube(clube.id, clube.nome) }}>
                      <i className="fas fa-sign-in-alt"></i> Entrar
                    </button>
                  ) : (
                    <div className="clube-member-actions">
                      <button className="btn-membro" onClick={(e) => { e.stopPropagation(); irParaClube(clube.id) }}>
                        <i className="fas fa-eye"></i> Ver Clube
                      </button>
                      <button className="btn-chat" onClick={(e) => { e.stopPropagation(); setSelectedChat({ id: clube.id, nome: clube.nome }) }}>
                        <i className="fas fa-comment-dots"></i> Chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {selectedChat && (
          <div className="chat-section">
            <ClubeChat 
              clubeId={selectedChat.id} 
              clubeNome={selectedChat.nome} 
              onClose={() => setSelectedChat(null)}
            />
          </div>
        )}

        {clubesParticipantes.length > 0 && !selectedChat && (
          <div className="chat-selector">
            <h3><i className="fas fa-comments"></i> Conversas dos Clubes</h3>
            <div className="chat-clubes-list">
              {clubesParticipantes.map(clube => (
                <button 
                  key={clube.id} 
                  className="chat-clube-btn"
                  onClick={() => setSelectedChat({ id: clube.id, nome: clube.nome })}
                >
                  <img src={clube.logo || '/img/clube_default.jpg'} alt={clube.nome} />
                  <div>
                    <strong>{clube.nome}</strong>
                    <span>Clique para conversar</span>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredClubes.length === 0 && (
          <div className="empty-clubes">
            <i className="fas fa-search"></i>
            <h3>Nenhum clube encontrado</h3>
            <p>Tente ajustar sua busca ou filtro</p>
          </div>
        )}
      </div>

      <Footer />

      <style jsx>{`
        .container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px 60px;
          padding-bottom: 100px;
        }
        
        .clubes-hero {
          border-radius: 28px;
          padding: 40px;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .clubes-hero h1 {
          font-size: 36px;
          margin-bottom: 12px;
          color: var(--text-primary);
        }
        
        .clubes-hero p {
          color: var(--text-secondary);
          font-size: 16px;
        }
        
        .search-bar {
          background: var(--bg-card);
          border-radius: 60px;
          padding: 4px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
          border: 1px solid var(--border-color);
          width: 800px;
          margin: 0 auto 30px;
        }
        
        .search-bar i {
          color: var(--text-secondary);
          font-size: 18px;
        }
        
        .search-bar input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 8px 0;
          font-size: 15px;
          outline: none;
          color: var(--text-primary);
        }
        
        .categoria-tabs {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        
        .categoria-btn {
          background: var(--chat-bg);
          border: 1px solid var(--border-color);
          padding: 10px 24px;
          border-radius: 60px;
          font-weight: 600;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .categoria-btn.active {
          background: #ff1e2d;
          color: white;
          border-color: #ff1e2d;
        }
        
        .clubes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }
        
        .clube-card {
          background: var(--bg-card);
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          transition: transform 0.2s;
          display: flex;
          flex-direction: column;
          height: 100%;
          cursor: pointer;
        }
        
        .clube-card:hover {
          transform: translateY(-4px);
        }
        
        .clube-capa {
          position: relative;
          height: 120px;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .clube-capa img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .clube-avatar-wrapper {
          position: absolute;
          bottom: -30px;
          left: 20px;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px;
        }
        
        .clube-avatar-wrapper img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .clube-content {
          padding: 40px 20px 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .clube-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
        }
        
        .clube-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
          flex: 1;
        }
        
        .clube-tipo {
          background: #ff1e2d20;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: #ff1e2d;
          white-space: nowrap;
          flex-shrink: 0;
        }
        
        .clube-descricao {
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 16px;
          flex: 1;
        }
        
        .clube-stats {
          margin-bottom: 16px;
          padding: 12px 0;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        
        .stat:last-child {
          margin-bottom: 0;
        }
        
        .stat i {
          color: #ff1e2d;
        }
        
        .btn-entrar {
          width: 100%;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 10px;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 10px;
          flex-shrink: 0;
        }
        
        .clube-member-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }
        
        .btn-membro {
          flex: 1;
          background: var(--chat-bg);
          border: 1px solid var(--border-color);
          padding: 10px;
          border-radius: 40px;
          color: #10b981;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: 0.2s;
        }
        
        .btn-membro:hover {
          background: #10b98120;
          border-color: #10b981;
        }
        
        .btn-chat {
          flex: 1;
          background: transparent;
          border: 1px solid var(--border-color);
          padding: 10px;
          border-radius: 40px;
          color: var(--text-primary);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: 0.2s;
          flex-shrink: 0;
        }
        
        .btn-chat:hover {
          background: #ff1e2d20;
          border-color: #ff1e2d;
          color: #ff1e2d;
        }
        
        .chat-section {
          margin-top: 40px;
          padding-top: 40px;
          border-top: 1px solid var(--border-color);
        }
        
        .chat-selector {
          margin-top: 40px;
          padding: 20px;
          background: var(--bg-card);
          border-radius: 20px;
          border: 1px solid var(--border-color);
        }
        
        .chat-selector h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .chat-clubes-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .chat-clube-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--chat-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          cursor: pointer;
          transition: 0.2s;
          width: 100%;
          text-align: left;
        }
        
        .chat-clube-btn:hover {
          background: #ff1e2d10;
          border-color: #ff1e2d;
          transform: translateX(4px);
        }
        
        .chat-clube-btn img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .chat-clube-btn div {
          flex: 1;
        }
        
        .chat-clube-btn strong {
          display: block;
          font-size: 16px;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        
        .chat-clube-btn span {
          font-size: 12px;
          color: var(--text-secondary);
        }
        
        .chat-clube-btn i {
          color: var(--text-light);
        }
        
        .empty-clubes {
          text-align: center;
          padding: 60px;
          background: var(--bg-card);
          border-radius: 24px;
        }
        
        .empty-clubes i {
          font-size: 48px;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }
        
        .empty-clubes h3 {
          font-size: 20px;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        
        .empty-clubes p {
          color: var(--text-secondary);
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 20px;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid var(--border-color);
          border-top: 3px solid #ff1e2d;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 20px;
          }
          .clubes-grid {
            grid-template-columns: 1fr;
          }
          .search-bar {
            width: 100%;
          }
          .clube-header {
            flex-wrap: wrap;
          }
          .clube-tipo {
            white-space: normal;
          }
          .clube-member-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  )
}

export default Clubes