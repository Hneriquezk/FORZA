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
  const [likedPosts, setLikedPosts] = useState({})
  
  // Estados para posts
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
  const postImageInputRef = useRef(null)
  
  // Estados para edição de perfil
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    nome: "Vitor Vaz",
    localizacao: "São José dos Campos, SP · Brasil",
    bio: "Apaixonado por corrida e ciclismo | Maratonista | Treinando para Ironman",
    avatar: "/img/usuarios/vitor_vaz.jpg",
    capa: "/img/banner_perfil.png"
  })
  
  const [tempForm, setTempForm] = useState({ ...editForm })
  const [tempAvatar, setTempAvatar] = useState(null)
  const [tempCapa, setTempCapa] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [capaFile, setCapaFile] = useState(null)
  
  const fileInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const weeklyData = {
    running: [0, 4.2, 8.1, 0, 5.9, 0, 2.3],
    cycling: [0, 0, 12.4, 0, 14.2, 0, 19.8],
    swimming: [0, 1.5, 0, 2.0, 0, 1.8, 0]
  }

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const getCombinedData = () => {
    const combined = days.map((_, index) => {
      return activeSports.reduce((sum, sport) => sum + (weeklyData[sport]?.[index] || 0), 0)
    })
    return combined
  }

  const chartData = {
    labels: days,
    datasets: [{
      label: 'Distância (km)',
      data: getCombinedData(),
      backgroundColor: '#ff1e2d',
      borderRadius: 5,
      barPercentage: 0.7,
      categoryPercentage: 0.8
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'var(--text-secondary)', font: { size: 11 } } },
      y: { display: false, beginAtZero: true }
    }
  }

  useEffect(() => {
    loadPosts()
    loadLikedPosts()
    
    const savedProfile = localStorage.getItem('forza_perfil')
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      setEditForm(prev => ({ ...prev, ...profile }))
      setTempForm(prev => ({ ...prev, ...profile }))
    }
  }, [])

  const loadPosts = () => {
    const savedPosts = localStorage.getItem('forza_posts')
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts))
    } else {
      setPosts(postsData)
      localStorage.setItem('forza_posts', JSON.stringify(postsData))
    }
  }

  const loadLikedPosts = () => {
    const savedLiked = localStorage.getItem('forza_liked_posts')
    if (savedLiked) {
      setLikedPosts(JSON.parse(savedLiked))
    }
  }

  const saveLikedPosts = (newLiked) => {
    setLikedPosts(newLiked)
    localStorage.setItem('forza_liked_posts', JSON.stringify(newLiked))
  }

  const savePosts = (newPosts) => {
    setPosts(newPosts)
    localStorage.setItem('forza_posts', JSON.stringify(newPosts))
  }

  const handleNewPost = () => {
    if (!newPost.atividade || !newPost.local) {
      addNotification('Campos obrigatórios', 'Preencha o título e localização da atividade!', 'warning', 'fa-exclamation-circle')
      return
    }

    const novoPost = {
      id: Date.now(),
      usuarioId: 1,
      usuario: editForm.nome,
      avatar: editForm.avatar,
      data: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
      local: newPost.local,
      atividade: newPost.atividade,
      icone: 'fa-running',
      metricas: [
        { label: "Distância", valor: newPost.distancia || "0 km" },
        { label: "Tempo", valor: newPost.tempo || "00:00" },
        { label: "Ritmo", valor: newPost.ritmo || "0:00/km" }
      ],
      imagens: postImagePreviews.length > 0 ? postImagePreviews : ["/img/placeholder.jpg"],
      curtidas: 0,
      comentarios: []
    }

    const updatedPosts = [novoPost, ...posts]
    savePosts(updatedPosts)
    
    addNotification('Post criado!', 'Sua atividade foi publicada com sucesso!', 'success', 'fa-check-circle')
    
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
  }

  const handleDeletePost = () => {
    if (postToDelete) {
      const updatedPosts = posts.filter(post => post.id !== postToDelete.id)
      savePosts(updatedPosts)
      
      // Remover curtida do post deletado
      const newLiked = { ...likedPosts }
      delete newLiked[postToDelete.id]
      saveLikedPosts(newLiked)
      
      addNotification('Post excluído!', 'Sua atividade foi removida com sucesso.', 'info', 'fa-trash-alt')
      setShowDeleteModal(false)
      setPostToDelete(null)
    }
  }

  const confirmDeletePost = (post) => {
    setPostToDelete(post)
    setShowDeleteModal(true)
  }

  const handlePostImageChange = (e) => {
    const files = Array.from(e.target.files)
    const newImages = [...postImages, ...files]
    
    if (newImages.length > 2) {
      addNotification('Limite de imagens', 'Você pode adicionar no máximo 2 imagens por post!', 'warning', 'fa-exclamation-circle')
      return
    }
    
    setPostImages(newImages)
    
    const previews = [...postImagePreviews]
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        previews.push(reader.result)
        setPostImagePreviews([...previews])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePostImage = (index) => {
    const newImages = [...postImages]
    newImages.splice(index, 1)
    setPostImages(newImages)
    
    const newPreviews = [...postImagePreviews]
    newPreviews.splice(index, 1)
    setPostImagePreviews(newPreviews)
  }

  const handleCurtir = (postId) => {
    if (likedPosts[postId]) {
      addNotification('Curtida', 'Você já curtiu este post!', 'warning', 'fa-exclamation-circle')
      return
    }
    
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return { ...post, curtidas: post.curtidas + 1 }
      }
      return post
    })
    savePosts(updatedPosts)
    
    const newLiked = { ...likedPosts, [postId]: true }
    saveLikedPosts(newLiked)
    
    addNotification('Curtida!', 'Você curtiu esta atividade!', 'info', 'fa-heart')
  }

  const handleVerCurtidas = (post) => {
    setSelectedPost(post)
    setShowLikesModal(true)
  }

  const handleVerComentarios = (post) => {
    setSelectedPost(post)
    setShowCommentsModal(true)
  }

  const handleAdicionarComentario = (postId, comentarioTexto) => {
    if (!comentarioTexto.trim()) return
    
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const novoComentario = {
          usuario: editForm.nome,
          avatar: editForm.avatar,
          texto: comentarioTexto,
          data: "Agora mesmo"
        }
        return { ...post, comentarios: [...(post.comentarios || []), novoComentario] }
      }
      return post
    })
    savePosts(updatedPosts)
    addNotification('Comentário adicionado!', 'Seu comentário foi publicado!', 'success', 'fa-comment')
  }

  const handleLogout = async () => {
    const confirmed = await window.confirm('Tem certeza que deseja sair da sua conta?')
    if (confirmed) {
      logout()
      addNotification('Até logo!', 'Você saiu da sua conta. Volte sempre!', 'info', 'fa-sign-out-alt')
      navigate('/login')
    }
  }

  const compartilharPerfil = async () => {
    const link = `${window.location.origin}/perfil`
    try {
      await navigator.clipboard.writeText(link)
      addNotification('Link copiado!', 'Link do seu perfil copiado para compartilhar.', 'success', 'fa-share')
    } catch (err) {
      const textarea = document.createElement('textarea')
      textarea.value = link
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      addNotification('Link copiado!', 'Link do seu perfil copiado para compartilhar.', 'success', 'fa-share')
    }
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

  const openEditModal = () => {
    setTempForm({ ...editForm })
    setTempAvatar(null)
    setTempCapa(null)
    setAvatarFile(null)
    setCapaFile(null)
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setTempAvatar(null)
    setTempCapa(null)
    setAvatarFile(null)
    setCapaFile(null)
  }

  // FUNÇÃO CORRIGIDA - Salvar edições do perfil
  const salvarEdicoes = () => {
    const updatedProfile = { ...tempForm }
    
    // CORREÇÃO: Usar tempAvatar e tempCapa ao invés dos arquivos diretamente
    if (tempAvatar) {
      updatedProfile.avatar = tempAvatar
    }
    
    if (tempCapa) {
      updatedProfile.capa = tempCapa
    }
    
    setEditForm(updatedProfile)
    localStorage.setItem('forza_perfil', JSON.stringify(updatedProfile))
    
    // Atualizar também os posts existentes com o novo avatar e nome
    const savedPosts = localStorage.getItem('forza_posts')
    if (savedPosts) {
      const postsAtualizados = JSON.parse(savedPosts).map(post => {
        if (post.usuarioId === 1) {
          return { 
            ...post, 
            avatar: updatedProfile.avatar,
            usuario: updatedProfile.nome 
          }
        }
        return post
      })
      localStorage.setItem('forza_posts', JSON.stringify(postsAtualizados))
      setPosts(postsAtualizados)
    }
    
    addNotification('Perfil atualizado!', 'Suas informações foram salvas com sucesso.', 'success', 'fa-check-circle')
    closeEditModal()
  }

  const handleTempChange = (e) => {
    const { name, value } = e.target
    setTempForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  // FUNÇÃO CORRIGIDA - Mudar avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addNotification('Erro', 'A imagem deve ter no máximo 2MB!', 'error', 'fa-exclamation-circle')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempAvatar(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverClick = () => {
    coverInputRef.current?.click()
  }

  // FUNÇÃO CORRIGIDA - Mudar capa
  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addNotification('Erro', 'A imagem de capa deve ter no máximo 5MB!', 'error', 'fa-exclamation-circle')
        return
      }
      setCapaFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempCapa(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const userPosts = posts.filter(p => p.usuarioId === 1)

  return (
    <>
      <Header />
      
      <div className="perfil-page">
        {/* Hero Cover */}
        <div className="hero-cover">
          <img src={editForm.capa} alt="Capa" />
          <button className="edit-cover" onClick={handleCoverClick}>
            <i className="fas fa-camera"></i> Editar capa
          </button>
          <input
            type="file"
            ref={coverInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleCoverChange}
          />
        </div>

        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-info">
              <div className="avatar-container" onClick={handleAvatarClick}>
                <img src={editForm.avatar} className="profile-avatar" alt="Perfil" />
                <div className="avatar-overlay">
                  <i className="fas fa-camera"></i>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <div>
                <div className="nome">
                  {editForm.nome}
                  <button className="btn-edit-profile" onClick={openEditModal}>
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
                  <i className="fa-solid fa-location-dot"></i> {editForm.localizacao}
                </div>
                <div className="profile-bio">
                  {editForm.bio}
                </div>
              </div>
            </div>
            <button className="btn-share" onClick={compartilharPerfil}>
              <i className="fa-solid fa-share-nodes"></i> Compartilhar perfil
            </button>
          </div>
        </div>

        {/* Modal de Edição de Perfil - CORRIGIDO com preview de imagens */}
        {showEditModal && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Editar Perfil</h3>
                <button className="close-modal" onClick={closeEditModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome</label>
                  <input type="text" name="nome" value={tempForm.nome} onChange={handleTempChange} />
                </div>
                <div className="form-group">
                  <label>Localização</label>
                  <input type="text" name="localizacao" value={tempForm.localizacao} onChange={handleTempChange} />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea name="bio" value={tempForm.bio} onChange={handleTempChange} rows="4" />
                </div>
                
                {/* Preview do Avatar durante edição */}
                <div className="form-group">
                  <label>Avatar</label>
                  <div className="image-preview-area">
                    <img 
                      src={tempAvatar || tempForm.avatar} 
                      alt="Preview avatar" 
                      className="avatar-preview"
                    />
                    <button 
                      type="button" 
                      className="btn-upload-image" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="fas fa-camera"></i> Trocar imagem
                    </button>
                  </div>
                </div>

                {/* Preview da Capa durante edição */}
                <div className="form-group">
                  <label>Capa de perfil</label>
                  <div className="image-preview-area capa-preview-area">
                    <img 
                      src={tempCapa || tempForm.capa} 
                      alt="Preview capa" 
                      className="capa-preview"
                    />
                    <button 
                      type="button" 
                      className="btn-upload-image" 
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <i className="fas fa-camera"></i> Trocar capa
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={closeEditModal}>Cancelar</button>
                <button className="btn-save" onClick={salvarEdicoes}>Salvar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content small-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                <h3>Excluir atividade</h3>
                <button className="close-modal" onClick={() => setShowDeleteModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body" style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '8px' }}>Tem certeza que deseja excluir esta atividade?</p>
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
              <button className={`tab-button ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>
                Visão geral
              </button>
              <button className={`tab-button ${activeTab === 'desafios' ? 'active' : ''}`} onClick={() => setActiveTab('desafios')}>
                Desafios Completos
              </button>
            </div>

            {/* Botão Nova Atividade */}
            <div className="new-post-button-container">
              <button className="btn-new-post" onClick={() => setShowPostModal(true)}>
                <i className="fas fa-plus-circle"></i> Novo post
              </button>
            </div>

            {activeTab === 'geral' ? (
              <div className="feed">
                {userPosts.map(post => (
                  <div key={post.id} className="feed-card">
                    <div className="feed-header">
                      <img src={post.avatar} className="feed-avatar" alt={post.usuario} />
                      <div>
                        <div className="feed-name">{post.usuario}</div>
                        <div className="feed-meta">{post.data} • <i className="fas fa-map-marker-alt"></i> {post.local}</div>
                      </div>
                      <button className="delete-post-btn" onClick={() => confirmDeletePost(post)}>
                        <i className="fas fa-trash-alt"></i>
                      </button>
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
                    <div className="feed-actions">
                      <button className="action-btn" onClick={() => handleVerCurtidas(post)}>
                        <i className="far fa-heart"></i> {post.curtidas} curtidas
                      </button>
                      <button className="action-btn" onClick={() => handleVerComentarios(post)}>
                        <i className="far fa-comment"></i> {post.comentarios?.length || 0} comentários
                      </button>
                    </div>
                  </div>
                ))}
                
                {userPosts.length === 0 && (
                  <div className="empty-feed">
                    <i className="fas fa-camera"></i>
                    <h3>Nenhuma atividade ainda</h3>
                    <p>Clique em "Nova atividade" para compartilhar seu primeiro treino!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-desafios">
                <i className="fas fa-trophy"></i>
                <h3>Desafios Completos</h3>
                <p>Você ainda não completou nenhum desafio. Comece agora!</p>
                <button className="btn-ver-desafios" onClick={() => navigate('/desafios')}>
                  Ver desafios
                </button>
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
                <div className="sidebar-title">
                  <i className="fa-regular fa-calendar-check"></i> Total de Atividades
                </div>
                <div className="big-stat-number">{userPosts.length}</div>
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
                  <span className="clube-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Corredores de SJC e Região</span>
                  <i className="fas fa-chevron-right"></i>
                </div>
                <div className="club-item" onClick={() => navigate('/clubes')}>
                  <div className="club-icon"><img src="/img/outros/ciclotech.png" alt="Clube" /></div>
                  <span className="clube-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Ciclotech</span>
                  <i className="fas fa-chevron-right"></i>
                </div>
                <div className="club-item" onClick={() => navigate('/clubes')}>
                  <div className="club-icon"><img src="/img/forza icon.png" alt="Clube" /></div>
                  <span className="clube-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>FORZA</span>
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
                <button className="close-modal" onClick={() => setShowPostModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Título da atividade *</label>
                  <input
                    type="text"
                    placeholder="Ex: Corrida matinal, Pedal noturno..."
                    value={newPost.atividade}
                    onChange={(e) => setNewPost({ ...newPost, atividade: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Localização *</label>
                  <input
                    type="text"
                    placeholder="Ex: São José dos Campos, SP"
                    value={newPost.local}
                    onChange={(e) => setNewPost({ ...newPost, local: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Distância (km)</label>
                    <input
                      type="text"
                      placeholder="Ex: 5.92"
                      value={newPost.distancia}
                      onChange={(e) => setNewPost({ ...newPost, distancia: e.target.value })}
                    />
                  </div>
                  <div className="form-group half">
                    <label>Tempo</label>
                    <input
                      type="text"
                      placeholder="Ex: 00:39:06"
                      value={newPost.tempo}
                      onChange={(e) => setNewPost({ ...newPost, tempo: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Ritmo médio</label>
                  <input
                    type="text"
                    placeholder="Ex: 6:35/km"
                    value={newPost.ritmo}
                    onChange={(e) => setNewPost({ ...newPost, ritmo: e.target.value })}
                  />
                </div>
                <div className="fotos-section">
                  <div className="fotos-title">
                    <i className="fas fa-image"></i> Fotos (máximo 2)
                  </div>
                  
                  <div className="fotos-grid">
                    {/* Foto 1 */}
                    {postImagePreviews.length < 1 ? (
                      <label className="foto-upload empty">
                        <i className="fas fa-plus"></i>
                        <span>Adicionar foto</span>
                        <input type="file" accept="image/*" onChange={handlePostImageChange} style={{ display: 'none' }} />
                      </label>
                    ) : (
                      <div className="foto-upload">
                        <div className="foto-preview">
                          <img src={postImagePreviews[0]} alt="Preview 1" />
                          <button className="foto-remove" onClick={() => removePostImage(0)}>
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Foto 2 */}
                    {postImagePreviews.length < 2 ? (
                      <label className="foto-upload empty">
                        <i className="fas fa-plus"></i>
                        <span>Adicionar foto</span>
                        <input type="file" accept="image/*" onChange={handlePostImageChange} style={{ display: 'none' }} />
                      </label>
                    ) : (
                      <div className="foto-upload">
                        <div className="foto-preview">
                          <img src={postImagePreviews[1]} alt="Preview 2" />
                          <button className="foto-remove" onClick={() => removePostImage(1)}>
                            <i className="fas fa-times"></i>
                          </button>
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
                <button className="close-modal" onClick={() => setShowLikesModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body likes-list">
                {Array.from({ length: Math.min(selectedPost.curtidas, 10) }).map((_, idx) => (
                  <div key={idx} className="like-item">
                    <img src={idx % 2 === 0 ? "/img/usuarios/henrique_santosz.jpg" : "/img/usuarios/giovanni_borsoi.jpg"} alt="Usuário" />
                    <div>
                      <strong>{idx % 2 === 0 ? "Henrique Santosz" : "Giovanni Borsoi"}</strong>
                      <small>curtiu há {idx + 1} hora{idx > 0 ? 's' : ''} atrás</small>
                    </div>
                  </div>
                ))}
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
                <button className="close-modal" onClick={() => setShowCommentsModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body comments-list">
                {selectedPost.comentarios && selectedPost.comentarios.length > 0 ? (
                  selectedPost.comentarios.map((comentario, idx) => (
                    <div key={idx} className="comment-item">
                      <img src={comentario.avatar} alt={comentario.usuario} />
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
                    <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
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
                      handleAdicionarComentario(selectedPost.id, e.target.value)
                      e.target.value = ''
                    }
                  }}
                />
                <button onClick={() => {
                  const input = document.getElementById('newCommentInput')
                  handleAdicionarComentario(selectedPost.id, input.value)
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
        
        .avatar-container {
          position: relative;
          cursor: pointer;
        }
        
        .avatar-overlay {
          position: absolute;
          bottom: 5px;
          right: 5px;
          background: #ff1e2d;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: 0.2s;
        }
        
        .avatar-container:hover .avatar-overlay {
          opacity: 1;
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

        .btn-edit-profile {
          background: var(--border-light);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .btn-edit-profile:hover {
          background: #ff1e2d;
          border-color: #ff1e2d;
          color: white;
        }

        [data-theme="dark"] .btn-edit-profile {
          background: #2a2a2a;
          border-color: #444;
          color: #fff;
        }

        [data-theme="dark"] .btn-edit-profile i {
          color: #fff;
        }

        [data-theme="dark"] .btn-edit-profile:hover {
          background: #ff1e2d;
          border-color: #ff1e2d;
          color: white;
        }

        [data-theme="dark"] .btn-edit-profile:hover i {
          color: white;
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
        
        .new-post-button-container {
          margin-bottom: 24px;
        }
        
        .btn-new-post {
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 10px 20px;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: 0.2s;
        }
        
        .btn-new-post:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(255, 30, 45, 0.3);
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
          max-height: 1317px;
          overflow-y: auto;
          padding-right: 10px;
        }
        
        .feed-card {
          background: var(--bg-card);
          border-radius: 20px;
          padding: 20px;
          border: 1px solid var(--border-color);
          position: relative;
        }
        
        .feed-header {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          position: relative;
        }
        
        .delete-post-btn {
          position: absolute;
          top: 0;
          right: 0;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: 0.2s;
        }
        
        .delete-post-btn:hover {
          background: rgba(255, 30, 45, 0.1);
          color: #ff1e2d;
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
        
        .feed-actions {
          display: flex;
          gap: 24px;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
        }
        
        .action-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 30px;
          transition: 0.2s;
        }
        
        .action-btn:hover {
          background: var(--chat-bg);
          color: #ff1e2d;
        }
        
        .action-btn.liked {
          color: #ff1e2d;
        }
        
        .empty-feed {
          text-align: center;
          padding: 60px;
          background: var(--bg-card);
          border-radius: 24px;
          border: 1px solid var(--border-color);
        }
        
        .empty-feed i {
          font-size: 48px;
          color: #ff1e2d;
          margin-bottom: 16px;
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
        
        .big-number, .big-stat-number {
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
        
        /* Modais */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        
        .modal-content {
          background: var(--bg-card);
          border-radius: 28px;
          max-width: 550px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
        }
        
        .small-modal {
          max-width: 400px;
        }
        
        .btn-delete {
          flex: 1;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border: none;
          padding: 12px;
          border-radius: 40px;
          font-weight: 600;
          color: white;
          cursor: pointer;
        }
        
        .form-row { display: flex; gap: 16px; }
        .half { flex: 1; }
        
        /* Botões de upload de imagem */
        .btn-upload-image {
          background: var(--border-light);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .btn-upload-image:hover {
          background: #ff1e2d;
          border-color: #ff1e2d;
          color: white;
        }

        .btn-upload-image i {
          font-size: 12px;
        }

        .image-preview-area {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 8px;
        }

        .avatar-preview {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #ff1e2d;
        }

        .capa-preview {
          width: 100%;
          height: 100px;
          object-fit: cover;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .capa-preview-area {
          flex-direction: column;
          align-items: flex-start;
        }

        /* Modo claro específico */
        [data-theme="light"] .btn-upload-image {
          background: #f0f2f8;
          color: #1a1a1a;
          border-color: #e2e8f0;
        }

        [data-theme="light"] .btn-upload-image i {
          color: #666;
        }

        /* Modo escuro específico */
        [data-theme="dark"] .btn-upload-image {
          background: #2a2a2a;
          color: #ffffff;
          border-color: #444444;
        }

        [data-theme="dark"] .btn-upload-image i {
          color: #aaa;
        }

        [data-theme="dark"] .btn-upload-image:hover {
          background: #ff1e2d;
          border-color: #ff1e2d;
          color: white;
        }

        [data-theme="dark"] .btn-upload-image:hover i {
          color: white;
        }
        
        .modal-header {
          padding: 20px;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
        }
        .close-modal {
          background: rgba(255,255,255,0.2);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          color: white;
          cursor: pointer;
        }
        .modal-body { padding: 24px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary); }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 14px;
        }
        .likes-list, .comments-list { max-height: 400px; overflow-y: auto; }
        .like-item, .comment-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid var(--border-color); }
        .like-item img, .comment-item img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
        .comment-content { flex: 1; }
        .comment-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .comment-header strong { font-size: 13px; }
        .comment-header span { font-size: 11px; color: var(--text-secondary); }
        .comment-content p { font-size: 13px; margin: 0; }
        .empty-comments { text-align: center; padding: 40px; color: var(--text-secondary); }
        .empty-comments i { font-size: 48px; margin-bottom: 12px; }
        .comment-input-area { display: flex; gap: 12px; padding: 16px; border-top: 1px solid var(--border-color); }
        .comment-input-area input { flex: 1; padding: 10px 14px; border: 1px solid var(--border-color); border-radius: 30px; background: var(--input-bg); color: var(--text-primary); }
        .comment-input-area button { background: #ff1e2d; border: none; width: 42px; height: 42px; border-radius: 50%; color: white; cursor: pointer; }
        .modal-footer { padding: 16px 24px; display: flex; gap: 12px; border-top: 1px solid var(--border-color); }
        .btn-cancel { flex: 1; background: var(--border-light); border: none; padding: 12px; border-radius: 40px; font-weight: 600; cursor: pointer; }
        .btn-save { flex: 1; background: linear-gradient(135deg, #ff1e2d, #e5182a); border: none; padding: 12px; border-radius: 40px; font-weight: 600; color: white; cursor: pointer; }
        
        /* Seção de Fotos */
        .fotos-section {
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
          margin-top: 8px;
        }

        .fotos-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .fotos-title i {
          color: #ff1e2d;
          font-size: 14px;
        }

        .fotos-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .foto-upload {
          border: 1px dashed var(--border-color);
          border-radius: 12px;
          background: var(--chat-bg);
          cursor: pointer;
          transition: 0.2s;
          overflow: hidden;
          aspect-ratio: 1/1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .foto-upload.empty {
          gap: 8px;
        }

        .foto-upload.empty i {
          font-size: 28px;
          color: var(--text-secondary);
        }

        .foto-upload.empty span {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .foto-preview {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .foto-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .foto-remove {
          position: absolute;
          top: 6px;
          right: 6px;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
          font-size: 10px;
        }

        .foto-remove:hover {
          background: #ff1e2d;
          transform: scale(1.05);
        }

        .btn-cancel {
          flex: 1;
          background: var(--border-light);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: var(--border-color);
          transform: translateY(-1px);
        }

        [data-theme="light"] .btn-cancel {
          background: #f0f2f8;
          color: #1a1a1a;
          border-color: #e2e8f0;
        }

        [data-theme="light"] .btn-cancel:hover {
          background: #e2e8f0;
        }

        [data-theme="dark"] .btn-cancel {
          background: #2a2a2a;
          color: #ffffff;
          border-color: #444444;
        }

        [data-theme="dark"] .btn-cancel:hover {
          background: #3a3a3a;
          border-color: #ff1e2d;
        }

        .btn-save {
          flex: 1;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 12px;
          border-radius: 40px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-save:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(255, 30, 45, 0.3);
        }

        /* Botão Ver Desafios */
        .btn-ver-desafios {
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 12px 28px;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s ease;
          margin-top: 16px;
          box-shadow: 0 2px 8px rgba(255, 30, 45, 0.2);
        }

        .btn-ver-desafios:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 30, 45, 0.35);
          background: linear-gradient(135deg, #ff3543, #cc1825);
        }

        .btn-ver-desafios:active {
          transform: translateY(0);
        }

        /* Modo claro */
        [data-theme="light"] .btn-ver-desafios {
          box-shadow: 0 2px 8px rgba(255, 30, 45, 0.15);
        }

        /* Modo escuro */
        [data-theme="dark"] .btn-ver-desafios {
          box-shadow: 0 2px 8px rgba(255, 30, 45, 0.3);
        }

        /* Estilos adicionais para o empty-desafios */
        .empty-desafios {
          background: var(--bg-card);
          border-radius: 24px;
          padding: 60px 40px;
          text-align: center;
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .empty-desafios i {
          font-size: 64px;
          color: #ff1e2d;
          margin-bottom: 20px;
        }

        .empty-desafios h3 {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .empty-desafios p {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        
        @media (max-width: 768px) {
          .main-layout { grid-template-columns: 1fr; }
          .profile-card { flex-direction: column; text-align: center; }
          .profile-info { flex-direction: column; }
          .profile-stats { justify-content: center; }
          .feed-images .image-grid { flex-direction: column; }
          .feed-images img { width: 100%; }
          .modality-toggles { flex-direction: column; }
          .nome { justify-content: center; }
          .form-row { flex-direction: column; }
          .new-post-button-container { text-align: center; }
        }
      `}</style>
    </>
  )
}

export default Perfil