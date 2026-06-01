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
  const { user, loading: authLoading } = useAuth()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [feedPosts, setFeedPosts] = useState([])
  const [sugestoes, setSugestoes] = useState([])
  const [seguindo, setSeguindo] = useState({})
  const [likedPosts, setLikedPosts] = useState({})
  const [comentariosVisiveis, setComentariosVisiveis] = useState({})
  const [comentarios, setComentarios] = useState({})
  const [clubesUsuario, setClubesUsuario] = useState([])
  const [desafiosParticipados, setDesafiosParticipados] = useState([])
  
  // Última atividade do usuário
  const [ultimaAtividade, setUltimaAtividade] = useState(null)

  // Estatísticas do usuário
  const [stats, setStats] = useState({
    calorias: 1250,
    elevacao: 2340,
    distancia: 55.9,
    meta: 60
  })

  // ==================== CARREGAR ÚLTIMA ATIVIDADE DO USUÁRIO ====================
  const carregarUltimaAtividade = async () => {
    if (!user) return
    
    try {
      console.log('🔄 [Painel] Carregando última atividade do usuário...')
      
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (error) throw error
      
      if (data && data.length > 0) {
        const atividade = data[0]
        
        // Formatar os dados da atividade
        let titulo = 'Atividade registrada'
        let icone = 'fa-person-running'
        
        if (atividade.tipo === 'Ciclismo') {
          titulo = 'Pedal'
          icone = 'fa-bicycle'
        } else if (atividade.tipo === 'Natação') {
          titulo = 'Treino na piscina'
          icone = 'fa-person-swimming'
        } else if (atividade.tipo === 'Treino Funcional') {
          titulo = 'Treino funcional'
          icone = 'fa-dumbbell'
        } else if (atividade.tipo === 'Musculação') {
          titulo = 'Treino na academia'
          icone = 'fa-dumbbell'
        } else if (atividade.tipo === 'Trilha') {
          titulo = 'Trilha'
          icone = 'fa-hiking'
        } else if (atividade.tipo === 'Corrida') {
          titulo = 'Corrida'
          icone = 'fa-person-running'
        } else if (atividade.tipo === 'Caminhada') {
          titulo = 'Caminhada'
          icone = 'fa-person-walking'
        }
        
        // Adicionar local se disponível
        if (atividade.local) {
          titulo = `${titulo} no ${atividade.local.split(',')[0]}`
        }
        
        // Formatar tempo (HH:MM:SS para MM:SS ou HH:MM)
        let tempoFormatado = atividade.tempo || '00:00'
        if (tempoFormatado && tempoFormatado.includes(':')) {
          const partes = tempoFormatado.split(':')
          if (partes.length === 3 && partes[0] === '00') {
            tempoFormatado = `${partes[1]}:${partes[2]}`
          } else if (partes.length === 3) {
            tempoFormatado = `${partes[0]}h ${partes[1]}min`
          }
        }
        
        // Formatar pace/ritmo
        let ritmoFormatado = atividade.pace || '0:00/km'
        if (ritmoFormatado && !ritmoFormatado.includes('/km')) {
          ritmoFormatado = `${ritmoFormatado}/km`
        }
        
        setUltimaAtividade({
          id: atividade.id,
          titulo: titulo,
          icone: icone,
          local: atividade.local || 'Local não informado',
          tempo: tempoFormatado,
          distancia: atividade.distancia || '0',
          pace: ritmoFormatado,
          data: new Date(atividade.created_at).toLocaleDateString('pt-BR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          }),
          calorias: atividade.calorias || 0,
          tipo: atividade.tipo
        })
        
        console.log('✅ [Painel] Última atividade carregada:', atividade.tipo)
      } else {
        setUltimaAtividade(null)
        console.log('⚠️ [Painel] Nenhuma atividade encontrada para o usuário')
      }
    } catch (error) {
      console.error('❌ [Painel] Erro ao carregar última atividade:', error)
      setUltimaAtividade(null)
    }
  }

  // ==================== CARREGAR DESAFIOS DO USUÁRIO DO SUPABASE ====================
  const carregarDesafiosParticipados = async () => {
    if (!user) return
    
    try {
      console.log('🔄 [Painel] Carregando desafios do usuário do Supabase...')
      
      // Buscar desafios que o usuário está participando (não completados)
      const { data: participacoes, error: participacaoError } = await supabase
        .from('desafio_usuario')
        .select(`
          id,
          desafio_id,
          progresso_atual,
          completado,
          data_inicio,
          desafios (
            id,
            titulo,
            descricao,
            meta,
            tipo,
            categoria,
            total_meta,
            medalha_imagem,
            data_fim
          )
        `)
        .eq('usuario_id', user.id)
        .eq('completado', false)
      
      if (participacaoError) throw participacaoError
      
      if (participacoes && participacoes.length > 0) {
        const desafiosFormatados = participacoes.map(part => {
          const desafio = part.desafios
          const percentual = (part.progresso_atual / desafio.total_meta) * 100
          
          // Definir cor e ícone baseado na categoria
          let corIcone = 'red'
          let icone = 'fa-trophy'
          
          if (desafio.categoria === 'Corrida') {
            icone = 'fa-person-running'
            corIcone = 'orange'
          } else if (desafio.categoria === 'Ciclismo') {
            icone = 'fa-bicycle'
            corIcone = 'green'
          } else if (desafio.categoria === 'Natação') {
            icone = 'fa-person-swimming'
            corIcone = 'blue'
          } else if (desafio.categoria === 'Forza') {
            icone = 'fa-trophy'
            corIcone = 'red'
          } else if (desafio.categoria === 'Caminhada') {
            icone = 'fa-person-walking'
            corIcone = 'purple'
          } else if (desafio.categoria === 'Geral') {
            icone = 'fa-chart-line'
            corIcone = 'teal'
          }
          
          // Calcular dias restantes
          const dataFim = new Date(desafio.data_fim)
          const hoje = new Date()
          const diasRestantes = Math.ceil((dataFim - hoje) / (1000 * 60 * 60 * 24))
          
          return {
            id: part.desafio_id,
            participacaoId: part.id,
            titulo: desafio.titulo,
            descricao: desafio.descricao,
            meta: desafio.meta,
            totalMeta: desafio.total_meta,
            progresso: part.progresso_atual,
            percentual: percentual,
            completado: part.completado,
            icone: icone,
            corIcone: corIcone,
            categoria: desafio.categoria,
            medalhaImagem: desafio.medalha_imagem,
            dataFim: desafio.data_fim,
            diasRestantes: diasRestantes > 0 ? diasRestantes : 0
          }
        })
        
        setDesafiosParticipados(desafiosFormatados)
        console.log('✅ [Painel] Desafios carregados:', desafiosFormatados.length)
      } else {
        setDesafiosParticipados([])
        console.log('⚠️ [Painel] Nenhum desafio participado encontrado')
      }
    } catch (error) {
      console.error('❌ [Painel] Erro ao carregar desafios:', error)
      setDesafiosParticipados([])
    }
  }

  // ==================== CARREGAR CLUBES DO USUÁRIO ====================
  const carregarClubesDoUsuario = async () => {
    if (!user) return
    
    try {
      console.log('🔄 [Painel] Carregando clubes do usuário...')
      
      const { data, error } = await supabase
        .from('clubes_membros')
        .select(`
          clube_id,
          clubes!inner (
            id, 
            nome, 
            logo, 
            capa,
            descricao,
            categoria,
            localizacao,
            membros_total
          )
        `)
        .eq('usuario_id', user.id)
        .limit(3)
      
      if (error) throw error
      
      if (data && data.length > 0) {
        const clubesFormatados = data.map(item => ({
          id: item.clubes.id,
          nome: item.clubes.nome,
          logo: item.clubes.logo || '/img/clube_default.jpg',
          capa: item.clubes.capa || '/img/clube_capa_default.jpg',
          descricao: item.clubes.descricao || 'Clube de atividades físicas',
          categoria: item.clubes.categoria || 'Esporte',
          localizacao: item.clubes.localizacao || 'Local não informado',
          membros: item.clubes.membros_total || 0
        }))
        setClubesUsuario(clubesFormatados)
        console.log('✅ [Painel] Clubes carregados:', clubesFormatados.length)
      } else {
        setClubesUsuario([])
        console.log('⚠️ [Painel] Usuário não participa de nenhum clube')
      }
    } catch (error) {
      console.error('❌ [Painel] Erro ao carregar clubes:', error)
      setClubesUsuario([])
    }
  }

  // ==================== ESCUTAR MUDANÇAS NOS CLUBES ====================
  useEffect(() => {
    if (!user) return
    
    console.log('🔄 [Painel] Inscrevendo para mudanças nos clubes...')
    
    const clubesSubscription = supabase
      .channel('clubes_membros_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'clubes_membros',
        filter: `usuario_id=eq.${user.id}`
      }, (payload) => {
        console.log('📢 [Painel] Mudança detectada nos clubes:', payload)
        carregarClubesDoUsuario()
      })
      .subscribe()
    
    return () => {
      console.log('🔴 [Painel] Removendo inscrição de clubes')
      clubesSubscription.unsubscribe()
    }
  }, [user])

  // ==================== ESCUTAR MUDANÇAS NOS DESAFIOS ====================
  useEffect(() => {
    if (!user) return
    
    console.log('🔄 [Painel] Inscrevendo para mudanças nos desafios...')
    
    const desafiosSubscription = supabase
      .channel('desafio_usuario_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'desafio_usuario',
        filter: `usuario_id=eq.${user.id}`
      }, (payload) => {
        console.log('📢 [Painel] Mudança detectada nos desafios:', payload)
        carregarDesafiosParticipados()
      })
      .subscribe()
    
    return () => {
      console.log('🔴 [Painel] Removendo inscrição de desafios')
      desafiosSubscription.unsubscribe()
    }
  }, [user])

  // ==================== CARREGAR FEED ====================
  const carregarFeed = async () => {
    if (!user) return
    
    try {
      console.log('🔄 [Painel] Carregando feed para usuário:', user.id)
      
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
      
      console.log('📊 [Painel] Atividades encontradas:', atividades?.length || 0)
      
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
      console.error('❌ [Painel] Erro ao carregar feed:', error)
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
    if (!user) return
    
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
        } else if (payload.new.usuario_id === user?.id) {
          // Se for a própria atividade do usuário, recarregar a última atividade
          carregarUltimaAtividade()
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
      console.log('🔄 [Painel] Carregando dados iniciais...')
      setLoading(true)
      await Promise.all([
        carregarFeed(),
        carregarSugestoes(),
        carregarClubesDoUsuario(),
        carregarDesafiosParticipados(),
        carregarUltimaAtividade()
      ])
      setLoading(false)
      console.log('✅ [Painel] Dados carregados com sucesso!')
    }
    
    if (user && !authLoading) {
      loadData()
    }
  }, [user, authLoading])

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <>
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Verificando autenticação...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (!user) {
    return null
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
        {/* Card Última Atividade - AGORA FUNCIONAL */}
        <section className="atividade-card">
          {ultimaAtividade ? (
            <>
              <div className="atividade-info">
                <span className="atividade-label">
                  <i className={`fas ${ultimaAtividade.icone}`} style={{ marginRight: '8px' }}></i>
                  Última Atividade
                </span>
                <h1>{ultimaAtividade.titulo}</h1>
                <div className="atividade-detalhes">
                  <span><i className="fa-solid fa-location-dot"></i> {ultimaAtividade.local}</span>
                  <span><i className="fa-regular fa-clock"></i> {ultimaAtividade.tempo}</span>
                  <span><i className="fa-solid fa-route"></i> {ultimaAtividade.distancia}km</span>
                </div>
                <div className="atividade-data">
                  <i className="fa-regular fa-calendar"></i> {ultimaAtividade.data}
                </div>
              </div>
              <div className="atividade-metricas">
                <div className="metrica">
                  <i className="fa-solid fa-arrow-trend-up"></i>
                  <h3>{ultimaAtividade.distancia} km</h3>
                  <span>Distância</span>
                </div>
                <div className="metrica">
                  <i className="fa-solid fa-gauge"></i>
                  <h3>{ultimaAtividade.pace}</h3>
                  <span>ritmo</span>
                </div>
                <div className="metrica">
                  <i className="fa-solid fa-fire"></i>
                  <h3>{ultimaAtividade.calorias || 0}</h3>
                  <span>Calorias</span>
                </div>
              </div>
            </>
          ) : (
            <div className="atividade-info" style={{ textAlign: 'center', width: '100%' }}>
              <span className="atividade-label">
                <i className="fas fa-person-running" style={{ marginRight: '8px' }}></i>
                Última Atividade
              </span>
              <h2 style={{ marginTop: '20px', fontSize: '1.5rem' }}>Nenhuma atividade registrada</h2>
              <p style={{ marginTop: '10px', color: 'var(--text-light)' }}>
                Você ainda não registrou nenhuma atividade.
              </p>
              <Link to="/atividades" className="btn-registrar-atividade" style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '10px 24px',
                background: '#ff1e2d',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600'
              }}>
                <i className="fas fa-plus"></i> Registrar Atividade
              </Link>
            </div>
          )}
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
            {/* Desafios Ativos - MOSTRANDO OS DESAFIOS REAIS DO USUÁRIO */}
            <div className="rcard">
              <div className="rcard-header">
                <span className="rcard-title">
                  <i className="fas fa-trophy"></i> Meus Desafios
                </span>
                <Link to="/desafios" className="ver-todos">
                  Ver todos <i className="fa-solid fa-chevron-right"></i>
                </Link>
              </div>
              
              {desafiosParticipados.length > 0 ? (
                desafiosParticipados.map(desafio => (
                  <div key={desafio.id} className="desafio-item">
                    <div className="desafio-top">
                      <div className={`desafio-icon ${desafio.corIcone}`}>
                        <i className={`fas ${desafio.icone}`}></i>
                      </div>
                      <div className="desafio-name">{desafio.titulo}</div>
                    </div>
                    <div className="desafio-meta">
                      <span><i className="fas fa-bullseye"></i> Meta: {desafio.meta}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${desafio.corIcone}`} 
                        style={{ width: `${desafio.percentual}%` }}
                      ></div>
                    </div>
                    <div className="desafio-progress-info">
                      <span>{desafio.progresso} / {desafio.totalMeta}</span>
                      <span>{Math.round(desafio.percentual)}% concluído</span>
                    </div>
                    <div className="desafio-footer">
                      <span className="dias-restantes">
                        <i className="fas fa-calendar-day"></i> {desafio.diasRestantes} dias restantes
                      </span>
                      <button 
                        className="btn-ver-desafio-painel"
                        onClick={() => navigate(`/desafio/${desafio.id}`)}
                      >
                        Ver progresso <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-desafios-painel">
                  <i className="fas fa-trophy"></i>
                  <p>Você ainda não participa de nenhum desafio</p>
                  <Link to="/desafios" className="btn-explorar-desafios">
                    Explorar Desafios
                  </Link>
                </div>
              )}
            </div>

            {/* Clubes Participantes */}
            <div className="rcard">
              <div className="rcard-header">
                <span className="rcard-title">
                  <i className="fa-solid fa-users"></i> Meus Clubes
                </span>
                {clubesUsuario.length > 0 && (
                  <Link to="/clubes" className="ver-todos">
                    Ver todos <i className="fa-solid fa-chevron-right"></i>
                  </Link>
                )}
              </div>
              <div className="club-list">
                {clubesUsuario.length > 0 ? (
                  clubesUsuario.map(clube => (
                    <div 
                      key={clube.id} 
                      className="club-item" 
                      onClick={() => navigate(`/clube/${clube.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="club-icon">
                        <img 
                          src={clube.logo} 
                          alt={clube.nome}
                          onError={(e) => { e.target.src = '/img/clube_default.jpg' }}
                        />
                      </div>
                      <div className="club-info">
                        <div className="club-name">{clube.nome}</div>
                        <div className="club-meta">
                          <i className="fa-solid fa-tag"></i> {clube.categoria}
                        </div>
                        <div className="club-meta">
                          <i className="fa-solid fa-users"></i> {clube.membros} membros
                        </div>
                        {clube.localizacao && clube.localizacao !== 'Local não informado' && (
                          <div className="club-meta">
                            <i className="fa-solid fa-location-dot"></i> {clube.localizacao}
                          </div>
                        )}
                      </div>
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  ))
                ) : (
                  <div className="empty-clubes">
                    <i className="fa-solid fa-users-slash"></i>
                    <p>Você ainda não participa de nenhum clube</p>
                    <button 
                      className="btn-ver-clubes" 
                      onClick={() => navigate('/clubes')}
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        background: '#ff1e2d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Explorar Clubes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Amigos Sugeridos */}
            <div className="rcard">
              <div className="rcard-header">
                <span className="rcard-title">
                  <i className="fa-solid fa-user-group"></i> Amigos sugeridos
                </span>
              </div>
              
              {sugestoes.map(amigo => (
                <div key={amigo.id} className="amigo-item">
                  <div 
                    className="amigo-avatar"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      console.log('Navegando para perfil do amigo:', amigo.id, amigo.nome)
                      navigate(`/perfil/${amigo.id}`)
                    }}
                  >
                    <img 
                      src={amigo.avatar} 
                      alt={amigo.nome}
                      onError={(e) => { e.target.src = '/img/usuarios/default.jpg' }}
                    />
                  </div>
                  <div className="amigo-info">
                    <div 
                      className="amigo-name" 
                      style={{ 
                        cursor: 'pointer',
                        fontWeight: 600,
                        color: 'var(--text-primary)'
                      }}
                      onClick={() => {
                        console.log('Navegando para perfil pelo nome:', amigo.id, amigo.nome)
                        navigate(`/perfil/${amigo.id}`)
                      }}
                    >
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