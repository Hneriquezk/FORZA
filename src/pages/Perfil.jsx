import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { supabase } from '../lib/supabase'
import { buscarDesafiosCompletados } from '../services/desafiosCompletadosService'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import Calendar from '../components/Calendar'
import './perfil.css'
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
  const { id } = useParams()
  const { user, updateUser, logout } = useAuth()
  const { addNotification } = useNotifications()
  
  const [perfilUser, setPerfilUser] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState(true)
  const [estaSeguindo, setEstaSeguindo] = useState(false)
  
  const [activeTab, setActiveTab] = useState('geral')
  const [posts, setPosts] = useState([])
  const [activeSports, setActiveSports] = useState(['running', 'cycling', 'swimming'])
  const [likedPosts, setLikedPosts] = useState({})
  
  const [showPostModal, setShowPostModal] = useState(false)
  const [showLikesModal, setShowLikesModal] = useState(false)
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [postToDelete, setPostToDelete] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [newPost, setNewPost] = useState({
    atividade: '',
    local: '',
    distancia: '',
    tempo: '',
    ritmo: '',
    imagens: []
  })
  const [postImages, setPostImages] = useState([])
  const [postImagePreviews, setPostImagePreviews] = useState([])
  
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    nome: "",
    localizacao: "",
    bio: "",
    avatar: "/img/usuarios/default.jpg",
    capa: "/img/banner_perfil.png"
  })
  
  const [tempForm, setTempForm] = useState({ ...editForm })
  const [tempAvatar, setTempAvatar] = useState(null)
  const [tempCapa, setTempCapa] = useState(null)
  
  const [stats, setStats] = useState({
    atividades: 0,
    seguindo: 0,
    seguidores: 0
  })

  // Estados para desafios completados
  const [desafiosCompletados, setDesafiosCompletados] = useState([])
  const [carregandoDesafios, setCarregandoDesafios] = useState(false)
  
  const fileInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  // ==================== CARREGAR PERFIL ====================
  useEffect(() => {
    if (id && id !== user?.id) {
      setIsOwnProfile(false)
      carregarPerfilUsuario(id)
    } else if (user) {
      setIsOwnProfile(true)
      setPerfilUser(user)
      carregarDadosUsuario(user.id)
    }
  }, [id, user])

  const carregarPerfilUsuario = async (usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', usuarioId)
        .single()
      
      if (error) throw error
      setPerfilUser(data)
      await carregarDadosUsuario(usuarioId)
      
      if (user) {
        const { data: segue } = await supabase
          .from('seguidores')
          .select('*')
          .eq('seguidor_id', user.id)
          .eq('seguindo_id', usuarioId)
        
        setEstaSeguindo(segue && segue.length > 0)
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      navigate('/painel')
    }
  }

  const carregarDadosUsuario = async (usuarioId) => {
    await Promise.all([
      loadUserProfile(usuarioId),
      loadUserPosts(usuarioId),
      loadStats(usuarioId),
      loadLikedStatus(),
      carregarDesafiosCompletados(usuarioId)
    ])
  }

  // ==================== CARREGAR DESAFIOS COMPLETADOS ====================
  const carregarDesafiosCompletados = async (usuarioId) => {
    setCarregandoDesafios(true)
    const desafios = await buscarDesafiosCompletados(usuarioId)
    setDesafiosCompletados(desafios)
    setCarregandoDesafios(false)
  }

  // ==================== CARREGAR PERFIL DO USUÁRIO ====================
  const loadUserProfile = async (usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', usuarioId)
        .single()
      
      if (error) throw error
      
      if (data) {
        const perfilData = {
          nome: data.nome || 'Usuário',
          localizacao: data.localizacao || 'São José dos Campos, SP · Brasil',
          bio: data.bio || 'Apaixonado por corrida e ciclismo',
          avatar: data.avatar || '/img/usuarios/default.jpg',
          capa: data.capa || '/img/banner_perfil.png'
        }
        
        setEditForm(perfilData)
        setTempForm(perfilData)
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  // ==================== CARREGAR POSTS DO USUÁRIO ====================
  const loadUserPosts = async (usuarioId) => {
    try {
      const { data, error } = await supabase
        .from('atividades')
        .select(`
          *,
          usuarios (
            id,
            nome,
            avatar
          )
        `)
        .eq('usuario_id', usuarioId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      if (data && data.length > 0) {
        const formattedPosts = data.map(post => {
          const postAvatar = post.usuarios?.avatar || editForm.avatar || '/img/usuarios/default.jpg'
          const postNome = post.usuarios?.nome || editForm.nome || 'Usuário'
          
          let icone = 'fa-running'
          if (post.tipo === 'Ciclismo') icone = 'fa-biking'
          else if (post.tipo === 'Natação') icone = 'fa-swimmer'
          else if (post.tipo === 'Treino Funcional') icone = 'fa-dumbbell'
          else if (post.tipo === 'Musculação') icone = 'fa-dumbbell'
          else if (post.tipo === 'Trilha') icone = 'fa-hiking'
          
          return {
            id: post.id,
            usuarioId: post.usuario_id,
            usuario: postNome,
            avatar: postAvatar,
            data: new Date(post.created_at).toLocaleDateString('pt-BR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            }),
            local: post.local || 'Local não informado',
            atividade: post.tipo || 'Atividade',
            icone: icone,
            metricas: [
              { label: "Distância", valor: post.distancia || "0 km" },
              { label: "Tempo", valor: post.tempo || "00:00" },
              { label: "Ritmo", valor: post.pace || "0:00/km" }
            ],
            imagens: post.imagens && post.imagens.length > 0 ? post.imagens : ["/img/atividade_perfil.jpg"],
            curtidas: post.curtidas || 0,
            comentarios: []
          }
        })
        setPosts(formattedPosts)
      } else {
        setPosts([])
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error)
      setPosts([])
    }
  }

  // ==================== CARREGAR ESTATÍSTICAS ====================
  const loadStats = async (usuarioId) => {
    try {
      const { count: atividadesCount } = await supabase
        .from('atividades')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', usuarioId)
      
      const { count: seguidoresCount } = await supabase
        .from('seguidores')
        .select('*', { count: 'exact', head: true })
        .eq('seguindo_id', usuarioId)
      
      const { count: seguindoCount } = await supabase
        .from('seguidores')
        .select('*', { count: 'exact', head: true })
        .eq('seguidor_id', usuarioId)
      
      setStats({
        atividades: atividadesCount || 0,
        seguidores: seguidoresCount || 0,
        seguindo: seguindoCount || 0
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  // ==================== CARREGAR STATUS DE CURTIDAS ====================
  const loadLikedStatus = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('curtidas')
        .select('atividade_id')
        .eq('usuario_id', user.id)
      
      if (data) {
        const liked = {}
        data.forEach(item => { liked[item.atividade_id] = true })
        setLikedPosts(liked)
      }
    } catch (error) {
      console.error('Erro ao carregar curtidas:', error)
    }
  }

  // ==================== SEGUIR USUÁRIO ====================
  const handleFollow = async () => {
    if (!user) return
    
    try {
      if (estaSeguindo) {
        const { error } = await supabase
          .from('seguidores')
          .delete()
          .eq('seguidor_id', user.id)
          .eq('seguindo_id', perfilUser?.id)
        
        if (error) throw error
        
        setEstaSeguindo(false)
        setStats(prev => ({ ...prev, seguidores: prev.seguidores - 1 }))
        addNotification('Deixou de seguir', `Você deixou de seguir ${perfilUser?.nome}`, 'info')
      } else {
        const { error } = await supabase
          .from('seguidores')
          .insert([{ seguidor_id: user.id, seguindo_id: perfilUser?.id }])
        
        if (error) throw error
        
        setEstaSeguindo(true)
        setStats(prev => ({ ...prev, seguidores: prev.seguidores + 1 }))
        addNotification('Seguindo', `Você começou a seguir ${perfilUser?.nome}`, 'success')
      }
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error)
      addNotification('Erro', 'Não foi possível completar a ação', 'error')
    }
  }

  // ==================== NOVO POST ====================
  const handleNewPost = async () => {
    if (!newPost.atividade || !newPost.local) {
      addNotification('Campos obrigatórios', 'Preencha o título e localização da atividade!', 'warning')
      return
    }

    const novoPost = {
      usuario_id: user.id,
      tipo: newPost.atividade,
      local: newPost.local,
      distancia: newPost.distancia || "0 km",
      tempo: newPost.tempo || "00:00",
      pace: newPost.ritmo || "0:00/km",
      imagens: postImagePreviews.length > 0 ? postImagePreviews : ['/img/atividade_perfil.jpg'],
      curtidas: 0,
      created_at: new Date()
    }

    const { error } = await supabase.from('atividades').insert([novoPost])
    
    if (error) {
      console.error('Erro ao criar post:', error)
      addNotification('Erro', 'Não foi possível publicar a atividade', 'error')
      return
    }

    addNotification('Post criado!', 'Sua atividade foi publicada com sucesso!', 'success')
    setShowPostModal(false)
    setNewPost({
      atividade: '',
      local: '',
      distancia: '',
      tempo: '',
      ritmo: '',
      imagens: []
    })
    setPostImages([])
    setPostImagePreviews([])
    await loadUserPosts(user.id)
    await loadStats(user.id)
  }

  // ==================== DELETAR POST ====================
  const handleDeletePost = async () => {
    if (!postToDelete) return
    
    const { error } = await supabase
      .from('atividades')
      .delete()
      .eq('id', postToDelete.id)
    
    if (error) {
      addNotification('Erro', 'Não foi possível excluir a atividade', 'error')
      return
    }

    addNotification('Post excluído!', 'Sua atividade foi removida com sucesso.', 'info')
    setShowDeleteModal(false)
    setPostToDelete(null)
    await loadUserPosts(user.id)
    await loadStats(user.id)
  }

  const confirmDeletePost = (post) => {
    setPostToDelete(post)
    setShowDeleteModal(true)
  }

  // ==================== CURTIR POST ====================
  const handleCurtir = async (postId) => {
    if (likedPosts[postId]) {
      addNotification('Curtida', 'Você já curtiu este post!', 'warning')
      return
    }
    
    try {
      const { error } = await supabase.from('curtidas').insert([{ 
        atividade_id: postId, 
        usuario_id: user.id 
      }])
      
      if (error) throw error
      
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, curtidas: (post.curtidas || 0) + 1 } : post
      ))
      setLikedPosts({ ...likedPosts, [postId]: true })
      addNotification('Curtida!', 'Você curtiu esta atividade!', 'info')
    } catch (error) {
      console.error('Erro ao curtir:', error)
    }
  }

  // ==================== VER CURTIDAS ====================
  const handleVerCurtidas = (post) => {
    setSelectedPost(post)
    setShowLikesModal(true)
  }

  // ==================== VER COMENTÁRIOS ====================
  const handleVerComentarios = (post) => {
    setSelectedPost(post)
    setShowCommentsModal(true)
  }

  // ==================== ADICIONAR COMENTÁRIO ====================
  const handleAdicionarComentario = async (postId, comentarioTexto) => {
    if (!comentarioTexto.trim()) return
    
    const { error } = await supabase.from('comentarios').insert([{
      atividade_id: postId,
      usuario_id: user.id,
      texto: comentarioTexto,
      created_at: new Date()
    }])
    
    if (error) {
      addNotification('Erro', 'Não foi possível comentar', 'error')
      return
    }
    
    addNotification('Comentário adicionado!', 'Seu comentário foi publicado!', 'success')
  }

  // ==================== EDITAR PERFIL ====================
  const openEditModal = () => {
    setTempForm({ ...editForm })
    setTempAvatar(null)
    setTempCapa(null)
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
  }

  const salvarEdicoes = async () => {
    const updates = {}
    if (tempForm.nome !== editForm.nome) updates.nome = tempForm.nome
    if (tempForm.localizacao !== editForm.localizacao) updates.localizacao = tempForm.localizacao
    if (tempForm.bio !== editForm.bio) updates.bio = tempForm.bio
    if (tempAvatar) updates.avatar = tempAvatar
    if (tempCapa) updates.capa = tempCapa
    
    if (Object.keys(updates).length === 0) {
      addNotification('Atenção', 'Nenhuma alteração foi feita.', 'warning')
      closeEditModal()
      return
    }
    
    const result = await updateUser(updates)
    
    if (result.success) {
      setEditForm(prev => ({ ...prev, ...updates }))
      addNotification('Perfil atualizado!', 'Suas informações foram salvas com sucesso.', 'success')
      closeEditModal()
      await loadUserPosts(user.id)
    } else {
      addNotification('Erro', `Não foi possível salvar: ${result.error}`, 'error')
    }
  }

  const handleTempChange = (e) => {
    const { name, value } = e.target
    setTempForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setTempAvatar(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setTempCapa(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handlePostImageChange = (e) => {
    const files = Array.from(e.target.files)
    const newImages = [...postImages, ...files]
    if (newImages.length > 2) {
      addNotification('Limite de imagens', 'Máximo 2 imagens por post!', 'warning')
      return
    }
    setPostImages(newImages)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => setPostImagePreviews(prev => [...prev, reader.result])
      reader.readAsDataURL(file)
    })
  }

  const removePostImage = (index) => {
    setPostImages(prev => prev.filter((_, i) => i !== index))
    setPostImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleLogout = async () => {
    const confirmed = window.confirm('Tem certeza que deseja sair da sua conta?')
    if (confirmed) {
      logout()
      addNotification('Até logo!', 'Você saiu da sua conta.', 'info')
      navigate('/login')
    }
  }

  const compartilharPerfil = async () => {
    const link = `${window.location.origin}/perfil/${perfilUser?.id || user?.id}`
    await navigator.clipboard.writeText(link)
    addNotification('Link copiado!', 'Link do perfil copiado para compartilhar.', 'success')
  }

  const toggleEsporte = (sport) => {
    setActiveSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    )
  }

  if (!perfilUser) {
    return (
      <>
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando perfil...</p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <div className="perfil-page">
        {/* Hero Cover */}
        <div className="hero-cover">
          <img 
            src={editForm.capa} 
            alt="Capa" 
            onError={(e) => { e.target.src = '/img/banner_perfil.png' }}
          />
          {isOwnProfile && (
            <>
              <button className="edit-cover" onClick={() => coverInputRef.current?.click()}>
                <i className="fas fa-camera"></i> Editar capa
              </button>
              <input type="file" ref={coverInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleCoverChange} />
            </>
          )}
        </div>

        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-info">
              <div className="avatar-container" onClick={() => isOwnProfile && fileInputRef.current?.click()}>
                <img 
                  src={editForm.avatar} 
                  className="profile-avatar" 
                  alt="Perfil"
                  onError={(e) => { e.target.src = '/img/usuarios/default.jpg' }}
                />
                {isOwnProfile && (
                  <div className="avatar-overlay"><i className="fas fa-camera"></i></div>
                )}
              </div>
              {isOwnProfile && (
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
              )}
              <div>
                <div className="nome">
                  {editForm.nome}
                  {isOwnProfile ? (
                    <>
                      <button className="btn-edit-profile" onClick={openEditModal}>
                        <i className="fa-regular fa-pen-to-square"></i> Editar perfil
                      </button>
                      <button className="btn-logout" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i> Sair
                      </button>
                    </>
                  ) : (
                    <button className={`btn-follow ${estaSeguindo ? 'following' : ''}`} onClick={handleFollow}>
                      <i className={estaSeguindo ? 'fas fa-check' : 'fas fa-user-plus'}></i>
                      {estaSeguindo ? 'Seguindo' : 'Seguir'}
                    </button>
                  )}
                </div>
                <div className="profile-stats">
                  <div className="stat"><strong>{stats.atividades}</strong><span>Atividades</span></div>
                  <div className="stat"><strong>{stats.seguindo}</strong><span>Seguindo</span></div>
                  <div className="stat"><strong>{stats.seguidores}</strong><span>Seguidores</span></div>
                </div>
                <div className="profile-location">
                  <i className="fa-solid fa-location-dot"></i> {editForm.localizacao}
                </div>
                <div className="profile-bio">{editForm.bio}</div>
              </div>
            </div>
            <button className="btn-share" onClick={compartilharPerfil}>
              <i className="fa-solid fa-share-nodes"></i> Compartilhar perfil
            </button>
          </div>
        </div>

        {/* Modal de Edição */}
        {showEditModal && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Editar Perfil</h3>
                <button className="close-modal" onClick={closeEditModal}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome completo</label>
                  <input type="text" name="nome" value={tempForm.nome} onChange={handleTempChange} />
                </div>
                <div className="form-group">
                  <label>Localização</label>
                  <input type="text" name="localizacao" value={tempForm.localizacao} onChange={handleTempChange} />
                </div>
                <div className="form-group">
                  <label>Biografia</label>
                  <textarea name="bio" value={tempForm.bio} onChange={handleTempChange} rows="4" />
                </div>
                <div className="form-group">
                  <label>Avatar</label>
                  <div className="image-preview-area">
                    <img src={tempAvatar || tempForm.avatar} alt="Preview avatar" className="avatar-preview" />
                    <button type="button" className="btn-upload-image" onClick={() => fileInputRef.current?.click()}>
                      <i className="fas fa-camera"></i> Trocar imagem
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Capa de perfil</label>
                  <div className="image-preview-area capa-preview-area">
                    <img src={tempCapa || tempForm.capa} alt="Preview capa" className="capa-preview" />
                    <button type="button" className="btn-upload-image" onClick={() => coverInputRef.current?.click()}>
                      <i className="fas fa-camera"></i> Trocar capa
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={closeEditModal}>Cancelar</button>
                <button className="btn-save" onClick={salvarEdicoes}>Salvar alterações</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de exclusão */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content small-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                <h3>Excluir atividade</h3>
                <button className="close-modal" onClick={() => setShowDeleteModal(false)}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body" style={{ textAlign: 'center' }}>
                <p>Tem certeza que deseja excluir esta atividade?</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Esta ação não pode ser desfeita.</p>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button className="btn-delete" onClick={handleDeletePost}>Excluir</button>
              </div>
            </div>
          </div>
        )}

        <div className="main-layout">
          <div>
            <div className="tabs-container">
              <button className={`tab-button ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Visão geral</button>
              <button className={`tab-button ${activeTab === 'desafios' ? 'active' : ''}`} onClick={() => setActiveTab('desafios')}>Desafios Completos</button>
            </div>

            {isOwnProfile && (
              <div className="new-post-button-container">
                <button className="btn-new-post" onClick={() => setShowPostModal(true)}>
                  <i className="fas fa-plus-circle"></i> Novo post
                </button>
              </div>
            )}

            {activeTab === 'geral' ? (
              <div className="feed">
                {posts.length > 0 ? (
                  posts.map(post => (
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
                        <div>
                          <div className="feed-name">{post.usuario}</div>
                          <div className="feed-meta">{post.data} • <i className="fas fa-map-marker-alt"></i> {post.local}</div>
                        </div>
                        {isOwnProfile && (
                          <button className="delete-post-btn" onClick={() => confirmDeletePost(post)}>
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        )}
                      </div>
                      <div className="feed-activity"><i className={`fas ${post.icone}`}></i> {post.atividade}</div>
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
                            <img 
                              key={idx} 
                              src={img} 
                              alt="Atividade" 
                              onError={(e) => { e.target.src = '/img/atividade_perfil.jpg' }} 
                            />
                          ))}
                        </div>
                      </div>
                      <div className="feed-actions">
                        <button className="action-btn" onClick={() => handleVerCurtidas(post)}>
                          <i className="far fa-heart"></i> {post.curtidas} curtidas
                        </button>
                        <button className="action-btn" onClick={() => handleVerComentarios(post)}>
                          <i className="far fa-comment"></i> {post.comentarios?.length || 0} comentários
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-feed">
                    <i className="fas fa-camera"></i>
                    <h3>Nenhuma atividade ainda</h3>
                    <p>{isOwnProfile ? 'Clique em "Novo post" para compartilhar seu primeiro treino!' : 'Este usuário ainda não publicou atividades.'}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="desafios-completos-container">
                {carregandoDesafios ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Carregando desafios...</p>
                  </div>
                ) : desafiosCompletados.length === 0 ? (
                  <div className="empty-desafios">
                    <i className="fas fa-trophy"></i>
                    <h3>Desafios Completos</h3>
                    <p>{isOwnProfile ? 'Você ainda não completou nenhum desafio.' : 'Este usuário ainda não completou nenhum desafio.'}</p>
                    <p>Participe de desafios e ganhe medalhas exclusivas!</p>
                    {isOwnProfile && (
                      <button className="btn-ver-desafios" onClick={() => navigate('/desafios')}>
                        <i className="fas fa-play"></i> Ver desafios disponíveis
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="desafios-header">
                      <h2><i className="fas fa-medal"></i> Minhas Medalhas</h2>
                      <p>{desafiosCompletados.length} {desafiosCompletados.length === 1 ? 'desafio completado' : 'desafios completados'}</p>
                    </div>
                    <div className="medalhas-grid">
                      {desafiosCompletados.map(desafio => (
                        <div key={desafio.id} className="medalha-card">
                          <div className="medalha-imagem">
                            <img 
                              src={desafio.medalha_img || '/img/default-medal.png'} 
                              alt={desafio.titulo_desafio}
                              onError={(e) => { e.target.src = '/img/default-medal.png' }}
                            />
                          </div>
                          <div className="medalha-info">
                            <h4>{desafio.titulo_desafio}</h4>
                            <p className="medalha-data">
                              <i className="fas fa-calendar-check"></i> 
                              Completado em: {new Date(desafio.completado_em).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '35.5px', paddingTop: '80px' }}>
              <div className="sidebar-card">
                <h3><i className="fas fa-calendar-alt"></i> Calendário de Atividades</h3>
                <Calendar />
              </div>
              <br />
              <div className="sidebar-card">
                <div className="sidebar-title"><i className="fa-regular fa-calendar-check"></i> Total de Atividades</div>
                <div className="big-stat-number">{stats.atividades}</div>
                <div className="big-sub">Atividades no total</div>
              </div>
            </div>
            <div className="sidebar-card">
              <h3><i className="fa-solid fa-chart-bar"></i> Distância por mês</h3>
              <div className="monthly-stats">
                <div className="month-item"><span>Janeiro</span><div className="bar"><div style={{ width: '70%' }}></div></div><span>142 km</span></div>
                <div className="month-item"><span>Fevereiro</span><div className="bar"><div style={{ width: '85%' }}></div></div><span>168 km</span></div>
                <div className="month-item"><span>Março</span><div className="bar"><div style={{ width: '60%' }}></div></div><span>120 km</span></div>
              </div>
            </div>
            <div className="sidebar-card">
              <h3><i className="fa-solid fa-users"></i> Clubes Participantes</h3>
              <div className="club-list">
                <div className="club-item" onClick={() => navigate('/clubes')}>
                  <div className="club-icon"><img src="/img/outros/corredores_sjc.png" alt="Clube" /></div>
                  <span className="clube-name">Corredores de SJC e Região</span>
                  <i className="fas fa-chevron-right"></i>
                </div>
                <div className="club-item" onClick={() => navigate('/clubes')}>
                  <div className="club-icon"><img src="/img/outros/ciclotech.png" alt="Clube" /></div>
                  <span className="clube-name">Ciclotech</span>
                  <i className="fas fa-chevron-right"></i>
                </div>
                <div className="club-item" onClick={() => navigate('/clubes')}>
                  <div className="club-icon"><img src="/img/forza icon.png" alt="Clube" /></div>
                  <span className="clube-name">FORZA</span>
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Novo Post */}
        {showPostModal && (
          <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
            <div className="modal-content post-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Novo post</h3>
                <button className="close-modal" onClick={() => setShowPostModal(false)}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Título da atividade *</label>
                  <input type="text" placeholder="Ex: Corrida matinal..." value={newPost.atividade} onChange={(e) => setNewPost({ ...newPost, atividade: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Localização *</label>
                  <input type="text" placeholder="Ex: São José dos Campos, SP" value={newPost.local} onChange={(e) => setNewPost({ ...newPost, local: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Distância (km)</label>
                    <input type="text" placeholder="Ex: 5.92" value={newPost.distancia} onChange={(e) => setNewPost({ ...newPost, distancia: e.target.value })} />
                  </div>
                  <div className="form-group half">
                    <label>Tempo</label>
                    <input type="text" placeholder="Ex: 00:39:06" value={newPost.tempo} onChange={(e) => setNewPost({ ...newPost, tempo: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Ritmo médio</label>
                  <input type="text" placeholder="Ex: 6:35/km" value={newPost.ritmo} onChange={(e) => setNewPost({ ...newPost, ritmo: e.target.value })} />
                </div>
                <div className="fotos-section">
                  <div className="fotos-title"><i className="fas fa-image"></i> Fotos (máximo 2)</div>
                  <div className="fotos-grid">
                    {postImagePreviews.length < 1 ? (
                      <label className="foto-upload empty">
                        <i className="fas fa-plus"></i>
                        <span>Adicionar foto</span>
                        <input type="file" accept="image/*" onChange={handlePostImageChange} style={{ display: 'none' }} />
                      </label>
                    ) : (
                      <div className="foto-upload">
                        <div className="foto-preview">
                          <img src={postImagePreviews[0]} alt="Preview" />
                          <button className="foto-remove" onClick={() => removePostImage(0)}><i className="fas fa-times"></i></button>
                        </div>
                      </div>
                    )}
                    {postImagePreviews.length < 2 ? (
                      <label className="foto-upload empty">
                        <i className="fas fa-plus"></i>
                        <span>Adicionar foto</span>
                        <input type="file" accept="image/*" onChange={handlePostImageChange} style={{ display: 'none' }} />
                      </label>
                    ) : (
                      <div className="foto-upload">
                        <div className="foto-preview">
                          <img src={postImagePreviews[1]} alt="Preview" />
                          <button className="foto-remove" onClick={() => removePostImage(1)}><i className="fas fa-times"></i></button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowPostModal(false)}>Cancelar</button>
                <button className="btn-save" onClick={handleNewPost}>Publicar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Curtidas */}
        {showLikesModal && selectedPost && (
          <div className="modal-overlay" onClick={() => setShowLikesModal(false)}>
            <div className="modal-content small-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Curtidas ({selectedPost.curtidas})</h3>
                <button className="close-modal" onClick={() => setShowLikesModal(false)}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body likes-list">
                {selectedPost.curtidas > 0 ? (
                  Array.from({ length: Math.min(selectedPost.curtidas, 10) }).map((_, idx) => (
                    <div key={idx} className="like-item">
                      <img src="/img/usuarios/default.jpg" alt="Usuário" />
                      <div>
                        <strong>Usuário {idx+1}</strong>
                        <small>curtiu há {idx+1} hora(s)</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-comments">Nenhuma curtida ainda</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Comentários */}
        {showCommentsModal && selectedPost && (
          <div className="modal-overlay" onClick={() => setShowCommentsModal(false)}>
            <div className="modal-content comments-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-comments"></i> Comentários</h3>
                <button className="close-modal" onClick={() => setShowCommentsModal(false)}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body comments-list">
                {selectedPost.comentarios && selectedPost.comentarios.length > 0 ? (
                  selectedPost.comentarios.map((comentario, idx) => (
                    <div key={idx} className="comment-item">
                      <img src={comentario.avatar || '/img/usuarios/default.jpg'} alt={comentario.usuario} />
                      <div className="comment-content">
                        <div className="comment-header">
                          <strong>{comentario.usuario}</strong>
                          <span>{comentario.data}</span>
                        </div>
                        <p>{comentario.texto}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-comments">
                    <i className="fas fa-comment-dots"></i>
                    <p>Nenhum comentário ainda. Seja o primeiro!</p>
                  </div>
                )}
              </div>
              <div className="comment-input-area">
                <input 
                  type="text" 
                  id="newCommentInput" 
                  placeholder="Escreva um comentário..." 
                  onKeyPress={(e) => { 
                    if (e.key === 'Enter') { 
                      handleAdicionarComentario(selectedPost.id, e.target.value); 
                      e.target.value = '' 
                    } 
                  }} 
                />
                <button onClick={() => { 
                  const input = document.getElementById('newCommentInput'); 
                  handleAdicionarComentario(selectedPost.id, input.value); 
                  input.value = '' 
                }}>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}

export default Perfil