import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationContext'
import { desafiosData } from '../data/desafiosData'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'

const Desafios = () => {
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const [activeCategory, setActiveCategory] = useState('tempo')
  const [participados, setParticipados] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('forza_desafios_participados')
    if (saved) setParticipados(JSON.parse(saved))
  }, [])

  const handleParticipar = async (id, titulo) => {
    if (participados.includes(id)) {
      addNotification('Desafio', `Você já está participando do desafio "${titulo}"!`, 'warning', 'fa-exclamation-circle')
      return
    }
    
    const confirmed = await window.confirm(`Deseja participar do desafio "${titulo}"?\n\nComplete a meta e ganhe esta medalha exclusiva!`)
    if (confirmed) {
      const newParticipados = [...participados, id]
      setParticipados(newParticipados)
      localStorage.setItem('forza_desafios_participados', JSON.stringify(newParticipados))
      addNotification('Desafio iniciado!', `Você começou o desafio "${titulo}". Complete a meta e ganhe sua medalha!`, 'success', 'fa-trophy')
    }
  }

  const handleParticiparForza = async () => {
    const desafioForzaId = 'forza_10min_10dias'
    if (participados.includes(desafioForzaId)) {
      addNotification('Desafio', 'Você já está participando do desafio FORZA!', 'warning', 'fa-exclamation-circle')
      return
    }
    
    const confirmed = await window.confirm('Deseja participar do desafio FORZA?\n\nComplete 10 minutos de atividade por 10 dias e ganhe uma medalha exclusiva!')
    if (confirmed) {
      const newParticipados = [...participados, desafioForzaId]
      setParticipados(newParticipados)
      localStorage.setItem('forza_desafios_participados', JSON.stringify(newParticipados))
      addNotification('Desafio iniciado!', 'Você começou o desafio FORZA. Complete a meta e ganhe sua medalha!', 'success', 'fa-trophy')
    }
  }

  const handlePararDeParticipar = async (desafioId, titulo) => {
    const confirmed = await window.confirm(`Deseja parar de participar do desafio "${titulo}"?\n\nSeu progresso será perdido.`)
    if (confirmed) {
      const newParticipados = participados.filter(id => id !== desafioId)
      setParticipados(newParticipados)
      localStorage.setItem('forza_desafios_participados', JSON.stringify(newParticipados))
      addNotification('Desafio cancelado', `Você cancelou sua participação no desafio "${titulo}".`, 'info', 'fa-person-swimming')
    }
  }

  const handleVerDesafio = (desafioId, titulo) => {
    // Salvar o desafio selecionado no localStorage para a página de detalhes
    localStorage.setItem('desafio_selecionado', JSON.stringify({ id: desafioId, titulo }))
    navigate(`/desafio/${desafioId}`)
  }

  const getIconClass = (category) => {
    switch(category) {
      case 'tempo': return 'fa-clock'
      case 'distancia': return 'fa-road'
      case 'calorias': return 'fa-fyre'
      default: return 'fa-trophy'
    }
  }

  const renderCard = (desafio, category) => {
    const isParticipando = participados.includes(desafio.id)
    const iconClass = getIconClass(category)
    
    return (
      <div key={desafio.id} className="desafio-card">
        <div className="card-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('${desafio.bgImage}')` }}>
          <img src={desafio.medalhaImg} className="hero-medalha" alt="Medalha" />
        </div>
        <div className="desafio-card-content">
          <h3>{desafio.titulo}</h3>
          <p className="desafio-descricao">
            <i className={`fas ${iconClass}`}></i> {desafio.descricao}
          </p>
          <p className="desafio-data">
            <i className="fa-solid fa-calendar"></i> {desafio.data}
          </p>
          <button 
            className={`btn-participar-card ${isParticipando ? 'btn-participado' : ''}`}
            onClick={() => handleParticipar(desafio.id, desafio.titulo)}
            disabled={isParticipando}
          >
            <i className={`fas ${isParticipando ? 'fa-check-circle' : 'fa-play'}`}></i>
            {isParticipando ? 'Participando' : 'Participar'}
          </button>
          {isParticipando && (
            <div className="desafio-actions">
              <button 
                className="btn-ver-desafio"
                onClick={() => handleVerDesafio(desafio.id, desafio.titulo)}
              >
                <i className="fas fa-eye"></i> Ver Desafio
              </button>
              <button 
                className="btn-parar-participar"
                onClick={() => handlePararDeParticipar(desafio.id, desafio.titulo)}
              >
                <i className="fas fa-stop"></i> Parar
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const isParticipandoForza = participados.includes('forza_10min_10dias')

  return (
    <>
      <Header />
      
      <div className="container">
        {/* Card Principal FORZA */}
        <div className="desafio-forza-card">
          <div className="desafio-forza-content">
            <div className="forza-logo">
              <img src="/img/logo.png.png" alt="Forza" />
            </div>
            <div className="desafio-forza-info">
              <div className="desafio-forza-item">
                <i className="fa-solid fa-chart-line"></i>
                <p>Forza 10 minutos de atividade por 10 dias.</p>
              </div>
              <div className="desafio-forza-item">
                <i className="fa-solid fa-medal"></i>
                <p>Ganhe uma medalha digital de participação para a sua Coleção de Desafios Completos.</p>
              </div>
              <div className="desafio-forza-item">
                <i className="fa-solid fa-calendar"></i>
                <p>1 de mar. de 2026 a 31 de mar. de 2026</p>
              </div>
            </div>
            {!isParticipandoForza ? (
              <button 
                className="btn-participar-forza"
                onClick={handleParticiparForza}
              >
                <i className="fas fa-play"></i>
                PARTICIPAR DO DESAFIO
              </button>
            ) : (
              <div className="desafio-participando-actions">
                <button 
                  className="btn-ver-desafio-forza"
                  onClick={() => handleVerDesafio('forza_10min_10dias', 'Forza 10min x 10 dias')}
                >
                  <i className="fas fa-eye"></i> Ver Desafio
                </button>
                <button 
                  className="btn-parar-participar-forza"
                  onClick={() => handlePararDeParticipar('forza_10min_10dias', 'Forza 10min x 10 dias')}
                >
                  <i className="fas fa-stop"></i> Parar de Participar
                </button>
              </div>
            )}
          </div>
          <div className="desafio-forza-banner">
            <img src="/img/desafios.png" alt="Desafio Forza" />
          </div>
        </div>

        <div className="categoria-tabs">
          <button className={`categoria-btn ${activeCategory === 'tempo' ? 'active' : ''}`} onClick={() => setActiveCategory('tempo')}>
            <i className="fas fa-running"></i> Corrida
          </button>
          <button className={`categoria-btn ${activeCategory === 'distancia' ? 'active' : ''}`} onClick={() => setActiveCategory('distancia')}>
            <i className="fas fa-bicycle"></i> Ciclismo
          </button>
          <button className={`categoria-btn ${activeCategory === 'calorias' ? 'active' : ''}`} onClick={() => setActiveCategory('calorias')}>
            <i className="fas fa-person-swimming"></i> Natação
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
            {desafiosData[activeCategory] && desafiosData[activeCategory].length > 0 ? (
              desafiosData[activeCategory].map(desafio => renderCard(desafio, activeCategory))
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
        
        /* Card Principal FORZA */
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
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .btn-ver-desafio-forza {
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
        
        .btn-ver-desafio-forza:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 14px rgba(255, 30, 45, 0.5);
        }
        
        .btn-parar-participar-forza {
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
        
        .desafio-descricao, .desafio-data {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          margin-bottom: 12px;
          color: var(--text-secondary);
        }
        
        .desafio-descricao i, .desafio-data i {
          color: #ff1e2d;
          width: 20px;
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
          cursor: default;
          opacity: 0.9;
        }
        
        .desafio-actions {
          display: flex;
          gap: 10px;
          margin-top: 12px;
        }
        
        .btn-ver-desafio {
          flex: 1;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 10px;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        
        .btn-ver-desafio:hover {
          transform: scale(1.02);
        }
        
        .btn-parar-participar {
          flex: 1;
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
          .desafio-participando-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  )
}

export default Desafios