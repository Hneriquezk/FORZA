import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'

const Desafios = () => {
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState('tempo')
  const [desafios, setDesafios] = useState([])
  const [participacoes, setParticipacoes] = useState({})
  const [loading, setLoading] = useState(true)

  // ==================== CARREGAR DESAFIOS DO BANCO ====================
  const carregarDesafios = async () => {
    try {
      console.log('🔄 [Desafios] Carregando desafios...')
      const { data, error } = await supabase
        .from('desafios')
        .select('*')
        .eq('ativo', true)
        .order('categoria', { ascending: true })
      
      if (error) throw error
      setDesafios(data || [])
      console.log('✅ [Desafios] Desafios carregados:', data?.length || 0)
    } catch (error) {
      console.error('❌ [Desafios] Erro ao carregar desafios:', error)
    }
  }

  // ==================== CARREGAR PARTICIPAÇÕES DO USUÁRIO ====================
  const carregarParticipacoes = async () => {
    if (!user) return
    
    try {
      console.log('🔄 [Desafios] Carregando participações...')
      const { data, error } = await supabase
        .from('desafio_usuario')
        .select('*')
        .eq('usuario_id', user.id)
      
      if (error) throw error
      
      const participacoesMap = {}
      data?.forEach(item => {
        participacoesMap[item.desafio_id] = {
          progresso: item.progresso_atual,
          completado: item.completado,
          data_inicio: item.data_inicio,
          id: item.id
        }
      })
      setParticipacoes(participacoesMap)
      console.log('✅ [Desafios] Participações carregadas:', Object.keys(participacoesMap).length)
    } catch (error) {
      console.error('❌ [Desafios] Erro ao carregar participações:', error)
    }
  }

  // ==================== PARTICIPAR DO DESAFIO ====================
  const handleParticipar = async (desafio) => {
    if (!user) {
      addNotification('Faça login', 'Você precisa estar logado para participar de desafios.', 'warning')
      navigate('/login')
      return
    }
    
    if (participacoes[desafio.id]) {
      addNotification('Desafio', `Você já está participando do desafio "${desafio.titulo}"!`, 'warning')
      return
    }
    
    const confirmed = await window.confirm(`Deseja participar do desafio "${desafio.titulo}"?\n\n${desafio.descricao}`)
    if (!confirmed) return
    
    try {
      console.log('🔄 [Desafios] Participando do desafio:', desafio.id)
      
      const { data, error } = await supabase
        .from('desafio_usuario')
        .insert([{
          usuario_id: user.id,
          desafio_id: desafio.id,
          progresso_atual: 0,
          completado: false,
          data_inicio: new Date()
        }])
        .select()
      
      if (error) throw error
      
      if (data && data[0]) {
        setParticipacoes(prev => ({
          ...prev,
          [desafio.id]: {
            progresso: 0,
            completado: false,
            data_inicio: data[0].data_inicio,
            id: data[0].id
          }
        }))
      }
      
      addNotification('Desafio iniciado!', `Você começou o desafio "${desafio.titulo}". Complete a meta e ganhe sua medalha!`, 'success', 'fa-trophy')
      console.log('✅ [Desafios] Participou com sucesso!')
    } catch (error) {
      console.error('❌ [Desafios] Erro ao participar:', error)
      addNotification('Erro', 'Não foi possível participar do desafio', 'error')
    }
  }

  // ==================== PARAR DE PARTICIPAR ====================
  const handlePararDeParticipar = async (desafio, participacaoId) => {
    const confirmed = await window.confirm(`Deseja parar de participar do desafio "${desafio.titulo}"?\n\nSeu progresso será perdido.`)
    if (!confirmed) return
    
    try {
      console.log('🔄 [Desafios] Parando de participar...')
      
      const { error } = await supabase
        .from('desafio_usuario')
        .delete()
        .eq('id', participacaoId)
        .eq('usuario_id', user.id)
      
      if (error) throw error
      
      const newParticipacoes = { ...participacoes }
      delete newParticipacoes[desafio.id]
      setParticipacoes(newParticipacoes)
      
      addNotification('Desafio cancelado', `Você cancelou sua participação no desafio "${desafio.titulo}".`, 'info')
      console.log('✅ [Desafios] Cancelou participação!')
    } catch (error) {
      console.error('❌ [Desafios] Erro ao cancelar:', error)
      addNotification('Erro', 'Não foi possível cancelar sua participação', 'error')
    }
  }

  // ==================== VER DESAFIO ====================
  const handleVerDesafio = (desafio) => {
    navigate(`/desafio/${desafio.id}`)
  }

  // ==================== ESCUTAR MUDANÇAS EM TEMPO REAL ====================
  useEffect(() => {
    if (!user) return
    
    const participacoesSubscription = supabase
      .channel('desafio_usuario_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'desafio_usuario', filter: `usuario_id=eq.${user.id}` },
        () => {
          console.log('📢 [Desafios] Mudança detectada nas participações')
          carregarParticipacoes()
        }
      )
      .subscribe()
    
    return () => {
      participacoesSubscription.unsubscribe()
    }
  }, [user])

  // ==================== LOADING INICIAL ====================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await carregarDesafios()
      await carregarParticipacoes()
      setLoading(false)
    }
    loadData()
  }, [user])

  // ==================== FILTRAR DESAFIOS POR CATEGORIA ====================
  const getDesafiosPorCategoria = (categoria) => {
    if (categoria === 'tempo') {
      return desafios.filter(d => d.tipo === 'tempo' && d.categoria !== 'Forza')
    } else if (categoria === 'distancia') {
      return desafios.filter(d => d.tipo === 'distancia' && d.categoria !== 'Forza')
    } else if (categoria === 'calorias') {
      return desafios.filter(d => d.tipo === 'calorias' && d.categoria !== 'Forza')
    }
    return []
  }

  // ==================== PEGAR DESAFIO FORZA ====================
  const getDesafioForza = () => {
    return desafios.find(d => d.categoria === 'Forza')
  }

  const getIconClass = (category) => {
    switch(category) {
      case 'tempo': return 'fa-clock'
      case 'distancia': return 'fa-road'
      case 'calorias': return 'fa-fire'
      default: return 'fa-trophy'
    }
  }

  const getCategoriaIcone = (categoria) => {
    switch(categoria) {
      case 'Corrida': return 'fa-running'
      case 'Ciclismo': return 'fa-bicycle'
      case 'Natação': return 'fa-water'
      default: return 'fa-trophy'
    }
  }

  const renderCard = (desafio) => {
    const isParticipando = participacoes[desafio.id]
    const participacao = participacoes[desafio.id]
    const percentual = participacao ? (participacao.progresso / desafio.total_meta) * 100 : 0
    
    return (
      <div key={desafio.id} className="desafio-card">
        <div className="card-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('${desafio.bg_imagem || '/img/desafios/default_bg.jpg'}')` }}>
          <img src={desafio.medalha_imagem || '/img/medalhas/default.png'} className="hero-medalha" alt="Medalha" />
        </div>
        <div className="desafio-card-content">
          <h3>{desafio.titulo}</h3>
          <p className="desafio-descricao">
            <i className="fas fa-bullseye"></i> {desafio.descricao}
          </p>
          <p className="desafio-meta">
            <i className="fas fa-flag-checkered"></i> Meta: {desafio.meta}
          </p>
          <p className="desafio-data">
            <i className="fa-solid fa-calendar"></i> Até {new Date(desafio.data_fim).toLocaleDateString('pt-BR')}
          </p>
          
          {isParticipando && (
            <div className="desafio-progresso">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${percentual}%` }}></div>
              </div>
              <div className="progress-text">
                {participacao.progresso} / {desafio.total_meta} ({Math.round(percentual)}%)
              </div>
            </div>
          )}
          
          <button 
            className={`btn-participar-card ${isParticipando ? 'btn-participado' : ''}`}
            onClick={() => isParticipando ? handleVerDesafio(desafio) : handleParticipar(desafio)}
          >
            <i className={`fas ${isParticipando ? 'fa-eye' : 'fa-play'}`}></i>
            {isParticipando ? 'Ver Desafio' : 'Participar'}
          </button>
          
          {isParticipando && (
            <div className="desafio-actions">
              <button 
                className="btn-parar-participar"
                onClick={() => handlePararDeParticipar(desafio, participacao.id)}
              >
                <i className="fas fa-stop"></i> Parar
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const desafioForza = getDesafioForza()
  const isParticipandoForza = desafioForza ? participacoes[desafioForza.id] : false
  const participacaoForza = desafioForza ? participacoes[desafioForza.id] : null
  const percentualForza = participacaoForza ? (participacaoForza.progresso / desafioForza.total_meta) * 100 : 0

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando desafios...</p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <div className="container">
        {/* Card Principal FORZA */}
        {desafioForza && (
          <div className="desafio-forza-card">
            <div className="desafio-forza-content">
              <div className="forza-logo">
                <img src="/img/logo.png.png" alt="Forza" />
              </div>
              <div className="desafio-forza-info">
                <div className="desafio-forza-item">
                  <i className="fa-solid fa-chart-line"></i>
                  <p>{desafioForza.descricao}</p>
                </div>
                <div className="desafio-forza-item">
                  <i className="fa-solid fa-medal"></i>
                  <p>Ganhe uma medalha digital de participação para a sua Coleção de Desafios Completos.</p>
                </div>
                <div className="desafio-forza-item">
                  <i className="fa-solid fa-calendar"></i>
                  <p>{new Date(desafioForza.data_inicio).toLocaleDateString('pt-BR')} a {new Date(desafioForza.data_fim).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              
              {isParticipandoForza ? (
                <div className="desafio-participando-actions">
                  <div className="desafio-progresso-forza">
                    <div className="progress-bar">
                      <div className="progress-fill red" style={{ width: `${percentualForza}%` }}></div>
                    </div>
                    <div className="progress-text">
                      {participacaoForza.progresso} / {desafioForza.total_meta} dias ({Math.round(percentualForza)}%)
                    </div>
                  </div>
                  <div className="buttons-group">
                    <button 
                      className="btn-ver-desafio-forza"
                      onClick={() => handleVerDesafio(desafioForza)}
                    >
                      <i className="fas fa-eye"></i> Ver Desafio
                    </button>
                    <button 
                      className="btn-parar-participar-forza"
                      onClick={() => handlePararDeParticipar(desafioForza, participacaoForza.id)}
                    >
                      <i className="fas fa-stop"></i> Parar de Participar
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="btn-participar-forza"
                  onClick={() => handleParticipar(desafioForza)}
                >
                  <i className="fas fa-play"></i>
                  PARTICIPAR DO DESAFIO
                </button>
              )}
            </div>
            <div className="desafio-forza-banner">
              <img src={desafioForza.bg_imagem || "/img/desafios.png"} alt="Desafio Forza" />
            </div>
          </div>
        )}

        <div className="categoria-tabs">
          <button className={`categoria-btn ${activeCategory === 'tempo' ? 'active' : ''}`} onClick={() => setActiveCategory('tempo')}>
            <i className="fas fa-clock"></i> Tempo
          </button>
          <button className={`categoria-btn ${activeCategory === 'distancia' ? 'active' : ''}`} onClick={() => setActiveCategory('distancia')}>
            <i className="fas fa-road"></i> Distância
          </button>
          <button className={`categoria-btn ${activeCategory === 'calorias' ? 'active' : ''}`} onClick={() => setActiveCategory('calorias')}>
            <i className="fas fa-fire"></i> Calorias
          </button>
        </div>

        <div className="desafios-section">
          <div className="section-title">
            <i className={`fas ${getIconClass(activeCategory)}`}></i>
            {activeCategory === 'tempo' && 'Desafios de Tempo'}
            {activeCategory === 'distancia' && 'Desafios de Distância'}
            {activeCategory === 'calorias' && 'Desafios de Calorias'}
          </div>
          <div className="desafios-grid">
            {getDesafiosPorCategoria(activeCategory).length > 0 ? (
              getDesafiosPorCategoria(activeCategory).map(desafio => renderCard(desafio))
            ) : (
              <div className="empty-state">
                <i className="fas fa-trophy"></i>
                <p>Nenhum desafio disponível nesta categoria no momento.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px 60px;
          padding-bottom: 100px;
        }
        
        .desafio-forza-card {
          background: var(--bg-card);
          border-radius: 28px;
          overflow: hidden;
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 48px;
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .desafio-forza-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
        }
        
        .desafio-forza-content {
          flex: 2;
          padding: 36px 32px;
        }
        
        .forza-logo img {
          height: 36px;
          margin-bottom: 20px;
        }
        
        .desafio-forza-info {
          margin-bottom: 24px;
        }
        
        .desafio-forza-item {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
          color: var(--text-secondary);
          font-size: 14px;
        }
        
        .desafio-forza-item i {
          color: #ff1e2d;
          font-size: 18px;
          width: 26px;
        }
        
        .desafio-forza-item p {
          margin: 0;
          line-height: 1.4;
        }
        
        .btn-participar-forza {
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 12px 20px;
          border-radius: 40px;
          color: white;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
          width: auto;
          min-width: 700px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .btn-participar-forza:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 4px 14px rgba(255, 30, 45, 0.5);
        }
        
        .desafio-participando-actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .desafio-progresso-forza {
          background: var(--chat-bg);
          padding: 12px;
          border-radius: 12px;
        }
        
        .progress-bar {
          height: 8px;
          background: var(--border-color);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.3s ease;
        }
        
        .progress-fill.red {
          background: #ff1e2d;
        }
        
        .progress-text {
          font-size: 12px;
          color: var(--text-secondary);
          text-align: center;
        }
        
        .buttons-group {
          display: flex;
          gap: 12px;
        }
        
        .btn-ver-desafio-forza {
          flex: 1;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 10px 20px;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .btn-parar-participar-forza {
          flex: 1;
          background: transparent;
          border: 1px solid #ff1e2d;
          padding: 10px 20px;
          border-radius: 40px;
          color: #ff1e2d;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .btn-parar-participar-forza:hover {
          background: #ff1e2d;
          color: white;
        }
        
        .desafio-forza-banner {
          flex: 1;
          background: linear-gradient(135deg, #ff1e2d, #b91c2c);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 280px;
          padding: 0;
          overflow: hidden;
        }
        
        .desafio-forza-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        
        .categoria-tabs {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        
        .categoria-btn {
          background: var(--chat-bg);
          border: 1px solid var(--border-color);
          padding: 10px 28px;
          border-radius: 60px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
        }
        
        .categoria-btn.active {
          background: #ff1e2d;
          color: white;
          border-color: #ff1e2d;
        }
        
        .categoria-btn:hover:not(.active) {
          background: var(--border-light);
          border-color: #ff1e2d;
          color: var(--text-primary);
        }
        
        .desafios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 28px;
          margin-bottom: 50px;
        }
        
        .desafio-card {
          background: var(--bg-card);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
          transition: all 0.25s;
        }
        
        .desafio-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-hover);
        }
        
        .card-hero {
          position: relative;
          padding: 50px 20px;
          text-align: center;
          min-height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-size: cover;
          background-position: center;
        }
        
        .hero-medalha {
          width: 180px;
          height: 180px;
          object-fit: contain;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 8px 20px rgba(0,0,0,0.4));
          transition: transform 0.3s ease;
        }
        
        .desafio-card:hover .hero-medalha {
          transform: scale(1.05);
        }
        
        .desafio-card-content {
          padding: 24px;
          background: var(--bg-card);
        }
        
        .desafio-card-content h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text-primary);
        }
        
        .desafio-descricao, .desafio-meta, .desafio-data {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          margin-bottom: 12px;
          color: var(--text-secondary);
        }
        
        .desafio-descricao i, .desafio-meta i, .desafio-data i {
          color: #ff1e2d;
          width: 20px;
        }
        
        .desafio-progresso {
          margin: 16px 0;
        }
        
        .btn-participar-card {
          width: 100%;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 12px;
          border-radius: 50px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
          margin-top: 20px;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .btn-participar-card:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(255, 30, 45, 0.4);
        }
        
        .btn-participado {
          background: #10b981;
          cursor: pointer;
        }
        
        .desafio-actions {
          display: flex;
          gap: 10px;
          margin-top: 12px;
        }
        
        .btn-parar-participar {
          width: 100%;
          background: transparent;
          border: 1px solid #ff1e2d;
          padding: 10px;
          border-radius: 40px;
          color: #ff1e2d;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        
        .btn-parar-participar:hover {
          background: #ff1e2d;
          color: white;
        }
        
        .section-title {
          font-size: 24px;
          font-weight: 700;
          margin: 30px 0 22px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 4px solid #ff1e2d;
          padding-left: 16px;
          color: var(--text-primary);
        }
        
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px;
          background: var(--bg-card);
          border-radius: 28px;
          border: 1px solid var(--border-color);
        }
        
        .empty-state i {
          font-size: 48px;
          color: #ff1e2d;
          margin-bottom: 16px;
        }
        
        .empty-state p {
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
          .desafio-forza-card {
            flex-direction: column;
          }
          .desafio-forza-banner {
            width: 100%;
            min-height: 200px;
          }
          .desafios-grid {
            grid-template-columns: 1fr;
          }
          .desafio-actions {
            flex-direction: column;
          }
          .buttons-group {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  )
}

export default Desafios