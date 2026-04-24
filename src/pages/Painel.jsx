import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import './painel.css'

function Painel() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [curtidas, setCurtidas] = useState({})
  const [comentarios, setComentarios] = useState({})
  const [comentariosVisiveis, setComentariosVisiveis] = useState({})

  // Dados dos posts
  const postsData = [
    {
      id: 1,
      usuario: "Valmir Borsoi",
      avatar: "/img/usuarios/avatar_walmir.png",
      data: "29 de jan. de 2026, 07:30",
      local: "Vitória, ES, Brazil",
      atividade: "Corrida Matinal em Jardim Camburi",
      icone: "/img/corrida_icon.png",
      metricas: [
        { label: "Distância", valor: "5.0 km" },
        { label: "Tempo", valor: "00:31:06" },
        { label: "Ritmo Média", valor: "6:12/km" }
      ],
      imagens: ["/img/atividades/atividade_walmir.png", "/img/atividades/Jardim_Camburi.png"]
    },
    {
      id: 2,
      usuario: "Henrique Avancini",
      avatar: "/img/usuarios/avatar_avancini.png",
      data: "1 de março de 2026, 13:02",
      local: "Gasabo District, Ruanda",
      atividade: "Stage 8 - Tour Du Rwanda",
      icone: "/img/bike_icon.png",
      metricas: [
        { label: "Distância", valor: "80,99 km" },
        { label: "Tempo", valor: "01:59:23" },
        { label: "Ganho de elev.", valor: "1.663m" }
      ],
      imagens: ["/img/atividades/atividade_avancini.png", "/img/atividades/Rwanda.png"]
    },
    {
      id: 3,
      usuario: "Matheus Januario",
      avatar: "/img/usuarios/avatar_matheus.png",
      data: "5 de janeiro de 2026, 21:02",
      local: "Galo Branco, São José dos Campos",
      atividade: "Corrida Matinal 5km",
      icone: "/img/corrida_icon.png",
      metricas: [
        { label: "Distância", valor: "5,04 km" },
        { label: "Tempo", valor: "28:30:05" },
        { label: "Ritmo médio", valor: "5:04 min" }
      ],
      imagens: ["/img/atividades/atividade_matheus.png", "/img/atividades/ciclismo_januario.png"]
    },
    {
      id: 4,
      usuario: "Adriano Cruz",
      avatar: "/img/usuarios/avatar_adriano.png",
      data: "5 de julho de 2025, 1:23",
      local: "Santa María de Jesús, Guatemala",
      atividade: "Santa María de Jesús - Volcán de Agua",
      icone: "/img/bike_icon.png",
      metricas: [
        { label: "Distância", valor: "11,25 km" },
        { label: "Tempo", valor: "4:17:18" },
        { label: "Ganho de elev.", valor: "1.674 m" }
      ],
      imagens: ["/img/atividades/atividade_adriano.png", "/img/atividades/foto_atividadeadriano.png"]
    }
  ]

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    // Inicializar estados
    const curtidasIniciais = {}
    const comentariosIniciais = {}
    postsData.forEach(post => {
      curtidasIniciais[post.id] = false
      comentariosIniciais[post.id] = []
    })
    setCurtidas(curtidasIniciais)
    setComentarios(comentariosIniciais)
    
    setLoading(false)
  }, [isAuthenticated, navigate])

  const handleCurtir = (postId) => {
    setCurtidas(prev => {
      const novaCurtida = !prev[postId]
      if (novaCurtida) {
        addNotification('❤️ Curtida', `Você curtiu o post de ${postsData.find(p => p.id === postId)?.usuario}`, 'info', 'fa-heart')
      }
      return { ...prev, [postId]: novaCurtida }
    })
  }

  const handleComentario = (postId, texto) => {
    if (texto.trim()) {
      const novoComentario = {
        usuario: user?.nome || "Você",
        texto: texto,
        tempo: "Agora mesmo"
      }
      setComentarios(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), novoComentario]
      }))
      addNotification('💬 Comentário', `Você comentou no post de ${postsData.find(p => p.id === postId)?.usuario}`, 'info', 'fa-comment')
    }
  }

  const toggleComentarios = (postId) => {
    setComentariosVisiveis(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando...</p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <main className="container">
        {/* Card Última Atividade */}
        <section className="atividade-card">
          <div className="atividade-info">
            <span className="atividade-label">Última Atividade</span>
            <h1>Corrida matinal no Ibirapuera</h1>
            <div className="atividade-detalhes">
              <span><i className="fa-solid fa-location-dot"></i> São José dos Campos</span>
              <span><i className="fa-regular fa-clock"></i> 52:30</span>
              <span><i className="fa-solid fa-route"></i> 10,2km</span>
            </div>
          </div>
          <div className="atividade-metricas">
            <div className="metrica">
              <i className="fa-solid fa-arrow-trend-up"></i>
              <h3>50.6 km</h3>
              <span>Distância</span>
            </div>
            <div className="metrica">
              <i className="fa-solid fa-gauge"></i>
              <h3>5:09/km</h3>
              <span>ritmo</span>
            </div>
            <div className="metrica">
              <i className="fa-solid fa-fire"></i>
              <h3>920</h3>
              <span>Calorias</span>
            </div>
          </div>
        </section>

        <br />

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon flame"><i className="fa-solid fa-fire"></i></div>
            <div>
              <div className="stat-label">Calorias</div>
              <div className="stat-value">1250</div>
              <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>kcal de hoje</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><i className="fa-solid fa-arrow-trend-up"></i></div>
            <div>
              <div className="stat-label">Elevação Mensal</div>
              <div className="stat-value">2340m</div>
              <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>430m acima da média</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><i className="fa-solid fa-route"></i></div>
            <div>
              <div className="stat-label">Distância Mensal</div>
              <div className="stat-value">55.9 km</div>
              <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>230 km acima da média</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon gray"><i className="fa-solid fa-trophy"></i></div>
            <div>
              <div className="stat-label">Meta Semanal</div>
              <div className="stat-value">3 <span style={{ fontSize: '11px', fontWeight: '400' }}>/ 5 treinos</span></div>
              <div className="progress-small">
                <div style={{ width: '60%', height: '100%', background: '#ff1e2d', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard">
          {/* Feed */}
          <div className="feed">
            {postsData.map(post => (
              <div key={post.id} className="feed-card">
                <div className="feed-header">
                  <img src={post.avatar} className="feed-avatar" alt={post.usuario} />
                  <div className="feed-user-info">
                    <div className="feed-user-name">{post.usuario}</div>
                    <div className="feed-meta">
                      <span>{post.data}</span><span>•</span>
                      <i className="fa-solid fa-location-dot"></i>
                      <span>{post.local}</span>
                    </div>
                  </div>
                </div>
                <div className="feed-activity-title">
                  <img src={post.icone} style={{ width: '20px' }} alt="" />
                  {post.atividade}
                </div>
                <div className="feed-metrics">
                  {post.metricas.map((m, idx) => (
                    <div key={idx} className="feed-metric">
                      <div className="feed-metric-label">{m.label}</div>
                      <div className="feed-metric-value">{m.valor}</div>
                    </div>
                  ))}
                </div>
                <div className="feed-images">
                  <div className="image-grid">
                    {post.imagens.map((img, idx) => (
                      <img key={idx} src={img} alt={`Atividade ${idx + 1}`} />
                    ))}
                  </div>
                </div>
                <div className="feed-actions">
                  <button className={`action-btn ${curtidas[post.id] ? 'active' : ''}`} onClick={() => handleCurtir(post.id)}>
                    <i className={curtidas[post.id] ? 'fas fa-heart' : 'far fa-heart'}></i>
                    <span>{curtidas[post.id] ? '1' : '0'}</span>
                  </button>
                  <button className="action-btn" onClick={() => toggleComentarios(post.id)}>
                    <i className="far fa-comment"></i>
                    <span>{comentarios[post.id]?.length || 0}</span>
                  </button>
                  <button className="action-btn">
                    <i className="fa-regular fa-share-square"></i>
                  </button>
                </div>
                
                {/* Área de comentários */}
                {comentariosVisiveis[post.id] && (
                  <div className="comentarios-area" style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <div className="comentarios-lista" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
                      {comentarios[post.id]?.map((com, idx) => (
                        <div key={idx} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{com.usuario}</strong>
                          <p style={{ fontSize: '12px', margin: '4px 0', color: 'var(--text-secondary)' }}>{com.texto}</p>
                          <small style={{ fontSize: '10px', color: 'var(--text-light)' }}>{com.tempo}</small>
                        </div>
                      ))}
                    </div>
                    <div className="comment-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div className="comment-avatar" style={{ width: '32px', height: '32px', background: '#ff1e2d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-user" style={{ color: 'white', fontSize: '12px' }}></i>
                      </div>
                      <input 
                        type="text" 
                        className="comment-input" 
                        id={`input-coment-${post.id}`}
                        placeholder="Escreva um comentário..." 
                        style={{ flex: 1, padding: '8px 14px', border: '1px solid var(--border-color)', borderRadius: '20px', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleComentario(post.id, e.target.value)
                            e.target.value = ''
                          }
                        }}
                      />
                      <button 
                        className="comment-send" 
                        style={{ width: '32px', height: '32px', background: '#ff1e2d', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer' }}
                        onClick={(e) => {
                          const input = document.getElementById(`input-coment-${post.id}`)
                          handleComentario(post.id, input.value)
                          input.value = ''
                        }}
                      >
                        <i className="fa-solid fa-paper-plane" style={{ fontSize: '12px' }}></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Panel */}
          <div className="right-panel">
            {/* Desafios Ativos */}
            <div className="rcard" style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
              <div className="rcard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="rcard-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Desafios Ativos</span>
                <a href="/desafios" className="ver-todos" style={{ fontSize: '12px', color: '#ff1e2d', textDecoration: 'none' }}>Ver todos <i className="fa-solid fa-chevron-right"></i></a>
              </div>
              <div className="desafio-item" style={{ marginBottom: '20px' }}>
                <div className="desafio-top" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div className="desafio-icon orange" style={{ width: '36px', height: '36px', background: '#f59e0b20', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-person-running" style={{ color: '#f59e0b' }}></i>
                  </div>
                  <div className="desafio-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>100 quilômetros em Março</div>
                </div>
                <div className="progress-bar" style={{ height: '6px', background: 'var(--progress-bg)', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div className="progress-fill orange" style={{ width: '55%', height: '100%', background: '#f59e0b', borderRadius: '10px' }}></div>
                </div>
                <div className="desafio-progress-info" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>55 Km</span><span>11 dias restantes</span>
                </div>
              </div>
              <div className="desafio-item" style={{ marginBottom: '20px' }}>
                <div className="desafio-top" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div className="desafio-icon red" style={{ width: '36px', height: '36px', background: '#ff1e2d20', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-stopwatch" style={{ color: '#ff1e2d' }}></i>
                  </div>
                  <div className="desafio-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>1000 minutos em Março</div>
                </div>
                <div className="progress-bar" style={{ height: '6px', background: 'var(--progress-bg)', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div className="progress-fill red" style={{ width: '70%', height: '100%', background: '#ff1e2d', borderRadius: '10px' }}></div>
                </div>
                <div className="desafio-progress-info" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>700 min</span><span>11 dias restantes</span>
                </div>
              </div>
              <div className="desafio-item">
                <div className="desafio-top" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div className="desafio-icon green" style={{ width: '36px', height: '36px', background: '#10b98120', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-route" style={{ color: '#10b981' }}></i>
                  </div>
                  <div className="desafio-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>1000 quilômetros em Dezembro</div>
                </div>
                <div className="progress-bar" style={{ height: '6px', background: 'var(--progress-bg)', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div className="progress-fill green" style={{ width: '88%', height: '100%', background: '#10b981', borderRadius: '10px' }}></div>
                </div>
                <div className="desafio-progress-info" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>880 km</span><span>Completo</span>
                </div>
              </div>
            </div>

            {/* Clubes Participantes */}
            <div className="rcard" style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
              <div className="rcard-header" style={{ marginBottom: '16px' }}>
                <span className="rcard-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Clubes Participantes</span>
              </div>
              <div className="clube-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => navigate('/clubes')}>
                <img src="/img/outros/corredores_sjc.png" className="profile_avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Clube" />
                <div className="clube-info" style={{ flex: 1 }}>
                  <div className="clube-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Corredores de São José e Região</div>
                  <div className="clube-link" style={{ fontSize: '11px', color: '#ff1e2d', cursor: 'pointer' }}>Visualizar Clube →</div>
                </div>
              </div>
              <div className="clube-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => navigate('/clubes')}>
                <img src="/img/outros/ciclotech.png" className="profile_avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Clube" />
                <div className="clube-info" style={{ flex: 1 }}>
                  <div className="clube-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Ciclotech <span className="verified" style={{ color: '#3b82f6' }}><i className="fa-solid fa-circle-check"></i></span></div>
                  <div className="clube-link" style={{ fontSize: '11px', color: '#ff1e2d', cursor: 'pointer' }}>Visualizar Clube →</div>
                </div>
              </div>
              <div className="clube-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => navigate('/clubes')}>
                <img src="/img/outros/parkrun.png" className="profile_avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Clube" />
                <div className="clube-info" style={{ flex: 1 }}>
                  <div className="clube-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Parkrun UK <span className="verified" style={{ color: '#3b82f6' }}><i className="fa-solid fa-circle-check"></i></span></div>
                  <div className="clube-link" style={{ fontSize: '11px', color: '#ff1e2d', cursor: 'pointer' }}>Visualizar Clube →</div>
                </div>
              </div>
              <div className="clube-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', cursor: 'pointer' }} onClick={() => navigate('/clubes')}>
                <img src="/img/outros/red_bull.png" className="profile_avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Clube" />
                <div className="clube-info" style={{ flex: 1 }}>
                  <div className="clube-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Red Bull UK <span className="verified" style={{ color: '#3b82f6' }}><i className="fa-solid fa-circle-check"></i></span></div>
                  <div className="clube-link" style={{ fontSize: '11px', color: '#ff1e2d', cursor: 'pointer' }}>Visualizar Clube →</div>
                </div>
              </div>
            </div>

            {/* Amigos Sugeridos */}
            <div className="rcard" style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '20px', border: '1px solid var(--border-color)' }}>
              <div className="rcard-header" style={{ marginBottom: '16px' }}>
                <span className="rcard-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-user-group" style={{ color: '#888', fontSize: '12px' }}></i> Amigos sugeridos
                </span>
              </div>
              <div className="amigo-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <img src="/img/usuarios/henrique_santosz.jpg" className="profile_avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Amigo" />
                <div className="amigo-info" style={{ flex: 1 }}>
                  <div className="amigo-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Henrique Santosz</div>
                  <div className="amigo-location" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>São José dos Campos, SP, Brasil</div>
                </div>
                <button className="seguir-btn" style={{ background: 'var(--border-light)', border: 'none', padding: '6px 16px', borderRadius: '30px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>Seguir</button>
              </div>
              <div className="amigo-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <img src="/img/usuarios/giovanni_borsoi.jpg" className="profile_avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Amigo" />
                <div className="amigo-info" style={{ flex: 1 }}>
                  <div className="amigo-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Giovanni Borsoli</div>
                  <div className="amigo-location" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Caçapava, SP, Brasil</div>
                </div>
                <button className="seguir-btn" style={{ background: 'var(--border-light)', border: 'none', padding: '6px 16px', borderRadius: '30px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>Seguir</button>
              </div>
              <div className="amigo-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <img src="/img/usuarios/gabriel.png" className="profile_avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Amigo" />
                <div className="amigo-info" style={{ flex: 1 }}>
                  <div className="amigo-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Gabriel Bastos</div>
                  <div className="amigo-location" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Caçapava, SP, Brasil</div>
                </div>
                <button className="seguir-btn" style={{ background: 'var(--border-light)', border: 'none', padding: '6px 16px', borderRadius: '30px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>Seguir</button>
              </div>
              <div className="amigo-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
                <img src="/img/usuarios/nino.png" className="profile_avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Amigo" />
                <div className="amigo-info" style={{ flex: 1 }}>
                  <div className="amigo-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Nino Schurter <i className="fa-solid fa-circle-check" style={{ color: '#3b82f6', fontSize: '10px' }}></i></div>
                  <div className="amigo-location" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Chur, GR, Suíça</div>
                </div>
                <button className="seguir-btn" style={{ background: 'var(--border-light)', border: 'none', padding: '6px 16px', borderRadius: '30px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>Seguir</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default Painel