import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { usuarios, postsData } from '../data/usuariosData'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import Calendar from '../components/Calendar'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const Perfil = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { addNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState('geral')
  const [posts, setPosts] = useState([])
  const [activeSports, setActiveSports] = useState(['running', 'cycling', 'swimming'])
  const weeklyCanvasRef = useRef(null)
  const [weeklyChart, setWeeklyChart] = useState(null)

  // Dados de atividades por esporte
  const weeklyData = {
    running: [0, 4.2, 8.1, 0, 5.9, 0, 2.3],
    cycling: [0, 0, 12.4, 0, 14.2, 0, 19.8],
    swimming: [0, 1.5, 0, 2.0, 0, 1.8, 0]
  }

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  // Calcular dados combinados baseado nos esportes ativos
  const getCombinedData = () => {
    const combined = days.map((_, index) => {
      return activeSports.reduce((sum, sport) => sum + (weeklyData[sport]?.[index] || 0), 0)
    })
    return combined
  }

  // Configuração do gráfico
  const chartData = {
    labels: days,
    datasets: [
      {
        label: 'Distância (km)',
        data: getCombinedData(),
        backgroundColor: '#ff1e2d',
        borderRadius: 5,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.raw} km`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: { size: 11 }
        }
      },
      y: {
        display: false,
        beginAtZero: true
      }
    }
  }

  useEffect(() => {
    // Filtrar posts do usuário logado
    const userPosts = postsData.filter(p => p.usuarioId === 1)
    setPosts(userPosts)
  }, [])

  const handleLogout = async () => {
  const confirmed = await window.confirm('Tem certeza que deseja sair da sua conta?')
    if (confirmed) {
      logout()
      addNotification('Até logo!', 'Você saiu da sua conta. Volte sempre!', 'info', 'fa-sign-out-alt')
      navigate('/login')
    }
  }

  const compartilharPerfil = () => {
    navigator.clipboard.writeText(window.location.href)
    addNotification('🔗 Link copiado!', 'Link do seu perfil copiado para compartilhar.', 'success', 'fa-share')
  }

  const toggleEsporte = (sport) => {
    setActiveSports(prev => {
      if (prev.includes(sport)) {
        return prev.filter(s => s !== sport)
      } else {
        return [...prev, sport]
      }
    })
  }

  return (
    <>
      <Header />
      
      <div className="perfil-page">
        <div className="hero-cover">
          <img src="/img/banner_perfil.png" alt="Capa" />
          <button className="edit-cover" onClick={() => addNotification('🖼️ Capa', 'Edição de capa em breve!', 'info', 'fa-camera')}>
            <i className="fas fa-camera"></i> Editar capa
          </button>
        </div>

        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-info">
              <img src={user?.avatar || "/img/usuarios/vitor_vaz.jpg"} className="profile-avatar" alt="Perfil" />
              <div>
                <div className="nome">
                  {user?.nome || "Vitor Vaz"}
                  <button className="btn-edit-profile" onClick={() => addNotification('✏️ Editar', 'Edição de perfil em breve!', 'info', 'fa-pen')}>
                    <i className="fa-regular fa-pen-to-square"></i> Editar perfil
                  </button>
                  <button className="btn-logout" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i> Sair
                  </button>
                </div>
                <div className="profile-stats">
                  <div className="stat"><strong>132</strong><span>Atividades</span></div>
                  <div className="stat"><strong>120</strong><span>Seguindo</span></div>
                  <div className="stat"><strong>53</strong><span>Seguidores</span></div>
                </div>
                <div className="profile-location">
                  <i className="fa-solid fa-location-dot"></i> São José dos Campos, SP · Brasil
                </div>
                <div className="profile-bio">
                  Apaixonado por corrida e ciclismo | Maratonista | Treinando para Ironman
                </div>
              </div>
            </div>
            <button className="btn-share" onClick={compartilharPerfil}>
              <i className="fa-solid fa-share-nodes"></i> Compartilhar perfil
            </button>
          </div>
        </div>

        <div className="main-layout">
          <div>
            <div className="tabs-container">
              <button className={`tab-button ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>
                Visão geral
              </button>
              <button className={`tab-button ${activeTab === 'desafios' ? 'active' : ''}`} onClick={() => setActiveTab('desafios')}>
                Desafios Completos
              </button>
            </div>

            {activeTab === 'geral' ? (
              <div className="feed">
                {posts.map(post => (
                  <div key={post.id} className="feed-card">
                    <div className="feed-header">
                      <img src={post.avatar} className="feed-avatar" alt={post.usuario} />
                      <div>
                        <div className="feed-name">{post.usuario}</div>
                        <div className="feed-meta">{post.data} • <i className="fas fa-map-marker-alt"></i> {post.local}</div>
                      </div>
                    </div>
                    <div className="feed-activity">
                      <i className={`fas ${post.icone}`}></i> {post.atividade}
                    </div>
                    <div className="feed-metrics">
                      {post.metricas.map((m, idx) => (
                        <div key={idx} className="metric">
                          <div className="metric-label">{m.label}</div>
                          <div className="metric-value">{m.valor}</div>
                        </div>
                      ))}
                    </div>
                    <div className="feed-images">
                      <div className="image-grid">
                        {post.imagens.map((img, idx) => (
                          <img key={idx} src={img} alt="Atividade" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-desafios">
                <i className="fas fa-trophy"></i>
                <h3>Desafios Completos</h3>
                <p>Você ainda não completou nenhum desafio. Comece agora!</p>
                <button className="btn" onClick={() => navigate('/desafios')}>Ver desafios</button>
              </div>
            )}
          </div>

          <div className="sidebar">
            {/* Card Total de Atividades com Gráfico */}
          
          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '35.5px', paddingTop: '25px' }}>
            <div className="sidebar-card">
              <h3><i className="fas fa-calendar-alt"></i> Calendário de Atividades</h3>
              <Calendar />
            </div>

<br />

            <div className="sidebar-card">
              <div className="sidebar-title">
                <i className="fa-regular fa-calendar-check"></i> Total de Atividades
              </div>
              <div className="big-stat-number">132</div>
              <div className="big-sub">Últimas 4 semanas</div>
              
              <div className="modality-toggles">
                <div 
                  className={`modality-btn ${activeSports.includes('running') ? 'active' : ''}`} 
                  onClick={() => toggleEsporte('running')}
                >
                  <i className="fa-solid fa-person-running"></i><span>Corrida</span>
                </div>
                <div 
                  className={`modality-btn ${activeSports.includes('cycling') ? 'active' : ''}`} 
                  onClick={() => toggleEsporte('cycling')}
                >
                  <i className="fa-solid fa-person-biking"></i><span>Bike</span>
                </div>
                <div 
                  className={`modality-btn ${activeSports.includes('swimming') ? 'active' : ''}`} 
                  onClick={() => toggleEsporte('swimming')}
                >
                  <i className="fa-solid fa-person-swimming"></i><span>Natação</span>
                </div>
              </div>
              
              <div className="chart-section-label">Esta semana · km por dia</div>
              <div className="chart-wrap">
                <Bar data={chartData} options={chartOptions} />
              </div>
              
              
                <div className="chart-section-label">Este ano</div>
                <div className="year-stat-row">
                  <div className="year-stat-label"><i className="fa-solid fa-ruler"></i> Distância total</div>
                  <div className="year-stat-val">77,4 km</div>
                </div>
                <div className="year-stat-row">
                  <div className="year-stat-label"><i className="fa-regular fa-clock"></i> Tempo total</div>
                  <div className="year-stat-val">11h 42min</div>
                </div>
              </div>
            </div>

            {/* Distância por mês */}
            <div className="sidebar-card">
              <h3><i className="fa-solid fa-chart-bar"></i> Distância por mês</h3>
              <div className="monthly-stats">
                <div className="month-item">
                  <span>Janeiro</span>
                  <div className="bar"><div style={{ width: '70%' }}></div></div>
                  <span>142 km</span>
                </div>
                <div className="month-item">
                  <span>Fevereiro</span>
                  <div className="bar"><div style={{ width: '85%' }}></div></div>
                  <span>168 km</span>
                </div>
                <div className="month-item">
                  <span>Março</span>
                  <div className="bar"><div style={{ width: '60%' }}></div></div>
                  <span>120 km</span>
                </div>
              </div>
            </div>

            {/* Clubes Participantes */}
            <div className="sidebar-card">
              <h3><i className="fa-solid fa-users"></i> Clubes Participantes</h3>
              <div className="club-list">
                <div className="club-item" onClick={() => navigate('/clubes')}>
                  <div className="club-icon"><img src="/img//outros/corredores_sjc.png" alt="Clube" /></div>
                  <span>Corredores de SJC e Região</span>
                  <i className="fas fa-chevron-right"></i>
                </div>
                <div className="club-item" onClick={() => navigate('/clubes')}>
                  <div className="club-icon"><img src="/img/outros/ciclotech.png" alt="Clube" /></div>
                  <span>Ciclotech</span>
                  <i className="fas fa-chevron-right"></i>
                </div>
                <div className="club-item" onClick={() => navigate('/clubes')}>
                  <div className="club-icon"><img src="/img/forza icon.png" alt="Clube" /></div>
                  <span>Forza</span>
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .perfil-page {
          background: var(--bg-primary);
          min-height: 100vh;
          padding-bottom: 100px;
        }
        
        .hero-cover {
          width: 100%;
          height: 160px;
          overflow: hidden;
          position: relative;
          background: #1e293b;
        }
        
        .hero-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .edit-cover {
          position: absolute;
          bottom: 15px;
          right: 20px;
          background: rgba(0,0,0,0.6);
          border: none;
          padding: 8px 16px;
          border-radius: 30px;
          color: white;
          font-size: 12px;
          cursor: pointer;
        }
        
        .profile-container {
          max-width: 1200px;
          margin: -40px auto 30px;
          padding: 0 20px;
          position: relative;
          z-index: 2;
        }
        
        .profile-card {
          background: var(--bg-card);
          border-radius: 28px;
          padding: 24px 32px;
          box-shadow: var(--shadow);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          border: 1px solid var(--border-color);
        }
        
        .profile-info {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        
        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #ff1e2d;
        }
        
        .nome {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        
        .btn-edit-profile, .btn-logout {
          background: var(--border-light);
          border: none;
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        
        .btn-logout {
          background: rgba(255, 30, 45, 0.15);
          border: 1px solid #ff1e2d;
          color: #ff1e2d;
        }
        
        .btn-edit-profile:hover {
          background: #ff1e2d;
          color: white;
        }
        
        .profile-stats {
          display: flex;
          gap: 32px;
          margin-bottom: 12px;
        }
        
        .stat {
          text-align: center;
        }
        
        .stat strong {
          font-size: 22px;
          font-weight: 800;
          color: #ff1e2d;
          display: block;
        }
        
        .stat span {
          font-size: 12px;
          color: var(--text-secondary);
        }
        
        .profile-location, .profile-bio {
          color: var(--text-secondary);
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }
        
        .btn-share {
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 12px 24px;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .main-layout {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
        }
        
        .tabs-container {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .tab-button {
          background: transparent;
          border: none;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          position: relative;
        }
        
        .tab-button.active {
          color: #ff1e2d;
        }
        
        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #ff1e2d;
        }
        
        .feed {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-height: 1296px; /* ADICIONE ESTA LINHA - controle a altura máxima */
          overflow-y: auto;  /* ADICIONE ESTA LINHA - permite rolagem quando exceder */
          padding-right: 10px; /* ADICIONE ESTA LINHA - espaço para a barra de rolagem */
        }
        
        .feed-card {
          background: var(--bg-card);
          border-radius: 20px;
          padding: 20px;
          border: 1px solid var(--border-color);
        }
        
        .feed-header {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .feed-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .feed-name {
          font-weight: 700;
          color: var(--text-primary);
        }
        
        .feed-meta {
          font-size: 11px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }
        
        .feed-activity {
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: var(--text-primary);
        }
        
        .feed-metrics {
          display: flex;
          gap: 20px;
          background: var(--chat-bg);
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 16px;
        }
        
        .metric {
          flex: 1;
          text-align: center;
        }
        
        .metric-label {
          font-size: 11px;
          color: var(--text-secondary);
        }
        
        .metric-value {
          font-size: 14px;
          font-weight: 700;
          color: #ff1e2d;
        }
        
        .feed-images .image-grid {
          display: flex;
          gap: 12px;
        }
        
        .feed-images img {
          width: calc(50% - 6px);
          border-radius: 16px;
          aspect-ratio: 1/1;
          object-fit: cover;
        }
        
        .empty-desafios {
          background: var(--bg-card);
          border-radius: 24px;
          padding: 60px;
          text-align: center;
          border: 1px solid var(--border-color);
        }
        
        .empty-desafios i {
          font-size: 48px;
          color: #ff1e2d;
          margin-bottom: 16px;
        }
        
        .empty-desafios .btn {
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 10px 24px;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          margin-top: 16px;
        }
        
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .sidebar-card {
          background: var(--bg-card);
          border-radius: 24px;
          padding: 20px;
          border: 1px solid var(--border-color);
        }
        
        .sidebar-card h3 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
        }
        
        .sidebar-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
        }
        
        .big-number {
          font-size: 36px;
          font-weight: 800;
          color: #ff1e2d;
        }
        
        .big-sub {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }
        
        .modality-toggles {
          display: flex;
          gap: 12px;
          margin: 16px 0;
        }
        
        .modality-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          border-radius: 30px;
          background: var(--chat-bg);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: 0.2s;
          color: var(--text-secondary);
          font-size: 12px;
        }
        
        .modality-btn.active {
          background: #ff1e2d;
          color: white;
          border-color: #ff1e2d;
        }
        
        .chart-section-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        
        .chart-wrap {
          height: 180px;
          margin: 8px 0;
        }
        
        .year-stat-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }
        
        .year-stat-label {
          font-size: 12px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .year-stat-val {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }
        
        .monthly-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .month-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
        }
        
        .month-item .bar {
          flex: 1;
          height: 6px;
          background: var(--progress-bg);
          border-radius: 10px;
          overflow: hidden;
        }
        
        .month-item .bar div {
          height: 100%;
          background: #ff1e2d;
          border-radius: 10px;
        }
        
        .club-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .club-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          cursor: pointer;
        }
        
        .club-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
        }
        
        .club-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .club-item span {
          flex: 1;
          font-size: 13px;
          color: var(--text-primary);
        }
        
        .club-item i {
          color: var(--text-light);
        }
        
        @media (max-width: 768px) {
          .main-layout {
            grid-template-columns: 1fr;
          }
          .profile-card {
            flex-direction: column;
            text-align: center;
          }
          .profile-info {
            flex-direction: column;
          }
          .profile-stats {
            justify-content: center;
          }
          .feed-images .image-grid {
            flex-direction: column;
          }
          .feed-images img {
            width: 100%;
          }
          .modality-toggles {
            flex-direction: column;
          }
          .chart-wrap {
            height: 200px;
          }
        }
      `}</style>
    </>
  )
}

export default Perfil