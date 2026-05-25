import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { supabase } from '../lib/supabase'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import './painel.css'

function Painel() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [feedPosts, setFeedPosts] = useState([])
  const [sugestoes, setSugestoes] = useState([])
  const [seguindo, setSeguindo] = useState({})
  const [likedPosts, setLikedPosts] = useState({})
  const [comentariosVisiveis, setComentariosVisiveis] = useState({})
  const [comentarios, setComentarios] = useState({})
  
  // Estatísticas do usuário
  const [stats, setStats] = useState({
    calorias: 1250,
    elevacao: 2340,
    distancia: 55.9,
    meta: 60
  })

  // ==================== CARREGAR FEED (APENAS POSTS DE OUTROS USUÁRIOS) ====================
  const carregarFeed = async () => {
    if (!user) return
    
    try {
      console.log('Carregando feed para usuário:', user.id)
      
      const { data: atividades, error } = await supabase
        .from('atividades')
        .select(`
          *,
          usuarios (id, nome, avatar)
        `)
        .neq('usuario_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      
      console.log('Atividades encontradas:', atividades?.length || 0)
      
      const { data: curtidasData } = await supabase
        .from('curtidas')
        .select('atividade_id')
        .eq('usuario_id', user.id)
      
      const likedMap = {}
      curtidasData?.forEach(item => { likedMap[item.atividade_id] = true })
      setLikedPosts(likedMap)
      
      const comentariosMap = {}
      for (const atividade of atividades || []) {
        const { data: comentariosData } = await supabase
          .from('comentarios')
          .select(`
            *,
            usuarios (id, nome, avatar)
          `)
          .eq('atividade_id', atividade.id)
          .order('created_at', { ascending: true })
        
        if (comentariosData) {
          comentariosMap[atividade.id] = comentariosData.map(c => ({
            id: c.id,
            usuario: c.usuarios?.nome || 'Usuário',
            avatar: c.usuarios?.avatar || '/img/usuarios/default.jpg',
            texto: c.texto,
            data: new Date(c.created_at).toLocaleString()
          }))
        } else {
          comentariosMap[atividade.id] = []
        }
      }
      setComentarios(comentariosMap)
      
      const formattedPosts = atividades?.map(atividade => {
        let icone = 'fa-person-running'
        if (atividade.tipo === 'Ciclismo') icone = 'fa-bicycle'
        else if (atividade.tipo === 'Natação') icone = 'fa-person-swimming'
        else if (atividade.tipo === 'Treino Funcional') icone = 'fa-dumbbell'
        else if (atividade.tipo === 'Musculação') icone = 'fa-dumbbell'
        else if (atividade.tipo === 'Trilha') icone = 'fa-hiking'
        
        return {
          id: atividade.id,
          usuarioId: atividade.usuario_id,
          usuario: atividade.usuarios?.nome || 'Usuário',
          avatar: atividade.usuarios?.avatar || '/img/usuarios/default.jpg',
          data: new Date(atividade.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
          local: atividade.local || 'Local não informado',
          atividade: atividade.tipo || 'Atividade',
          icone: icone,
          metricas: [
            { label: "Distância", valor: atividade.distancia || "0 km" },
            { label: "Tempo", valor: atividade.tempo || "00:00" },
            { label: "Ritmo", valor: atividade.pace || "0:00/km" }
          ],
          imagens: atividade.imagens && atividade.imagens.length > 0 ? atividade.imagens : ["/img/atividade_perfil.jpg"],
          curtidas: atividade.curtidas || 0
        }
      }) || []
      
      setFeedPosts(formattedPosts)
    } catch (error) {
      console.error('Erro ao carregar feed:', error)
    }
  }

  // ==================== CARREGAR SUGESTÕES DE AMIGOS ====================
  const carregarSugestoes = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, avatar, localizacao')
        .neq('id', user.id)
        .limit(10)
      
      if (error) throw error
      
      const { data: seguindoData } = await supabase
        .from('seguidores')
        .select('seguindo_id')
        .eq('seguidor_id', user.id)
      
      const seguindoIds = new Set(seguindoData?.map(s => s.seguindo_id) || [])
      
      const sugestoesFormatadas = data.map(usuario => ({
        id: usuario.id,
        nome: usuario.nome,
        localizacao: usuario.localizacao || 'Local não informado',
        avatar: usuario.avatar || '/img/usuarios/default.jpg',
        seguindo: seguindoIds.has(usuario.id)
      }))
      
      setSugestoes(sugestoesFormatadas)
      
      const seguindoState = {}
      sugestoesFormatadas.forEach(s => {
        seguindoState[s.id] = s.seguindo
      })
      setSeguindo(seguindoState)
      
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error)
    }
  }

  // ==================== FUNÇÃO PARA SEGUIR USUÁRIO ====================
  const handleSeguir = async (usuarioId, usuarioNome) => {
    try {
      if (seguindo[usuarioId]) {
        const { error } = await supabase
          .from('seguidores')
          .delete()
          .eq('seguidor_id', user?.id)
          .eq('seguindo_id', usuarioId)
        
        if (error) throw error
        
        setSeguindo(prev => ({ ...prev, [usuarioId]: false }))
        addNotification('➖ Deixou de seguir', `Você deixou de seguir ${usuarioNome}`, 'info', 'fa-user-minus')
      } else {
        const { error } = await supabase
          .from('seguidores')
          .insert([{ seguidor_id: user?.id, seguindo_id: usuarioId }])
        
        if (error) throw error
        
        setSeguindo(prev => ({ ...prev, [usuarioId]: true }))
        addNotification('➕ Seguindo', `Você começou a seguir ${usuarioNome}`, 'success', 'fa-user-plus')
      }
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error)
      addNotification('Erro', 'Não foi possível completar a ação', 'error')
    }
  }

  // ==================== CURTIR POST ====================
  const handleCurtir = async (postId, postUsuarioId, postUsuarioNome) => {
    if (likedPosts[postId]) {
      addNotification('Curtida', 'Você já curtiu este post!', 'warning')
      return
    }
    
    try {
      const { error } = await supabase.from('curtidas').insert([{ 
        atividade_id: postId, 
        usuario_id: user?.id 
      }])
      
      if (error) throw error
      
      await supabase.rpc('incrementar_curtida', { post_id: postId })
      
      setFeedPosts(feedPosts.map(post => 
        post.id === postId ? { ...post, curtidas: (post.curtidas || 0) + 1 } : post
      ))
      setLikedPosts({ ...likedPosts, [postId]: true })
      
      if (postUsuarioId !== user.id) {
        addNotification('❤️ Curtida!', `Você curtiu o post de ${postUsuarioNome}`, 'info', 'fa-heart')
      } else {
        addNotification('❤️ Curtida!', 'Você curtiu esta atividade!', 'info', 'fa-heart')
      }
    } catch (error) {
      console.error('Erro ao curtir:', error)
      addNotification('Erro', 'Não foi possível curtir', 'error')
    }
  }

  // ==================== COMENTAR ====================
  const handleAdicionarComentario = async (postId, postUsuarioId, postUsuarioNome, texto) => {
    if (!texto.trim()) return
    
    try {
      const { error } = await supabase.from('comentarios').insert([{
        atividade_id: postId,
        usuario_id: user?.id,
        texto: texto
      }])
      
      if (error) throw error
      
      const { data: novoComentario } = await supabase
        .from('comentarios')
        .select(`
          *,
          usuarios (id, nome, avatar)
        `)
        .eq('atividade_id', postId)
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (novoComentario && novoComentario[0]) {
        const comentarioFormatado = {
          id: novoComentario[0].id,
          usuario: novoComentario[0].usuarios?.nome || user?.nome,
          avatar: novoComentario[0].usuarios?.avatar || '/img/usuarios/default.jpg',
          texto: novoComentario[0].texto,
          data: new Date(novoComentario[0].created_at).toLocaleString()
        }
        
        setComentarios(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), comentarioFormatado]
        }))
      }
      
      if (postUsuarioId !== user.id) {
        addNotification('💬 Comentário!', `Você comentou no post de ${postUsuarioNome}`, 'success', 'fa-comment')
      } else {
        addNotification('💬 Comentário!', 'Seu comentário foi publicado!', 'success', 'fa-comment')
      }
    } catch (error) {
      console.error('Erro ao comentar:', error)
      addNotification('Erro', 'Não foi possível comentar', 'error')
    }
  }

  const toggleComentarios = (postId) => {
    setComentariosVisiveis(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  // ==================== ESCUTAR MUDANÇAS EM TEMPO REAL ====================
  useEffect(() => {
    const atividadesSubscription = supabase
      .channel('atividades_channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'atividades' 
      }, (payload) => {
        if (payload.new.usuario_id !== user?.id) {
          carregarFeed()
          supabase
            .from('usuarios')
            .select('nome')
            .eq('id', payload.new.usuario_id)
            .single()
            .then(({ data }) => {
              if (data) {
                addNotification('📱 Nova atividade!', `${data.nome} publicou uma nova atividade!`, 'info', 'fa-bell')
              }
            })
        }
      })
      .subscribe()
    
    const curtidasSubscription = supabase
      .channel('curtidas_channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'curtidas' 
      }, (payload) => {
        if (payload.new.usuario_id !== user?.id) {
          carregarFeed()
        }
      })
      .subscribe()
    
    const comentariosSubscription = supabase
      .channel('comentarios_channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'comentarios' 
      }, (payload) => {
        if (payload.new.usuario_id !== user?.id) {
          carregarFeed()
        }
      })
      .subscribe()
    
    return () => {
      atividadesSubscription.unsubscribe()
      curtidasSubscription.unsubscribe()
      comentariosSubscription.unsubscribe()
    }
  }, [user])

  // ==================== LOADING INICIAL ====================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await carregarFeed()
      await carregarSugestoes()
      setLoading(false)
    }
    
    if (user) {
      loadData()
    }
  }, [user])

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
              <div className="stat-value">{stats.calorias}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>kcal de hoje</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><i className="fa-solid fa-arrow-trend-up"></i></div>
            <div>
              <div className="stat-label">Elevação Mensal</div>
              <div className="stat-value">{stats.elevacao}m</div>
              <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>430m acima da média</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><i className="fa-solid fa-route"></i></div>
            <div>
              <div className="stat-label">Distância Mensal</div>
              <div className="stat-value">{stats.distancia} km</div>
              <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>230 km acima da média</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon gray"><i className="fa-solid fa-trophy"></i></div>
            <div>
              <div className="stat-label">Meta Semanal</div>
              <div className="stat-value">{stats.meta}%</div>
              <div className="progress-small">
                <div style={{ width: `${stats.meta}%`, height: '100%', background: '#ff1e2d', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard">
          {/* Feed */}
          <div className="feed">
            
            {feedPosts.length > 0 ? (
              feedPosts.map(post => (
                <div key={post.id} className="feed-card">
                  <div className="feed-header">
                    <img 
                      src={post.avatar} 
                      className="feed-avatar" 
                      alt={post.usuario}
                      onError={(e) => { e.target.src = '/img/usuarios/default.jpg' }}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/perfil/${post.usuarioId}`)}
                    />
                    <div className="feed-user-info">
                      <div 
                        className="feed-user-name" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/perfil/${post.usuarioId}`)}
                      >
                        {post.usuario}
                      </div>
                      <div className="feed-meta">
                        <span>{post.data}</span><span>•</span>
                        <i className="fa-solid fa-location-dot"></i>
                        <span>{post.local}</span>
                      </div>
                    </div>
                  </div>
                  <div className="feed-activity-title">
                    <i className={`fas ${post.icone}`}></i>
                    <span>{post.atividade}</span>
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
                      {post.imagens && post.imagens.length > 0 ? (
                        post.imagens.map((img, idx) => (
                          <img 
                            key={idx} 
                            src={img} 
                            alt={`Atividade ${idx + 1}`} 
                            onError={(e) => { 
                              e.target.src = '/img/atividade_perfil.jpg'
                            }} 
                          />
                        ))
                      ) : (
                        <img 
                          src="/img/atividade_perfil.jpg" 
                          alt="Atividade" 
                          onError={(e) => { 
                            e.target.src = '/img/atividade_perfil.jpg'
                          }} 
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="feed-actions">
                    <button 
                      className={`action-btn ${likedPosts[post.id] ? 'active' : ''}`} 
                      onClick={() => handleCurtir(post.id, post.usuarioId, post.usuario)}
                    >
                      <i className={likedPosts[post.id] ? 'fas fa-heart' : 'far fa-heart'}></i>
                      <span>{post.curtidas || 0}</span>
                    </button>
                    <button className="action-btn" onClick={() => toggleComentarios(post.id)}>
                      <i className="far fa-comment"></i>
                      <span>{comentarios[post.id]?.length || 0}</span>
                    </button>
                    <button className="action-btn">
                      <i className="fa-regular fa-share-square"></i>
                    </button>
                  </div>
                  
                  {comentariosVisiveis[post.id] && (
                    <div className="comentarios-area">
                      <div className="comentarios-lista">
                        {comentarios[post.id]?.map((com, idx) => (
                          <div key={idx} className="comentario-item">
                            <img 
                              src={com.avatar} 
                              alt={com.usuario} 
                              onError={(e) => { e.target.src = '/img/usuarios/default.jpg' }}
                            />
                            <div className="comentario-content">
                              <strong>{com.usuario}</strong>
                              <p>{com.texto}</p>
                              <small>{com.data}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="comment-row">
                        <div className="comment-avatar">
                          <img 
                            src={user?.avatar || '/img/usuarios/default.jpg'} 
                            alt={user?.nome}
                            onError={(e) => { e.target.src = '/img/usuarios/default.jpg' }}
                          />
                        </div>
                        <input 
                          type="text" 
                          className="comment-input" 
                          id={`input-coment-${post.id}`}
                          placeholder="Escreva um comentário..." 
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAdicionarComentario(post.id, post.usuarioId, post.usuario, e.target.value)
                              e.target.value = ''
                            }
                          }}
                        />
                        <button 
                          className="comment-send"
                          onClick={() => {
                            const input = document.getElementById(`input-coment-${post.id}`)
                            handleAdicionarComentario(post.id, post.usuarioId, post.usuario, input.value)
                            input.value = ''
                          }}
                        >
                          <i className="fa-solid fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-feed">
                <i className="fas fa-newspaper"></i>
                <h3>Nenhuma atividade de outros usuários</h3>
                <p>Quando outros usuários publicarem atividades, aparecerão aqui!</p>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="right-panel">
            {/* Desafios Ativos */}
            <div className="rcard">
              <div className="rcard-header">
                <span className="rcard-title">Desafios Ativos</span>
                <Link to="/desafios" className="ver-todos">Ver todos <i className="fa-solid fa-chevron-right"></i></Link>
              </div>
              <div className="desafio-item">
                <div className="desafio-top">
                  <div className="desafio-icon orange">
                    <i className="fa-solid fa-person-running"></i>
                  </div>
                  <div className="desafio-name">100 quilômetros em Março</div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill orange" style={{ width: '55%' }}></div>
                </div>
                <div className="desafio-progress-info">
                  <span>55 Km</span><span>11 dias restantes</span>
                </div>
              </div>
              <div className="desafio-item">
                <div className="desafio-top">
                  <div className="desafio-icon red">
                    <i className="fa-solid fa-stopwatch"></i>
                  </div>
                  <div className="desafio-name">1000 minutos em Março</div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill red" style={{ width: '70%' }}></div>
                </div>
                <div className="desafio-progress-info">
                  <span>700 min</span><span>11 dias restantes</span>
                </div>
              </div>
              <div className="desafio-item">
                <div className="desafio-top">
                  <div className="desafio-icon green">
                    <i className="fa-solid fa-route"></i>
                  </div>
                  <div className="desafio-name">1000 quilômetros em Dezembro</div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill green" style={{ width: '88%' }}></div>
                </div>
                <div className="desafio-progress-info">
                  <span>880 km</span><span>Completo</span>
                </div>
              </div>
            </div>

            {/* Clubes Participantes - COM AVATAR PADRÃO */}
            <div className="rcard">
              <div className="rcard-header">
                <span className="rcard-title">Clubes Participantes</span>
              </div>
              <div className="club-list">
                <div className="club-item" onClick={() => navigate('/clubes')}>
                  <div className="club-icon">
                    <img 
                      src="/img/outros/corredores_sjc.png" 
                      alt="Corredores de SJC"
                      onError={(e) => { e.target.src = '/img/clube_default.jpg' }}
                    />
                  </div>
                  <div className="club-info">
                    <div className="club-name">Corredores de São José e Região</div>
                    <div className="club-link">Visualizar Clube →</div>
                  </div>
                </div>
                <div className="club-item" onClick={() => navigate('/clubes')}>
                  <div className="club-icon">
                    <img 
                      src="/img/outros/ciclotech.png" 
                      alt="Ciclotech"
                      onError={(e) => { e.target.src = '/img/clube_default.jpg' }}
                    />
                  </div>
                  <div className="club-info">
                    <div className="club-name">Ciclotech <span className="verified"><i className="fa-solid fa-circle-check"></i></span></div>
                    <div className="club-link">Visualizar Clube →</div>
                  </div>
                </div>
                <div className="club-item" onClick={() => navigate('/clubes')}>
                  <div className="club-icon">
                    <img 
                      src="/img/forza icon.png" 
                      alt="FORZA"
                      onError={(e) => { e.target.src = '/img/clube_default.jpg' }}
                    />
                  </div>
                  <div className="club-info">
                    <div className="club-name">FORZA <span className="verified"><i className="fa-solid fa-circle-check"></i></span></div>
                    <div className="club-link">Visualizar Clube →</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amigos Sugeridos - COM AVATAR PADRÃO E TAMANHO IGUAL */}
            <div className="rcard">
              <div className="rcard-header">
                <span className="rcard-title">
                  <i className="fa-solid fa-user-group"></i> Amigos sugeridos
                </span>
              </div>
              
              {sugestoes.map(amigo => (
                <div key={amigo.id} className="amigo-item">
                  <div className="amigo-avatar">
                    <img 
                      src={amigo.avatar} 
                      alt={amigo.nome}
                      onError={(e) => { e.target.src = '/img/usuarios/default.jpg' }}
                    />
                  </div>
                  <div className="amigo-info">
                    <div className="amigo-name" onClick={() => navigate(`/perfil/${amigo.id}`)}>
                      {amigo.nome}
                    </div>
                    <div className="amigo-location">
                      <i className="fa-solid fa-location-dot"></i> {amigo.localizacao}
                    </div>
                  </div>
                  <button 
                    className={`seguir-btn ${seguindo[amigo.id] ? 'seguindo' : ''}`}
                    onClick={() => handleSeguir(amigo.id, amigo.nome)}
                  >
                    <i className={seguindo[amigo.id] ? 'fas fa-check' : 'fas fa-user-plus'}></i>
                    {seguindo[amigo.id] ? 'Seguindo' : 'Seguir'}
                  </button>
                </div>
              ))}
              
              {sugestoes.length === 0 && (
                <div className="empty-sugestoes">
                  <i className="fa-solid fa-users"></i>
                  <p>Nenhuma sugestão disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default Painel