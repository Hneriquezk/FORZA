import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ClubeChat from '../components/ClubeChat';
import './ClubeDetalhes.css';

function ClubeDetalhes() {
  const navigate = useNavigate();
  const { clubeId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sobre');
  const [isMembro, setIsMembro] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clube, setClube] = useState(null);
  const [membros, setMembros] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [treinos, setTreinos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage1, setNewPostImage1] = useState(null);
  const [newPostImage2, setNewPostImage2] = useState(null);
  const [newPostImagePreview1, setNewPostImagePreview1] = useState(null);
  const [newPostImagePreview2, setNewPostImagePreview2] = useState(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [comentarioTexto, setComentarioTexto] = useState({});
  const [showComentarios, setShowComentarios] = useState({});
  const [rankingData, setRankingData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditImagensModal, setShowEditImagensModal] = useState(false);
  const [showMembrosModal, setShowMembrosModal] = useState(false);
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState([]);
  const [showSolicitacoesModal, setShowSolicitacoesModal] = useState(false);
  const [showEventoModal, setShowEventoModal] = useState(false);
  const [showTreinoModal, setShowTreinoModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editImagensData, setEditImagensData] = useState({ capa: '', avatar: '' });
  const [capaPreview, setCapaPreview] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [novoEvento, setNovoEvento] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    local: '',
    vagas: 50,
    km: 0
  });
  const [novoTreino, setNovoTreino] = useState({
    dia: '',
    horario: '',
    local: '',
    tipo: 'treino'
  });

  // Estados para Desafios
  const [desafios, setDesafios] = useState([]);
  const [showDesafioModal, setShowDesafioModal] = useState(false);
  const [novoDesafio, setNovoDesafio] = useState({
    titulo: '',
    descricao: '',
    descricaoLonga: '',
    dataInicio: '',
    dataFim: '',
    atividade: '',
    premiacao: '',
    regras: '',
    medalhaImagem: '',
    bannerImagem: ''
  });
  const [medalhaPreview, setMedalhaPreview] = useState(null);
  const [bannerDesafioPreview, setBannerDesafioPreview] = useState(null);
  const medalhaInputRef = useRef(null);
  const bannerDesafioInputRef = useRef(null);

  const capaInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const carregarClubePersonalizado = () => {
    const savedPersonalizados = localStorage.getItem('forza_clubes_personalizados');
    if (savedPersonalizados) {
      const personalizados = JSON.parse(savedPersonalizados);
      const found = personalizados.find(c => c.id === parseInt(clubeId));
      if (found) {
        return found;
      }
    }
    return null;
  };

  const clubesData = {
    1: {
      id: 1,
      nome: "Corredores de São José e Região",
      nomeAbreviado: "Corredores SJC",
      avatar: "/img/clubes/corredores_sjc_avatar.jpg",
      capa: "/img/clubes/corredores_sjc.jpg",
      descricao: "Somos um grupo de corredores apaixonados por corrida de rua, trilha e bem-estar.",
      sobre: "Fundado em 2018, o Clube Corredores de São José e Região reúne atletas amadores e profissionais.",
      localizacao: "São José dos Campos, SP, Brasil",
      regiao: "Vale do Paraíba",
      membrosCount: 547,
      eventoCount: 28,
      fundacao: "2018",
      tipo: "Público",
      categoria: "Corrida",
      verificado: true,
      redes: {
        instagram: "@corredores_sjc",
        twitter: "Corredores SJC",
        whatsapp: "Grupo Oficial"
      },
      horarios: {
        terça: "19h30 - Parque da Cidade",
        quinta: "19h30 - Parque da Cidade",
        sábado: "07h00 - Longão (local varia)"
      },
      criadorId: null
    }
  };

  const carregarEventos = () => {
    const savedEventos = localStorage.getItem(`clube_eventos_${clubeId}`);
    if (savedEventos) {
      setEventos(JSON.parse(savedEventos));
    }
  };

  const carregarTreinos = () => {
    const savedTreinos = localStorage.getItem(`clube_treinos_${clubeId}`);
    if (savedTreinos) {
      setTreinos(JSON.parse(savedTreinos));
    } else if (clube?.horarios) {
      const treinosIniciais = Object.entries(clube.horarios).map(([dia, horario], index) => ({
        id: Date.now() + index,
        dia: dia.charAt(0).toUpperCase() + dia.slice(1),
        horario: horario.split(' - ')[0],
        local: horario.split(' - ')[1] || 'Local a definir',
        tipo: 'treino'
      }));
      setTreinos(treinosIniciais);
      localStorage.setItem(`clube_treinos_${clubeId}`, JSON.stringify(treinosIniciais));
    }
  };

  const carregarDesafios = () => {
    const savedDesafios = localStorage.getItem(`clube_desafios_${clubeId}`);
    if (savedDesafios) {
      setDesafios(JSON.parse(savedDesafios));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const clubePersonalizadoEncontrado = carregarClubePersonalizado();
    
    let clubeAtual = null;
    if (clubePersonalizadoEncontrado) {
      clubeAtual = clubePersonalizadoEncontrado;
    } else if (clubesData[clubeId]) {
      clubeAtual = clubesData[clubeId];
    }

    if (clubeAtual) {
      setClube(clubeAtual);
      
      const isUserAdmin = clubeAtual.criadorId === user?.id;
      setIsAdmin(isUserAdmin);
      
      const savedMembros = localStorage.getItem(`clube_membros_${clubeId}`);
      if (savedMembros) {
        setMembros(JSON.parse(savedMembros));
      } else {
        const membrosIniciais = [
          {
            id: clubeAtual.criadorId || user?.id || 1,
            nome: clubeAtual.criadorNome || user?.nome || "Administrador",
            avatar: user?.avatar || "/img/usuarios/default.jpg",
            cargo: "Administrador",
            atividades: 0,
            dataEntrada: new Date().toISOString(),
            banido: false
          }
        ];
        setMembros(membrosIniciais);
        localStorage.setItem(`clube_membros_${clubeId}`, JSON.stringify(membrosIniciais));
      }
      
      const savedSolicitacoes = localStorage.getItem(`clube_solicitacoes_${clubeId}`);
      if (savedSolicitacoes) {
        setSolicitacoesPendentes(JSON.parse(savedSolicitacoes));
      }
      
      carregarEventos();
      carregarTreinos();
      carregarDesafios();
      
      const clubesParticipados = JSON.parse(localStorage.getItem('forza_clubes_membros') || '[]');
      setIsMembro(clubesParticipados.includes(parseInt(clubeId)));
      
      loadPosts();
      calcularRanking();
    } else {
      navigate('/clubes');
    }
    
    setLoading(false);
  }, [isAuthenticated, navigate, clubeId, user]);

  const loadPosts = () => {
    const savedPosts = localStorage.getItem(`clube_posts_${clubeId}`);
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      const initialPosts = [
        {
          id: Date.now(),
          usuario: user?.nome || "Administrador",
          avatar: user?.avatar || "/img/usuarios/default.jpg",
          mensagem: `🎉 Bem-vindos ao clube! Estamos muito felizes em ter vocês aqui.`,
          imagem1: null,
          imagem2: null,
          curtidas: 0,
          comentarios: [],
          data: new Date().toISOString(),
          curtido: false
        }
      ];
      setPosts(initialPosts);
      localStorage.setItem(`clube_posts_${clubeId}`, JSON.stringify(initialPosts));
    }
  };

  const savePosts = (newPosts) => {
    setPosts(newPosts);
    localStorage.setItem(`clube_posts_${clubeId}`, JSON.stringify(newPosts));
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Tem certeza que deseja excluir esta postagem?')) {
      const updatedPosts = posts.filter(post => post.id !== postId);
      savePosts(updatedPosts);
      addNotification('Postagem excluída', 'A postagem foi removida com sucesso.', 'success', 'fa-trash');
    }
  };

  const handleCurtir = (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const novoCurtido = !post.curtido;
        return {
          ...post,
          curtidas: novoCurtido ? post.curtidas + 1 : post.curtidas - 1,
          curtido: novoCurtido
        };
      }
      return post;
    });
    savePosts(updatedPosts);
  };

  const handleComentar = (postId) => {
    const texto = comentarioTexto[postId];
    if (!texto?.trim()) return;
    
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const novoComentario = {
          id: Date.now(),
          usuario: user?.nome || "Você",
          mensagem: texto,
          tempo: "Agora mesmo"
        };
        return { ...post, comentarios: [...post.comentarios, novoComentario] };
      }
      return post;
    });
    savePosts(updatedPosts);
    setComentarioTexto({ ...comentarioTexto, [postId]: '' });
  };

  const toggleComentarios = (postId) => {
    setShowComentarios(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleNovaPostagem = () => {
    if (!newPostText.trim()) {
      addNotification('Erro', 'Digite algo para publicar!', 'warning', 'fa-exclamation-circle');
      return;
    }
    
    const novaPostagem = {
      id: Date.now(),
      usuario: user?.nome || "Você",
      avatar: user?.avatar || "/img/usuarios/default.jpg",
      mensagem: newPostText,
      imagem1: newPostImage1,
      imagem2: newPostImage2,
      curtidas: 0,
      comentarios: [],
      data: new Date().toISOString(),
      curtido: false
    };
    
    const updatedPosts = [novaPostagem, ...posts];
    savePosts(updatedPosts);
    setNewPostText('');
    setNewPostImage1(null);
    setNewPostImage2(null);
    setNewPostImagePreview1(null);
    setNewPostImagePreview2(null);
    setShowNewPostModal(false);
    addNotification('Postagem criada!', 'Sua postagem foi publicada no clube.', 'success', 'fa-newspaper');
  };

  const handleImageUpload = (e, setImage, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addNotification('Erro', 'A imagem deve ter no máximo 5MB!', 'error', 'fa-exclamation-circle');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (setImage, setPreview) => {
    setImage(null);
    setPreview(null);
  };

  // Funções de Eventos
  const handleAddEvento = () => {
    if (!novoEvento.titulo || !novoEvento.data || !novoEvento.hora) {
      addNotification('Erro', 'Preencha todos os campos obrigatórios!', 'error', 'fa-exclamation-circle');
      return;
    }
    
    const evento = {
      id: Date.now(),
      ...novoEvento,
      inscritos: 0
    };
    
    const novosEventos = [...eventos, evento];
    setEventos(novosEventos);
    localStorage.setItem(`clube_eventos_${clubeId}`, JSON.stringify(novosEventos));
    setShowEventoModal(false);
    setNovoEvento({
      titulo: '',
      descricao: '',
      data: '',
      hora: '',
      local: '',
      vagas: 50,
      km: 0
    });
    addNotification('Evento criado', 'O evento foi adicionado com sucesso!', 'success', 'fa-calendar-plus');
  };

  const handleDeleteEvento = (eventoId) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      const novosEventos = eventos.filter(e => e.id !== eventoId);
      setEventos(novosEventos);
      localStorage.setItem(`clube_eventos_${clubeId}`, JSON.stringify(novosEventos));
      addNotification('Evento excluído', 'O evento foi removido com sucesso.', 'success', 'fa-trash');
    }
  };

  // Funções de Treinos
  const handleAddTreino = () => {
    if (!novoTreino.dia || !novoTreino.horario) {
      addNotification('Erro', 'Preencha todos os campos obrigatórios!', 'error', 'fa-exclamation-circle');
      return;
    }
    
    const treino = {
      id: Date.now(),
      ...novoTreino
    };
    
    const novosTreinos = [...treinos, treino];
    setTreinos(novosTreinos);
    localStorage.setItem(`clube_treinos_${clubeId}`, JSON.stringify(novosTreinos));
    setShowTreinoModal(false);
    setNovoTreino({
      dia: '',
      horario: '',
      local: '',
      tipo: 'treino'
    });
    addNotification('Treino adicionado', 'O treino foi adicionado com sucesso!', 'success', 'fa-dumbbell');
  };

  const handleDeleteTreino = (treinoId) => {
    if (window.confirm('Tem certeza que deseja excluir este treino?')) {
      const novosTreinos = treinos.filter(t => t.id !== treinoId);
      setTreinos(novosTreinos);
      localStorage.setItem(`clube_treinos_${clubeId}`, JSON.stringify(novosTreinos));
      addNotification('Treino excluído', 'O treino foi removido com sucesso.', 'success', 'fa-trash');
    }
  };

  // Funções de Desafios
  const handleAddDesafio = () => {
    if (!novoDesafio.titulo || !novoDesafio.dataInicio || !novoDesafio.dataFim) {
      addNotification('Erro', 'Preencha todos os campos obrigatórios!', 'error', 'fa-exclamation-circle');
      return;
    }
    
    const desafio = {
      id: Date.now(),
      ...novoDesafio,
      participantes: 0,
      completaram: 0,
      dataCriacao: new Date().toISOString()
    };
    
    const novosDesafios = [...desafios, desafio];
    setDesafios(novosDesafios);
    localStorage.setItem(`clube_desafios_${clubeId}`, JSON.stringify(novosDesafios));
    setShowDesafioModal(false);
    setNovoDesafio({
      titulo: '',
      descricao: '',
      descricaoLonga: '',
      dataInicio: '',
      dataFim: '',
      atividade: '',
      premiacao: '',
      regras: '',
      medalhaImagem: '',
      bannerImagem: ''
    });
    setMedalhaPreview(null);
    setBannerDesafioPreview(null);
    addNotification('Desafio criado!', 'O desafio foi adicionado com sucesso!', 'success', 'fa-trophy');
  };

  const handleDeleteDesafio = (desafioId) => {
    if (window.confirm('Tem certeza que deseja excluir este desafio?')) {
      const novosDesafios = desafios.filter(d => d.id !== desafioId);
      setDesafios(novosDesafios);
      localStorage.setItem(`clube_desafios_${clubeId}`, JSON.stringify(novosDesafios));
      addNotification('Desafio excluído', 'O desafio foi removido com sucesso.', 'success', 'fa-trash');
    }
  };

  const handleMedalhaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMedalhaPreview(reader.result);
        setNovoDesafio(prev => ({ ...prev, medalhaImagem: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerDesafioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerDesafioPreview(reader.result);
        setNovoDesafio(prev => ({ ...prev, bannerImagem: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Funções de Ranking
  const calcularRanking = () => {
    const membrosAtivos = membros.filter(m => !m.banido);
    const participantesEventos = membrosAtivos.map((membro, index) => ({
      id: membro.id,
      usuario: membro.nome,
      avatar: membro.avatar,
      quilometragem: Math.floor(Math.random() * 200) + 10,
      eventos: Math.floor(Math.random() * 15) + 1
    })).sort((a, b) => b.quilometragem - a.quilometragem);
    
    setRankingData(participantesEventos);
    setLastUpdate(new Date().toLocaleDateString());
  };

  const atualizarRanking = () => {
    calcularRanking();
    addNotification('Ranking atualizado!', 'A classificação do clube foi atualizada.', 'info', 'fa-chart-line');
  };

  // Funções de Membro
  const entrarNoClube = async () => {
    if (isMembro) {
      addNotification('Clube', `Você já é membro do ${clube.nome}!`, 'warning', 'fa-exclamation-circle');
      return;
    }
    
    if (clube.tipo === 'Privado') {
      const solicitacao = {
        userId: user?.id,
        userName: user?.nome,
        userAvatar: user?.avatar,
        data: new Date().toISOString()
      };
      
      const novasSolicitacoes = [...solicitacoesPendentes, solicitacao];
      setSolicitacoesPendentes(novasSolicitacoes);
      localStorage.setItem(`clube_solicitacoes_${clubeId}`, JSON.stringify(novasSolicitacoes));
      addNotification('Solicitação enviada', `Sua solicitação para entrar em ${clube.nome} foi enviada.`, 'info', 'fa-clock');
    } else {
      const confirmed = await window.confirm(`Deseja participar do clube "${clube.nome}"?`);
      if (confirmed) {
        const clubesParticipados = JSON.parse(localStorage.getItem('forza_clubes_membros') || '[]');
        if (!clubesParticipados.includes(clube.id)) {
          clubesParticipados.push(clube.id);
          localStorage.setItem('forza_clubes_membros', JSON.stringify(clubesParticipados));
        }
        setIsMembro(true);
        
        const novoMembro = {
          id: user?.id,
          nome: user?.nome,
          avatar: user?.avatar || "/img/usuarios/default.jpg",
          cargo: "Membro",
          atividades: 0,
          dataEntrada: new Date().toISOString(),
          banido: false
        };
        
        const novosMembros = [...membros, novoMembro];
        setMembros(novosMembros);
        localStorage.setItem(`clube_membros_${clubeId}`, JSON.stringify(novosMembros));
        
        addNotification('Clube', `Você entrou no clube "${clube.nome}"! Bem-vindo(a)!`, 'success', 'fa-check-circle');
      }
    }
  };

  const sairDoClube = async () => {
    const confirmed = await window.confirm(`Tem certeza que deseja sair do clube "${clube.nome}"?`);
    if (confirmed) {
      const clubesParticipados = JSON.parse(localStorage.getItem('forza_clubes_membros') || '[]');
      const novos = clubesParticipados.filter(id => id !== clube.id);
      localStorage.setItem('forza_clubes_membros', JSON.stringify(novos));
      setIsMembro(false);
      
      addNotification('Clube', `Você saiu do clube "${clube.nome}".`, 'info', 'fa-sign-out-alt');
      navigate('/clubes');
    }
  };

  // Funções Admin
  const handleEditClube = () => {
    setEditFormData({
      nome: clube.nome,
      descricao: clube.descricao,
      sobre: clube.sobre || '',
      localizacao: clube.localizacao || '',
      regiao: clube.regiao || '',
      tipo: clube.tipo || 'Público',
      categoria: clube.categoria || 'Corrida',
      instagram: clube.redes?.instagram || '',
      twitter: clube.redes?.twitter || '',
      whatsapp: clube.redes?.whatsapp || ''
    });
    setShowEditModal(true);
  };

  const handleEditImagens = () => {
    setEditImagensData({
      capa: clube.capa,
      avatar: clube.avatar
    });
    setCapaPreview(clube.capa);
    setAvatarPreview(clube.avatar);
    setShowEditImagensModal(true);
  };

  const saveImagensEdits = () => {
    const updatedClube = {
      ...clube,
      capa: editImagensData.capa,
      avatar: editImagensData.avatar
    };
    
    setClube(updatedClube);
    
    const savedPersonalizados = localStorage.getItem('forza_clubes_personalizados');
    if (savedPersonalizados) {
      const personalizados = JSON.parse(savedPersonalizados);
      const updated = personalizados.map(c => 
        c.id === parseInt(clubeId) ? { ...c, capa: editImagensData.capa, avatar: editImagensData.avatar } : c
      );
      localStorage.setItem('forza_clubes_personalizados', JSON.stringify(updated));
    }
    
    setShowEditImagensModal(false);
    addNotification('Imagens atualizadas', 'As imagens do clube foram atualizadas com sucesso!', 'success', 'fa-check-circle');
  };

  const handleCapaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapaPreview(reader.result);
        setEditImagensData(prev => ({ ...prev, capa: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setEditImagensData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveClubeEdits = () => {
    const updatedClube = {
      ...clube,
      nome: editFormData.nome,
      descricao: editFormData.descricao,
      sobre: editFormData.sobre,
      localizacao: editFormData.localizacao,
      regiao: editFormData.regiao,
      tipo: editFormData.tipo,
      categoria: editFormData.categoria,
      redes: {
        instagram: editFormData.instagram,
        twitter: editFormData.twitter,
        whatsapp: editFormData.whatsapp
      }
    };
    
    setClube(updatedClube);
    
    const savedPersonalizados = localStorage.getItem('forza_clubes_personalizados');
    if (savedPersonalizados) {
      const personalizados = JSON.parse(savedPersonalizados);
      const updated = personalizados.map(c => 
        c.id === parseInt(clubeId) ? { ...c, ...updatedClube } : c
      );
      localStorage.setItem('forza_clubes_personalizados', JSON.stringify(updated));
    }
    
    setShowEditModal(false);
    addNotification('Clube atualizado', 'As informações do clube foram atualizadas com sucesso!', 'success', 'fa-check-circle');
  };

  const handleBanirMembro = (membroId, membroNome) => {
    if (membroId === user?.id) {
      addNotification('Erro', 'Você não pode banir a si mesmo!', 'error', 'fa-exclamation-circle');
      return;
    }
    if (window.confirm(`Tem certeza que deseja banir ${membroNome} do clube?`)) {
      const membroAtualizado = membros.map(m => 
        m.id === membroId ? { ...m, banido: true, cargo: "Banido" } : m
      );
      setMembros(membroAtualizado);
      localStorage.setItem(`clube_membros_${clubeId}`, JSON.stringify(membroAtualizado));
      
      const globalMembros = JSON.parse(localStorage.getItem('forza_clubes_membros') || '[]');
      const index = globalMembros.indexOf(parseInt(clubeId));
      if (index > -1) {
        globalMembros.splice(index, 1);
        localStorage.setItem('forza_clubes_membros', JSON.stringify(globalMembros));
      }
      
      addNotification('Membro banido', `${membroNome} foi banido do clube.`, 'warning', 'fa-ban');
    }
  };

  const handleDesbanirMembro = (membroId, membroNome) => {
    if (window.confirm(`Tem certeza que deseja desbanir ${membroNome}?`)) {
      const membroAtualizado = membros.map(m => 
        m.id === membroId ? { ...m, banido: false, cargo: "Membro" } : m
      );
      setMembros(membroAtualizado);
      localStorage.setItem(`clube_membros_${clubeId}`, JSON.stringify(membroAtualizado));
      addNotification('Membro desbanido', `${membroNome} foi desbanido e pode retornar ao clube.`, 'success', 'fa-user-check');
    }
  };

  const handleRemoverMembro = (membroId, membroNome) => {
    if (membroId === user?.id) {
      addNotification('Erro', 'Você não pode remover a si mesmo! Use a opção "Sair do Clube".', 'error', 'fa-exclamation-circle');
      return;
    }
    if (window.confirm(`Tem certeza que deseja remover ${membroNome} do clube?`)) {
      const novosMembros = membros.filter(m => m.id !== membroId);
      setMembros(novosMembros);
      localStorage.setItem(`clube_membros_${clubeId}`, JSON.stringify(novosMembros));
      
      const globalMembros = JSON.parse(localStorage.getItem('forza_clubes_membros') || '[]');
      const index = globalMembros.indexOf(parseInt(clubeId));
      if (index > -1) {
        globalMembros.splice(index, 1);
        localStorage.setItem('forza_clubes_membros', JSON.stringify(globalMembros));
      }
      
      addNotification('Membro removido', `${membroNome} foi removido do clube.`, 'info', 'fa-user-minus');
    }
  };

  const handlePromoverAdmin = (membroId, membroNome) => {
    if (window.confirm(`Tem certeza que deseja promover ${membroNome} a administrador?`)) {
      const novosMembros = membros.map(m => 
        m.id === membroId ? { ...m, cargo: "Administrador" } : m
      );
      setMembros(novosMembros);
      localStorage.setItem(`clube_membros_${clubeId}`, JSON.stringify(novosMembros));
      addNotification('Admin promovido', `${membroNome} agora é administrador do clube.`, 'success', 'fa-crown');
    }
  };

  const handleAprovarSolicitacao = (solicitacao) => {
    const novoMembro = {
      id: solicitacao.userId,
      nome: solicitacao.userName,
      avatar: solicitacao.userAvatar || "/img/usuarios/default.jpg",
      cargo: "Membro",
      atividades: 0,
      dataEntrada: new Date().toISOString(),
      banido: false
    };
    
    const novosMembros = [...membros, novoMembro];
    setMembros(novosMembros);
    localStorage.setItem(`clube_membros_${clubeId}`, JSON.stringify(novosMembros));
    
    const novasSolicitacoes = solicitacoesPendentes.filter(s => s.userId !== solicitacao.userId);
    setSolicitacoesPendentes(novasSolicitacoes);
    localStorage.setItem(`clube_solicitacoes_${clubeId}`, JSON.stringify(novasSolicitacoes));
    
    const globalMembros = JSON.parse(localStorage.getItem('forza_clubes_membros') || '[]');
    if (!globalMembros.includes(parseInt(clubeId))) {
      globalMembros.push(parseInt(clubeId));
      localStorage.setItem('forza_clubes_membros', JSON.stringify(globalMembros));
    }
    
    addNotification('Solicitação aprovada', `${solicitacao.userName} agora é membro do clube!`, 'success', 'fa-user-check');
  };

  const handleRecusarSolicitacao = (solicitacao) => {
    const novasSolicitacoes = solicitacoesPendentes.filter(s => s.userId !== solicitacao.userId);
    setSolicitacoesPendentes(novasSolicitacoes);
    localStorage.setItem(`clube_solicitacoes_${clubeId}`, JSON.stringify(novasSolicitacoes));
    addNotification('Solicitação recusada', `A solicitação de ${solicitacao.userName} foi recusada.`, 'info', 'fa-user-times');
  };

  const inscreverEvento = (evento) => {
    if (!isMembro) {
      addNotification('Evento', 'Você precisa ser membro do clube para se inscrever nos eventos!', 'warning', 'fa-exclamation-circle');
      return;
    }
    addNotification('Evento', `Inscrito no evento "${evento.titulo}"!`, 'success', 'fa-calendar-check');
  };

  const irParaMembros = () => {
    navigate(`/clube/${clubeId}/membros`);
  };

  // Função para excluir o clube
  const excluirClube = async () => {
    const confirmed = await window.confirm(
      `⚠️ ATENÇÃO! ⚠️\n\n` +
      `Você está prestes a EXCLUIR PERMANENTEMENTE o clube "${clube.nome}".\n\n` +
      `Esta ação irá remover:\n` +
      `• Todos os ${membros.length} membros\n` +
      `• Todas as ${posts.length} postagens\n` +
      `• Todos os ${eventos.length} eventos\n` +
      `• Todos os ${treinos.length} treinos\n` +
      `• Todos os ${desafios.length} desafios\n` +
      `• Todas as mensagens do chat\n\n` +
      `Esta ação NÃO pode ser desfeita!\n\n` +
      `Digite o nome do clube para confirmar a exclusão:`
    );
    
    if (confirmed) {
      const nomeDigitado = prompt(`Digite o nome do clube para confirmar: "${clube.nome}"`);
      
      if (nomeDigitado === clube.nome) {
        // Remover dos clubes personalizados
        const savedPersonalizados = localStorage.getItem('forza_clubes_personalizados');
        if (savedPersonalizados) {
          const personalizados = JSON.parse(savedPersonalizados);
          const novosPersonalizados = personalizados.filter(c => c.id !== parseInt(clubeId));
          localStorage.setItem('forza_clubes_personalizados', JSON.stringify(novosPersonalizados));
        }
        
        // Remover dos membros globais
        const savedMembros = localStorage.getItem('forza_clubes_membros');
        if (savedMembros) {
          const membrosGlobal = JSON.parse(savedMembros);
          const novosMembrosGlobal = membrosGlobal.filter(id => id !== parseInt(clubeId));
          localStorage.setItem('forza_clubes_membros', JSON.stringify(novosMembrosGlobal));
        }
        
        // Remover dados específicos do clube
        localStorage.removeItem(`clube_membros_${clubeId}`);
        localStorage.removeItem(`clube_posts_${clubeId}`);
        localStorage.removeItem(`clube_eventos_${clubeId}`);
        localStorage.removeItem(`clube_treinos_${clubeId}`);
        localStorage.removeItem(`clube_desafios_${clubeId}`);
        localStorage.removeItem(`clube_solicitacoes_${clubeId}`);
        
        addNotification('Clube excluído', `O clube "${clube.nome}" foi excluído permanentemente.`, 'success', 'fa-trash-alt');
        navigate('/clubes');
      } else {
        addNotification('Exclusão cancelada', 'O nome do clube não confere. A exclusão foi cancelada.', 'warning', 'fa-exclamation-circle');
      }
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="clube-detalhes-container">
          <div className="clube-loading">
            <div className="clube-loading-spinner"></div>
            <p>Carregando clube...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!clube) return null;

  const membrosAtivos = membros.filter(m => !m.banido);
  const membrosBanidos = membros.filter(m => m.banido);

  return (
    <>
      <Header />
      
      <div className="clube-detalhes-container">
        <div className="detalhes-capa">
          <img src={clube.capa} alt={clube.nome} />
          <button className="detalhes-voltar" onClick={() => navigate('/clubes')}>
            <i className="fas fa-arrow-left"></i> Voltar
          </button>
          {isAdmin && (
            <>
              <button className="detalhes-editar-capa" onClick={handleEditImagens}>
                <i className="fas fa-image"></i> Editar Imagens
              </button>
              <button className="detalhes-editar-info" onClick={handleEditClube}>
                <i className="fas fa-pen"></i> Editar
              </button>
            </>
          )}
        </div>

        <div className="detalhes-info-header">
          <div className="detalhes-avatar-grande">
            <img src={clube.avatar} alt={clube.nome} />
          </div>
          <div className="detalhes-info-texto">
            <div className="detalhes-nome-verificado">
              <h1>{clube.nome}</h1>
              {clube.verificado && <i className="fas fa-check-circle verified"></i>}
              {isAdmin && <span className="admin-badge"> Administrador</span>}
            </div>
            <p className="detalhes-descricao">{clube.descricao}</p>
            <div className="detalhes-stats">
              <span className="detalhes-stats-clickable" onClick={irParaMembros}>
                <i className="fas fa-users"></i> {membrosAtivos.length} membros
              </span>
              <span><i className="fas fa-calendar-alt"></i> {eventos.length} eventos</span>
              <span><i className="fas fa-map-marker-alt"></i> {clube.localizacao || "Não informado"}</span>
            </div>
          </div>
          <div className="detalhes-acoes">
            {isAdmin ? (
              <>
                {solicitacoesPendentes.length > 0 && (
                  <button className="detalhes-btn-solicitacoes" onClick={() => setShowSolicitacoesModal(true)}>
                    <i className="fas fa-user-plus"></i> {solicitacoesPendentes.length}
                  </button>
                )}
              </>
            ) : isMembro ? (
              <>
                <button className="detalhes-btn-membro" disabled>
                  <i className="fas fa-check-circle"></i> Membro
                </button>
                <button className="detalhes-btn-sair" onClick={sairDoClube}>
                  <i className="fas fa-sign-out-alt"></i> Sair
                </button>
              </>
            ) : (
              <button className="detalhes-btn-entrar" onClick={entrarNoClube}>
                <i className="fas fa-plus-circle"></i> Entrar no Clube
              </button>
            )}
          </div>
        </div>

        <div className="detalhes-tabs">
          <button className={`detalhes-tab ${activeTab === 'sobre' ? 'active' : ''}`} onClick={() => setActiveTab('sobre')}>
            Sobre
          </button>
          <button className={`detalhes-tab ${activeTab === 'eventos' ? 'active' : ''}`} onClick={() => setActiveTab('eventos')}>
            Eventos
          </button>
          <button className={`detalhes-tab ${activeTab === 'treinos' ? 'active' : ''}`} onClick={() => setActiveTab('treinos')}>
            Treinos
          </button>
          <button className={`detalhes-tab ${activeTab === 'postagens' ? 'active' : ''}`} onClick={() => setActiveTab('postagens')}>
            Postagens
          </button>
          <button className={`detalhes-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
            Chat
          </button>
          <button className={`detalhes-tab ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>
            Ranking
          </button>
          {isAdmin && (
            <button className={`detalhes-tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
              <i className="fas fa-shield-alt"></i> Admin
            </button>
          )}
        </div>

        {/* Aba Sobre */}
        {activeTab === 'sobre' && (
          <div className="detalhes-sobre">
            <div className="detalhes-card">
              <h3><i className="fas fa-history"></i> Sobre o Clube</h3>
              <p>{clube.sobre || clube.descricao}</p>
            </div>

            <div className="detalhes-info-grid">
              <div className="detalhes-info-item">
                <i className="fas fa-calendar-alt"></i>
                <div><h4>Fundação</h4><p>{clube.fundacao || "2024"}</p></div>
              </div>
              <div className="detalhes-info-item">
                <i className="fas fa-tag"></i>
                <div><h4>Categoria</h4><p>{clube.categoria}</p></div>
              </div>
              <div className="detalhes-info-item">
                <i className="fas fa-lock"></i>
                <div><h4>Tipo</h4><p>{clube.tipo}</p></div>
              </div>
              <div className="detalhes-info-item">
                <i className="fas fa-globe"></i>
                <div><h4>Região</h4><p>{clube.regiao || "Não informado"}</p></div>
              </div>
            </div>

            {treinos.length > 0 && (
              <div className="detalhes-card">
                <h3><i className="fas fa-clock"></i> Horários de Treino</h3>
                <div className="detalhes-horarios">
                  {treinos.map(treino => (
                    <div key={treino.id} className="detalhes-horario-item">
                      <span className="detalhes-dia">{treino.dia}</span>
                      <span className="detalhes-horario">{treino.horario} - {treino.local}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(clube.redes?.instagram || clube.redes?.twitter || clube.redes?.whatsapp) && (
              <div className="detalhes-card">
                <h3><i className="fas fa-share-alt"></i> Redes Sociais</h3>
                <div className="detalhes-redes">
                  {clube.redes?.instagram && <div className="detalhes-rede-item"><i className="fab fa-instagram"></i><span>{clube.redes.instagram}</span></div>}
                  {clube.redes?.twitter && <div className="detalhes-rede-item"><i className="fab fa-twitter"></i><span>{clube.redes.twitter}</span></div>}
                  {clube.redes?.whatsapp && <div className="detalhes-rede-item"><i className="fab fa-whatsapp"></i><span>{clube.redes.whatsapp}</span></div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aba Eventos - COM DESAFIOS */}
        {activeTab === 'eventos' && (
          <div className="detalhes-eventos">
            <div className="detalhes-card">
              <div className="detalhes-postagens-header">
                <h3><i className="fas fa-calendar-alt"></i> Eventos e Desafios</h3>
                <div className="header-buttons">
                  {isAdmin && (
                    <>
                      <button className="detalhes-btn-desafio" onClick={() => setShowDesafioModal(true)}>
                        <i className="fas fa-trophy"></i> Promover Desafio
                      </button>
                      <button className="detalhes-btn-nova-postagem" onClick={() => setShowEventoModal(true)}>
                        <i className="fas fa-plus"></i> Adicionar Evento
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Desafios */}
              {desafios.length > 0 && (
                <div className="desafios-section">
                  <h4 className="section-subtitle"><i className="fas fa-trophy"></i> Desafios Ativos</h4>
                  <div className="desafios-lista">
                    {desafios.map(desafio => (
                      <div key={desafio.id} className="desafio-card">
                        {desafio.bannerImagem && (
                          <div className="desafio-banner">
                            <img src={desafio.bannerImagem} alt={desafio.titulo} />
                          </div>
                        )}
                        <div className="desafio-content">
                          <div className="desafio-header">
                            <div className="desafio-titulo-area">
                              <h4>{desafio.titulo}</h4>
                              {desafio.medalhaImagem && (
                                <div className="desafio-medalha">
                                  <img src={desafio.medalhaImagem} alt="Medalha" />
                                </div>
                              )}
                            </div>
                            <div className="desafio-periodo">
                              <span><i className="fas fa-calendar"></i> {desafio.dataInicio} a {desafio.dataFim}</span>
                            </div>
                          </div>
                          <p className="desafio-descricao">{desafio.descricao}</p>
                          
                          {desafio.descricaoLonga && (
                            <div className="desafio-detalhes">
                              <details>
                                <summary><i className="fas fa-info-circle"></i> Ver detalhes</summary>
                                <div className="desafio-detalhes-content">
                                  <p>{desafio.descricaoLonga}</p>
                                  {desafio.atividade && <p><strong>Atividades:</strong> {desafio.atividade}</p>}
                                  {desafio.premiacao && <p><strong>Recompensa:</strong> {desafio.premiacao}</p>}
                                  {desafio.regras && <p><strong>Regras:</strong> {desafio.regras}</p>}
                                </div>
                              </details>
                            </div>
                          )}
                          
                          <div className="desafio-stats">
                            <span><i className="fas fa-users"></i> {desafio.participantes} participantes</span>
                            <span><i className="fas fa-check-circle"></i> {desafio.completaram} completaram</span>
                          </div>
                          
                          <div className="desafio-actions">
                            <button className="desafio-btn-participar" onClick={() => inscreverEvento(desafio)}>
                              <i className="fas fa-flag-checkered"></i> Participar do Desafio
                            </button>
                            {isAdmin && (
                              <button className="btn-delete-desafio" onClick={() => handleDeleteDesafio(desafio.id)}>
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Eventos normais */}
              {eventos.length === 0 && desafios.length === 0 ? (
                <div className="detalhes-sem-postagens">
                  <i className="fas fa-calendar"></i>
                  <p>Nenhum evento ou desafio programado ainda.</p>
                  {isAdmin && <button className="detalhes-btn-entrar" onClick={() => setShowEventoModal(true)}>Adicionar Evento</button>}
                </div>
              ) : (
                eventos.length > 0 && (
                  <>
                    <h4 className="section-subtitle"> Eventos</h4>
                    <div className="detalhes-eventos-lista">
                      {eventos.map(evento => (
                        <div key={evento.id} className="detalhes-evento-card">
                          <div className="detalhes-evento-data">
                            <span className="detalhes-evento-dia">{evento.data.split('-')[2]}</span>
                            <span className="detalhes-evento-mes">{evento.data.split('-')[1]}</span>
                          </div>
                          <div className="detalhes-evento-info">
                            <h4>{evento.titulo}</h4>
                            {evento.descricao && <p className="evento-descricao">{evento.descricao}</p>}
                            <div className="detalhes-evento-detalhes">
                              <span><i className="fas fa-clock"></i> {evento.hora}</span>
                              <span><i className="fas fa-map-marker-alt"></i> {evento.local}</span>
                              {evento.km > 0 && <span><i className="fas fa-route"></i> {evento.km} km</span>}
                            </div>
                          </div>
                          <div className="detalhes-evento-actions">
                            <button className="detalhes-evento-btn" onClick={() => inscreverEvento(evento)}>
                              Inscrever-se
                            </button>
                            {isAdmin && (
                              <button className="btn-delete-evento" onClick={() => handleDeleteEvento(evento.id)}>
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        )}

        {/* Aba Treinos */}
        {activeTab === 'treinos' && (
          <div className="detalhes-treinos">
            <div className="detalhes-card">
              <div className="detalhes-postagens-header">
                <h3><i className="fas fa-dumbbell"></i> Treinos da Semana</h3>
                {isAdmin && (
                  <button className="detalhes-btn-nova-postagem" onClick={() => setShowTreinoModal(true)}>
                    <i className="fas fa-plus"></i> Adicionar Treino
                  </button>
                )}
              </div>
              {treinos.length === 0 ? (
                <div className="detalhes-sem-postagens">
                  <i className="fas fa-dumbbell"></i>
                  <p>Nenhum treino agendado ainda.</p>
                  {isAdmin && <button className="detalhes-btn-entrar" onClick={() => setShowTreinoModal(true)}>Adicionar Treino</button>}
                </div>
              ) : (
                <div className="detalhes-treinos-semana">
                  {treinos.map(treino => (
                    <div key={treino.id} className="detalhes-treino-dia-card">
                      <div className="detalhes-treino-dia-nome">{treino.dia}</div>
                      <div className="detalhes-treino-dia-info">
                        <i className="fas fa-clock"></i> {treino.horario}
                      </div>
                      <div className="detalhes-treino-dia-local">
                        <i className="fas fa-map-marker-alt"></i> {treino.local}
                      </div>
                      <div className="treino-actions">
                        <button className="detalhes-treino-btn" disabled={!isMembro}>
                          <i className="fas fa-check"></i> {isMembro ? 'Confirmar Presença' : 'Entre no clube'}
                        </button>
                        {isAdmin && (
                          <button className="btn-delete-treino" onClick={() => handleDeleteTreino(treino.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aba Postagens */}
        {activeTab === 'postagens' && (
          <div className="detalhes-postagens">
            <div className="detalhes-card">
              <div className="detalhes-postagens-header">
                <h3><i className="fas fa-newspaper"></i> Postagens do Clube</h3>
                {isMembro && (
                  <button className="detalhes-btn-nova-postagem" onClick={() => setShowNewPostModal(true)}>
                    <i className="fas fa-plus"></i> Nova Postagem
                  </button>
                )}
              </div>
              
              {!isMembro && (
                <div className="detalhes-postagens-bloqueado">
                  <i className="fas fa-lock"></i>
                  <p>Postagens disponíveis apenas para membros</p>
                  <button className="detalhes-btn-entrar" onClick={entrarNoClube}>Entrar no Clube</button>
                </div>
              )}
              
              {isMembro && posts.length === 0 && (
                <div className="detalhes-sem-postagens">
                  <i className="fas fa-newspaper"></i>
                  <p>Nenhuma postagem ainda. Seja o primeiro a postar!</p>
                </div>
              )}
              
              {isMembro && posts.map(post => (
                <div key={post.id} className="detalhes-postagem-card">
                  <div className="detalhes-postagem-header">
                    <img src={post.avatar} alt={post.usuario} className="detalhes-postagem-avatar" />
                    <div className="detalhes-postagem-info">
                      <strong>{post.usuario}</strong>
                      <span>{new Date(post.data).toLocaleDateString()}</span>
                    </div>
                    {isAdmin && (
                      <button className="btn-delete-post" onClick={() => handleDeletePost(post.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                  <p className="detalhes-postagem-mensagem">{post.mensagem}</p>
                  
                  {(post.imagem1 || post.imagem2) && (
                    <div className="detalhes-postagem-imagens">
                      {post.imagem1 && <img src={post.imagem1} alt="Imagem do post" className="detalhes-postagem-imagem" onClick={() => window.open(post.imagem1, '_blank')} />}
                      {post.imagem2 && <img src={post.imagem2} alt="Imagem do post" className="detalhes-postagem-imagem" onClick={() => window.open(post.imagem2, '_blank')} />}
                    </div>
                  )}
                  
                  <div className="detalhes-postagem-acoes">
                    <button className={`detalhes-postagem-curtir ${post.curtido ? 'curtido' : ''}`} onClick={() => handleCurtir(post.id)}>
                      <i className="fas fa-heart"></i> <span>{post.curtidas}</span>
                    </button>
                    <button className="detalhes-postagem-comentar" onClick={() => toggleComentarios(post.id)}>
                      <i className="fas fa-comment"></i> <span>{post.comentarios.length}</span>
                    </button>
                  </div>
                  
                  {showComentarios[post.id] && (
                    <div className="detalhes-postagem-comentarios">
                      <div className="detalhes-comentarios-lista">
                        {post.comentarios.map(com => (
                          <div key={com.id} className="detalhes-comentario-item">
                            <strong>{com.usuario}</strong>
                            <p>{com.mensagem}</p>
                            <small>{com.tempo}</small>
                          </div>
                        ))}
                      </div>
                      <div className="detalhes-comentario-input">
                        <input
                          type="text"
                          placeholder="Escreva um comentário..."
                          value={comentarioTexto[post.id] || ''}
                          onChange={(e) => setComentarioTexto({ ...comentarioTexto, [post.id]: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && handleComentar(post.id)}
                        />
                        <button onClick={() => handleComentar(post.id)}>
                          <i className="fas fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aba Chat */}
        {activeTab === 'chat' && (
          <div className="detalhes-chat">
            {isMembro ? (
              <ClubeChat 
                clubeId={parseInt(clubeId)} 
                clubeNome={clube.nome} 
                onClose={() => {}}
                embedded={true}
                isAdmin={isAdmin}
              />
            ) : (
              <div className="detalhes-chat-bloqueado">
                <i className="fas fa-lock"></i>
                <h3>Chat disponível apenas para membros</h3>
                <p>Entre no clube para participar das conversas!</p>
                <button className="detalhes-btn-entrar" onClick={entrarNoClube}>
                  <i className="fas fa-plus-circle"></i> Entrar no Clube
                </button>
              </div>
            )}
          </div>
        )}

        {/* Aba Ranking */}
        {activeTab === 'ranking' && (
          <div className="detalhes-ranking">
            <div className="detalhes-card">
              <div className="detalhes-ranking-header">
                <h3><i className="fas fa-trophy"></i> Ranking do Clube</h3>
                <div className="detalhes-ranking-info">
                  <span>Atualizado em: {lastUpdate || 'Carregando...'}</span>
                  {isAdmin && (
                    <button className="detalhes-btn-atualizar" onClick={atualizarRanking}>
                      <i className="fas fa-sync-alt"></i> Atualizar
                    </button>
                  )}
                </div>
              </div>
              
              <div className="detalhes-ranking-tabela">
                <div className="detalhes-ranking-cabecalho">
                  <span>#</span>
                  <span>Atleta</span>
                  <span>Km</span>
                  <span>Eventos</span>
                </div>
                {rankingData.map((item, index) => (
                  <div key={item.id} className={`detalhes-ranking-item ${index < 3 ? 'top' : ''}`}>
                    <span className="detalhes-ranking-posicao">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `${index + 1}º`}
                    </span>
                    <div className="detalhes-ranking-usuario">
                      <img src={item.avatar} alt={item.usuario} />
                      <span>{item.usuario}</span>
                    </div>
                    <span className="detalhes-ranking-km">{item.quilometragem} km</span>
                    <span className="detalhes-ranking-eventos">{item.eventos} eventos</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Aba Admin */}
        {activeTab === 'admin' && isAdmin && (
          <div className="detalhes-admin">
            <div className="detalhes-card">
              <h3><i className="fas fa-chart-line"></i> Estatísticas do Clube</h3>
              <div className="admin-stats-grid">
                <div className="admin-stat">
                  <i className="fas fa-users"></i>
                  <div>
                    <strong>{membrosAtivos.length}</strong>
                    <span>Membros ativos</span>
                  </div>
                </div>
                <div className="admin-stat">
                  <i className="fas fa-user-slash"></i>
                  <div>
                    <strong>{membrosBanidos.length}</strong>
                    <span>Membros banidos</span>
                  </div>
                </div>
                <div className="admin-stat">
                  <i className="fas fa-newspaper"></i>
                  <div>
                    <strong>{posts.length}</strong>
                    <span>Postagens</span>
                  </div>
                </div>
                <div className="admin-stat">
                  <i className="fas fa-calendar"></i>
                  <div>
                    <strong>{eventos.length}</strong>
                    <span>Eventos</span>
                  </div>
                </div>
                <div className="admin-stat">
                  <i className="fas fa-trophy"></i>
                  <div>
                    <strong>{desafios.length}</strong>
                    <span>Desafios</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detalhes-card">
              <h3><i className="fas fa-cog"></i> Configurações do Clube</h3>
              <div className="admin-settings">
                <button className="admin-setting-btn" onClick={handleEditImagens}>
                  <i className="fas fa-image"></i> Editar Imagens (Capa/Avatar)
                </button>
                <button className="admin-setting-btn" onClick={handleEditClube}>
                  <i className="fas fa-edit"></i> Editar Informações
                </button>
                <button className="admin-setting-btn" onClick={() => setShowMembrosModal(true)}>
                  <i className="fas fa-users-cog"></i> Gerenciar Membros
                </button>
                <button className="admin-setting-btn" onClick={() => setShowEventoModal(true)}>
                  <i className="fas fa-calendar-plus"></i> Adicionar Evento
                </button>
                <button className="admin-setting-btn" onClick={() => setShowTreinoModal(true)}>
                  <i className="fas fa-dumbbell"></i> Adicionar Treino
                </button>
                <button className="admin-setting-btn" onClick={() => setShowDesafioModal(true)}>
                  <i className="fas fa-trophy"></i> Promover Desafio
                </button>
                <button className="admin-setting-btn" onClick={atualizarRanking}>
                  <i className="fas fa-sync-alt"></i> Atualizar Ranking
                </button>
              </div>
            </div>

            <div className="detalhes-card">
              <h3><i className="fas fa-code"></i> Informações do Clube</h3>
              <div className="admin-dev-info">
                <p><strong>ID do Clube:</strong> {clube.id}</p>
                <p><strong>Tipo:</strong> {clube.tipo}</p>
                <p><strong>Criado em:</strong> {new Date(clube.id).toLocaleDateString()}</p>
                <button 
                  className="admin-dev-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(clube, null, 2));
                    addNotification('Copiado!', 'Dados do clube copiados para área de transferência.', 'success', 'fa-copy');
                  }}
                >
                  <i className="fas fa-copy"></i> Copiar Dados do Clube
                </button>
              </div>
            </div>

            {/* Botão de Excluir Clube */}
            <div className="detalhes-card excluir-clube-card">
              <h3><i className="fas fa-exclamation-triangle"></i> Zona de Perigo</h3>
              <div className="excluir-clube-area">
                <p><strong>Atenção!</strong> Esta ação é irreversível. Ao excluir o clube, todos os dados serão permanentemente removidos:</p>
                <ul>
                  <li><i className="fas fa-users"></i> Todos os membros serão removidos</li>
                  <li><i className="fas fa-newspaper"></i> Todas as postagens e comentários</li>
                  <li><i className="fas fa-calendar"></i> Todos os eventos e desafios</li>
                  <li><i className="fas fa-dumbbell"></i> Todos os treinos agendados</li>
                  <li><i className="fas fa-comments"></i> Todas as mensagens do chat</li>
                </ul>
                <button className="btn-excluir-clube" onClick={excluirClube}>
                  <i className="fas fa-trash-alt"></i> Excluir Clube Permanentemente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modais existentes (mantidos do código anterior) */}
      {showNewPostModal && (
        <div className="detalhes-modal-overlay" onClick={() => setShowNewPostModal(false)}>
          <div className="detalhes-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detalhes-modal-header">
              <h3>Nova postagem</h3>
              <button className="detalhes-modal-close" onClick={() => setShowNewPostModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="detalhes-modal-body">
              <textarea
                className="detalhes-post-textarea"
                placeholder="O que você está pensando?"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                rows="3"
              />
              
              <div className="detalhes-fotos-section">
                <div className="detalhes-fotos-title">
                  <i className="fas fa-image"></i> Fotos (máximo 2)
                </div>
                
                <div className="detalhes-fotos-grid">
                  {!newPostImagePreview1 ? (
                    <label className="detalhes-foto-upload empty">
                      <i className="fas fa-plus"></i>
                      <span>Adicionar foto</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setNewPostImage1, setNewPostImagePreview1)} style={{ display: 'none' }} />
                    </label>
                  ) : (
                    <div className="detalhes-foto-upload">
                      <div className="detalhes-foto-preview">
                        <img src={newPostImagePreview1} alt="Preview 1" />
                        <button className="detalhes-foto-remove" onClick={() => removeImage(setNewPostImage1, setNewPostImagePreview1)}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {!newPostImagePreview2 ? (
                    <label className="detalhes-foto-upload empty">
                      <i className="fas fa-plus"></i>
                      <span>Adicionar foto</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setNewPostImage2, setNewPostImagePreview2)} style={{ display: 'none' }} />
                    </label>
                  ) : (
                    <div className="detalhes-foto-upload">
                      <div className="detalhes-foto-preview">
                        <img src={newPostImagePreview2} alt="Preview 2" />
                        <button className="detalhes-foto-remove" onClick={() => removeImage(setNewPostImage2, setNewPostImagePreview2)}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="detalhes-modal-footer">
              <button className="detalhes-btn-cancelar" onClick={() => setShowNewPostModal(false)}>Cancelar</button>
              <button className="detalhes-btn-publicar" onClick={handleNovaPostagem}>Publicar</button>
            </div>
          </div>
        </div>
      )}

      {showEditImagensModal && (
        <div className="detalhes-modal-overlay" onClick={() => setShowEditImagensModal(false)}>
          <div className="detalhes-modal edit-imagens-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detalhes-modal-header">
              <h3><i className="fas fa-image"></i> Editar Imagens do Clube</h3>
              <button className="detalhes-modal-close" onClick={() => setShowEditImagensModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="detalhes-modal-body">
              <div className="form-group">
                <label>Foto de Capa (Banner)</label>
                <div className="image-preview-container">
                  <img src={capaPreview || clube.capa} alt="Capa" className="capa-preview-img" />
                  <button className="upload-image-btn" onClick={() => capaInputRef.current?.click()}>
                    <i className="fas fa-upload"></i> Alterar Capa
                  </button>
                  <input type="file" ref={capaInputRef} accept="image/*" onChange={handleCapaUpload} style={{ display: 'none' }} />
                </div>
              </div>
              <div className="form-group">
                <label>Foto de Perfil (Avatar)</label>
                <div className="image-preview-container avatar-container">
                  <img src={avatarPreview || clube.avatar} alt="Avatar" className="avatar-preview-img" />
                  <button className="upload-image-btn" onClick={() => avatarInputRef.current?.click()}>
                    <i className="fas fa-upload"></i> Alterar Avatar
                  </button>
                  <input type="file" ref={avatarInputRef} accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                </div>
              </div>
            </div>
            <div className="detalhes-modal-footer">
              <button className="detalhes-btn-cancelar" onClick={() => setShowEditImagensModal(false)}>Cancelar</button>
              <button className="detalhes-btn-publicar" onClick={saveImagensEdits}>Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="detalhes-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="detalhes-modal edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detalhes-modal-header">
              <h3><i className="fas fa-edit"></i> Editar Informações do Clube</h3>
              <button className="detalhes-modal-close" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="detalhes-modal-body edit-modal-body">
              <div className="form-group">
                <label>Nome do Clube</label>
                <input type="text" value={editFormData.nome} onChange={(e) => setEditFormData({...editFormData, nome: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Descrição Curta</label>
                <textarea rows="3" value={editFormData.descricao} onChange={(e) => setEditFormData({...editFormData, descricao: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Sobre (Descrição Detalhada)</label>
                <textarea rows="5" value={editFormData.sobre} onChange={(e) => setEditFormData({...editFormData, sobre: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Categoria</label>
                  <select value={editFormData.categoria} onChange={(e) => setEditFormData({...editFormData, categoria: e.target.value})}>
                    <option value="Corrida">Corrida</option>
                    <option value="Ciclismo">Ciclismo</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Natação">Natação</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <select value={editFormData.tipo} onChange={(e) => setEditFormData({...editFormData, tipo: e.target.value})}>
                    <option value="Público">Público</option>
                    <option value="Privado">Privado</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Localização</label>
                <input type="text" value={editFormData.localizacao} onChange={(e) => setEditFormData({...editFormData, localizacao: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Região</label>
                <input type="text" value={editFormData.regiao} onChange={(e) => setEditFormData({...editFormData, regiao: e.target.value})} />
              </div>
              <div className="form-group">
                <label><i className="fab fa-instagram"></i> Instagram</label>
                <input type="text" value={editFormData.instagram} onChange={(e) => setEditFormData({...editFormData, instagram: e.target.value})} />
              </div>
              <div className="form-group">
                <label><i className="fab fa-twitter"></i> Twitter</label>
                <input type="text" value={editFormData.twitter} onChange={(e) => setEditFormData({...editFormData, twitter: e.target.value})} />
              </div>
              <div className="form-group">
                <label><i className="fab fa-whatsapp"></i> WhatsApp</label>
                <input type="text" value={editFormData.whatsapp} onChange={(e) => setEditFormData({...editFormData, whatsapp: e.target.value})} />
              </div>
            </div>
            <div className="detalhes-modal-footer">
              <button className="detalhes-btn-cancelar" onClick={() => setShowEditModal(false)}>Cancelar</button>
              <button className="detalhes-btn-publicar" onClick={saveClubeEdits}>Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}

      {showEventoModal && (
        <div className="detalhes-modal-overlay" onClick={() => setShowEventoModal(false)}>
          <div className="detalhes-modal evento-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detalhes-modal-header">
              <h3><i className="fas fa-calendar-plus"></i> Adicionar Evento</h3>
              <button className="detalhes-modal-close" onClick={() => setShowEventoModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="detalhes-modal-body">
              <div className="form-group">
                <label>Título do Evento *</label>
                <input type="text" placeholder="Ex: Corrida Noturna" value={novoEvento.titulo} onChange={(e) => setNovoEvento({...novoEvento, titulo: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea rows="2" placeholder="Descrição do evento..." value={novoEvento.descricao} onChange={(e) => setNovoEvento({...novoEvento, descricao: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Data *</label>
                  <input type="date" value={novoEvento.data} onChange={(e) => setNovoEvento({...novoEvento, data: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Horário *</label>
                  <input type="time" value={novoEvento.hora} onChange={(e) => setNovoEvento({...novoEvento, hora: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Local</label>
                <input type="text" placeholder="Local do evento" value={novoEvento.local} onChange={(e) => setNovoEvento({...novoEvento, local: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Vagas</label>
                  <input type="number" value={novoEvento.vagas} onChange={(e) => setNovoEvento({...novoEvento, vagas: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Distância (km)</label>
                  <input type="number" placeholder="0" value={novoEvento.km} onChange={(e) => setNovoEvento({...novoEvento, km: parseInt(e.target.value)})} />
                </div>
              </div>
            </div>
            <div className="detalhes-modal-footer">
              <button className="detalhes-btn-cancelar" onClick={() => setShowEventoModal(false)}>Cancelar</button>
              <button className="detalhes-btn-publicar" onClick={handleAddEvento}>Adicionar Evento</button>
            </div>
          </div>
        </div>
      )}

      {showTreinoModal && (
        <div className="detalhes-modal-overlay" onClick={() => setShowTreinoModal(false)}>
          <div className="detalhes-modal treino-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detalhes-modal-header">
              <h3><i className="fas fa-dumbbell"></i> Adicionar Treino</h3>
              <button className="detalhes-modal-close" onClick={() => setShowTreinoModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="detalhes-modal-body">
              <div className="form-group">
                <label>Dia da Semana *</label>
                <select value={novoTreino.dia} onChange={(e) => setNovoTreino({...novoTreino, dia: e.target.value})}>
                  <option value="">Selecione</option>
                  <option value="Segunda">Segunda-feira</option>
                  <option value="Terça">Terça-feira</option>
                  <option value="Quarta">Quarta-feira</option>
                  <option value="Quinta">Quinta-feira</option>
                  <option value="Sexta">Sexta-feira</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Domingo">Domingo</option>
                </select>
              </div>
              <div className="form-group">
                <label>Horário *</label>
                <input type="time" value={novoTreino.horario} onChange={(e) => setNovoTreino({...novoTreino, horario: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Local</label>
                <input type="text" placeholder="Local do treino" value={novoTreino.local} onChange={(e) => setNovoTreino({...novoTreino, local: e.target.value})} />
              </div>
            </div>
            <div className="detalhes-modal-footer">
              <button className="detalhes-btn-cancelar" onClick={() => setShowTreinoModal(false)}>Cancelar</button>
              <button className="detalhes-btn-publicar" onClick={handleAddTreino}>Adicionar Treino</button>
            </div>
          </div>
        </div>
      )}

      {showDesafioModal && (
        <div className="detalhes-modal-overlay" onClick={() => setShowDesafioModal(false)}>
          <div className="detalhes-modal desafio-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detalhes-modal-header">
              <h3><i className="fas fa-trophy"></i> Promover Novo Desafio</h3>
              <button className="detalhes-modal-close" onClick={() => setShowDesafioModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="detalhes-modal-body desafio-modal-body">
              <div className="form-section">
                <label>Imagens do Desafio</label>
                <div className="desafio-imagens-grid">
                  <div className="upload-item">
                    <label>Medalha (ícone)</label>
                    <div className="medalha-preview" onClick={() => medalhaInputRef.current?.click()}>
                      {medalhaPreview ? (
                        <img src={medalhaPreview} alt="Medalha" />
                      ) : (
                        <div className="upload-placeholder-small">
                          <i className="fas fa-medal"></i>
                          <span>Clique para adicionar medalha</span>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={medalhaInputRef} accept="image/*" onChange={handleMedalhaUpload} style={{ display: 'none' }} />
                  </div>
                  
                  <div className="upload-item">
                    <label>Banner do Desafio</label>
                    <div className="banner-preview" onClick={() => bannerDesafioInputRef.current?.click()}>
                      {bannerDesafioPreview ? (
                        <img src={bannerDesafioPreview} alt="Banner" />
                      ) : (
                        <div className="upload-placeholder-small">
                          <i className="fas fa-image"></i>
                          <span>Clique para adicionar banner</span>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={bannerDesafioInputRef} accept="image/*" onChange={handleBannerDesafioUpload} style={{ display: 'none' }} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Título do Desafio *</label>
                <input type="text" placeholder="Ex: Desafio de Março: 10 minutos por 10 dias" 
                  value={novoDesafio.titulo} onChange={(e) => setNovoDesafio({...novoDesafio, titulo: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Descrição Curta *</label>
                <textarea rows="3" placeholder="Breve descrição do desafio..." 
                  value={novoDesafio.descricao} onChange={(e) => setNovoDesafio({...novoDesafio, descricao: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Descrição Detalhada</label>
                <textarea rows="5" placeholder="Descrição completa do desafio..." 
                  value={novoDesafio.descricaoLonga} onChange={(e) => setNovoDesafio({...novoDesafio, descricaoLonga: e.target.value})} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data Início *</label>
                  <input type="date" value={novoDesafio.dataInicio} onChange={(e) => setNovoDesafio({...novoDesafio, dataInicio: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Data Fim *</label>
                  <input type="date" value={novoDesafio.dataFim} onChange={(e) => setNovoDesafio({...novoDesafio, dataFim: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Atividades Permitidas</label>
                <input type="text" placeholder="Ex: Corrida, Ciclismo, Natação" 
                  value={novoDesafio.atividade} onChange={(e) => setNovoDesafio({...novoDesafio, atividade: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Premiação / Recompensa</label>
                <textarea rows="2" placeholder="O que os participantes ganham ao completar o desafio?" 
                  value={novoDesafio.premiacao} onChange={(e) => setNovoDesafio({...novoDesafio, premiacao: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Regras do Desafio</label>
                <textarea rows="3" placeholder="Regras e condições do desafio..." 
                  value={novoDesafio.regras} onChange={(e) => setNovoDesafio({...novoDesafio, regras: e.target.value})} />
              </div>
            </div>
            <div className="detalhes-modal-footer">
              <button className="detalhes-btn-cancelar" onClick={() => setShowDesafioModal(false)}>Cancelar</button>
              <button className="detalhes-btn-publicar" onClick={handleAddDesafio}>Criar Desafio</button>
            </div>
          </div>
        </div>
      )}

      {showMembrosModal && (
        <div className="detalhes-modal-overlay" onClick={() => setShowMembrosModal(false)}>
          <div className="detalhes-modal membros-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detalhes-modal-header">
              <h3><i className="fas fa-users-cog"></i> Gerenciar Membros ({membrosAtivos.length} ativos, {membrosBanidos.length} banidos)</h3>
              <button className="detalhes-modal-close" onClick={() => setShowMembrosModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="detalhes-modal-body membros-modal-body">
              <div className="membros-section">
                <h4>Membros Ativos</h4>
                {membrosAtivos.map(membro => (
                  <div key={membro.id} className="membro-admin-item">
                    <img src={membro.avatar} alt={membro.nome} />
                    <div className="membro-admin-info">
                      <strong>{membro.nome}</strong>
                      <span className={`cargo-badge ${membro.cargo === 'Administrador' ? 'admin' : 'membro'}`}>
                        {membro.cargo}
                      </span>
                      <small>Entrou em {new Date(membro.dataEntrada).toLocaleDateString()}</small>
                    </div>
                    <div className="membro-admin-actions">
                      {membro.cargo !== 'Administrador' && membro.id !== user?.id && (
                        <button onClick={() => handlePromoverAdmin(membro.id, membro.nome)} title="Promover a Admin">
                          <i className="fas fa-crown"></i>
                        </button>
                      )}
                      {membro.id !== user?.id && (
                        <>
                          <button onClick={() => handleBanirMembro(membro.id, membro.nome)} title="Banir Membro">
                            <i className="fas fa-ban"></i>
                          </button>
                          <button onClick={() => handleRemoverMembro(membro.id, membro.nome)} title="Remover Membro">
                            <i className="fas fa-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {membrosBanidos.length > 0 && (
                <div className="membros-section banidos">
                  <h4>Membros Banidos</h4>
                  {membrosBanidos.map(membro => (
                    <div key={membro.id} className="membro-admin-item banido">
                      <img src={membro.avatar} alt={membro.nome} />
                      <div className="membro-admin-info">
                        <strong>{membro.nome}</strong>
                        <span className="cargo-badge banido">Banido</span>
                      </div>
                      <div className="membro-admin-actions">
                        <button onClick={() => handleDesbanirMembro(membro.id, membro.nome)} title="Desbanir Membro">
                          <i className="fas fa-user-check"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSolicitacoesModal && (
        <div className="detalhes-modal-overlay" onClick={() => setShowSolicitacoesModal(false)}>
          <div className="detalhes-modal solicitacoes-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detalhes-modal-header">
              <h3><i className="fas fa-user-plus"></i> Solicitações Pendentes ({solicitacoesPendentes.length})</h3>
              <button className="detalhes-modal-close" onClick={() => setShowSolicitacoesModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="detalhes-modal-body">
              {solicitacoesPendentes.length === 0 ? (
                <p className="sem-solicitacoes">Nenhuma solicitação pendente</p>
              ) : (
                solicitacoesPendentes.map(solicitacao => (
                  <div key={solicitacao.userId} className="solicitacao-item">
                    <img src={solicitacao.userAvatar || "/img/usuarios/default.jpg"} alt={solicitacao.userName} />
                    <div className="solicitacao-info">
                      <strong>{solicitacao.userName}</strong>
                      <small>Solicitou em {new Date(solicitacao.data).toLocaleDateString()}</small>
                    </div>
                    <div className="solicitacao-actions">
                      <button className="aprovar" onClick={() => handleAprovarSolicitacao(solicitacao)}>
                        <i className="fas fa-check"></i>
                      </button>
                      <button className="recusar" onClick={() => handleRecusarSolicitacao(solicitacao)}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default ClubeDetalhes;