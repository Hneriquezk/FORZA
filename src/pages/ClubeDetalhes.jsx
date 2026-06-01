// ClubeDetalhes.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ClubeChat from '../components/ClubeChat';
import './ClubeDetalhes.css';

function ClubeDetalhes() {
  const navigate = useNavigate();
  const { clubeId } = useParams();
  const { user } = useAuth();
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
  const [showDesafioModal, setShowDesafioModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nome: '',
    descricao: '',
    localizacao: '',
    categoria: '',
    instagram: '',
    whatsapp: '',
    youtube: '',
    twitter: '',
    facebook: ''
  });
  const [editImagensData, setEditImagensData] = useState({ capa: '', logo: '' });
  const [capaPreview, setCapaPreview] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [capaFile, setCapaFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
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
  const [desafios, setDesafios] = useState([]);
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

  // ==================== FUNÇÕES DE UPLOAD ====================
  const uploadImage = async (file, folder) => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('clubes')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('clubes')
      .getPublicUrl(filePath);
    
    return publicUrl;
  };

  // ==================== CARREGAR DADOS DO CLUBE ====================
  const carregarClube = async () => {
    try {
      const { data, error } = await supabase
        .from('clubes')
        .select('*')
        .eq('id', clubeId)
        .single();
      
      if (error) throw error;
      setClube(data);
      setIsAdmin(data.criador_id === user?.id);
    } catch (error) {
      console.error('Erro ao carregar clube:', error);
      addNotification('Erro', 'Clube não encontrado', 'error');
      navigate('/clubes');
    }
  };

  // ==================== VERIFICAR SE É MEMBRO ====================
  const verificarMembro = async () => {
    if (!user || !clube) return;
    
    try {
      const { data, error } = await supabase
        .from('clubes_membros')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('clube_id', clubeId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setIsMembro(!!data);
      console.log('Verificar membro:', !!data);
    } catch (error) {
      console.error('Erro ao verificar membro:', error);
      setIsMembro(false);
    }
  };

  // ==================== CARREGAR MEMBROS ====================
  const carregarMembros = async () => {
    if (!clube) return;
    
    try {
      console.log('🔄 Carregando membros do clube:', clubeId);
      
      const { data: membrosData, error: membrosError } = await supabase
        .from('clubes_membros')
        .select('usuario_id, data_entrada')
        .eq('clube_id', clubeId);
      
      if (membrosError) throw membrosError;
      
      if (!membrosData || membrosData.length === 0) {
        console.log('Nenhum membro encontrado');
        setMembros([]);
        return;
      }
      
      console.log('Membros encontrados:', membrosData.length);
      
      const userIds = membrosData.map(m => m.usuario_id);
      
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('id, nome, avatar, email')
        .in('id', userIds);
      
      if (usuariosError) throw usuariosError;
      
      const membrosFormatados = membrosData.map(membro => {
        const usuario = usuariosData?.find(u => u.id === membro.usuario_id);
        return {
          id: membro.usuario_id,
          nome: usuario?.nome || 'Usuário',
          avatar: usuario?.avatar || '/img/usuarios/default.jpg',
          email: usuario?.email || '',
          cargo: membro.usuario_id === clube.criador_id ? 'Administrador' : 'Membro',
          dataEntrada: membro.data_entrada || new Date().toISOString(),
          banido: false
        };
      });
      
      console.log('Membros formatados:', membrosFormatados.length);
      setMembros(membrosFormatados);
    } catch (error) {
      console.error('❌ Erro ao carregar membros:', error);
      addNotification('Erro', 'Não foi possível carregar os membros', 'error');
      setMembros([]);
    }
  };

  // ==================== CARREGAR POSTAGENS ====================
  const carregarPosts = async () => {
    if (!clube) return;
    
    try {
      const { data, error } = await supabase
        .from('clube_posts')
        .select(`
          *,
          usuarios:usuario_id (id, nome, avatar)
        `)
        .eq('clube_id', clubeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const postsFormatados = data.map(post => ({
        id: post.id,
        usuario: post.usuarios?.nome || 'Usuário',
        avatar: post.usuarios?.avatar || '/img/usuarios/default.jpg',
        usuarioId: post.usuario_id,
        mensagem: post.mensagem,
        imagem1: post.imagem1,
        imagem2: post.imagem2,
        curtidas: post.curtidas || 0,
        comentarios: post.comentarios || [],
        data: post.created_at,
        curtido: false
      }));
      
      setPosts(postsFormatados);
      
      if (user) {
        const { data: curtidasData } = await supabase
          .from('clube_post_curtidas')
          .select('post_id')
          .eq('usuario_id', user.id);
        
        const curtidosMap = {};
        curtidasData?.forEach(item => { curtidosMap[item.post_id] = true });
        
        setPosts(prev => prev.map(post => ({
          ...post,
          curtido: curtidosMap[post.id] || false
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    }
  };

  // ==================== CARREGAR EVENTOS ====================
  const carregarEventos = async () => {
    if (!clube) return;
    
    try {
      const { data, error } = await supabase
        .from('clube_eventos')
        .select('*')
        .eq('clube_id', clubeId)
        .order('data', { ascending: true });
      
      if (error) throw error;
      setEventos(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  // ==================== CARREGAR TREINOS ====================
  const carregarTreinos = async () => {
    if (!clube) return;
    
    try {
      console.log('🔄 Carregando treinos para o clube:', clubeId);
      const { data, error } = await supabase
        .from('clube_treinos')
        .select('*')
        .eq('clube_id', clubeId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      console.log('✅ Treinos carregados:', data?.length || 0, data);
      setTreinos(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar treinos:', error);
      addNotification('Erro', 'Não foi possível carregar os treinos', 'error');
      setTreinos([]);
    }
  };

  // ==================== CARREGAR DESAFIOS ====================
  const carregarDesafios = async () => {
    if (!clube) return;
    
    try {
      const { data, error } = await supabase
        .from('clube_desafios')
        .select('*')
        .eq('clube_id', clubeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDesafios(data || []);
    } catch (error) {
      console.error('Erro ao carregar desafios:', error);
    }
  };

  // ==================== ENTRAR NO CLUBE ====================
  const entrarNoClube = async () => {
    if (!user) {
      addNotification('Faça login', 'Você precisa estar logado para entrar em um clube.', 'warning');
      navigate('/login');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('clubes_membros')
        .insert([{ 
          usuario_id: user.id, 
          clube_id: clubeId,
          data_entrada: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      setIsMembro(true);
      await carregarMembros();
      addNotification('Bem-vindo!', `Você entrou no clube "${clube?.nome}".`, 'success');
    } catch (error) {
      console.error('Erro ao entrar:', error);
      addNotification('Erro', `Não foi possível entrar no clube: ${error.message}`, 'error');
    }
  };

  // ==================== SAIR DO CLUBE ====================
  const sairDoClube = async () => {
    const confirmed = window.confirm(`Tem certeza que deseja sair do clube "${clube?.nome}"?`);
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from('clubes_membros')
        .delete()
        .eq('usuario_id', user.id)
        .eq('clube_id', clubeId);
      
      if (error) throw error;
      
      setIsMembro(false);
      await carregarMembros();
      addNotification('Saiu do clube', `Você saiu do clube "${clube?.nome}".`, 'info');
      navigate('/clubes');
    } catch (error) {
      console.error('Erro ao sair:', error);
      addNotification('Erro', `Não foi possível sair do clube: ${error.message}`, 'error');
    }
  };

  // ==================== CRIAR POSTAGEM ====================
  const handleNovaPostagem = async () => {
    if (!newPostText.trim()) {
      addNotification('Erro', 'Digite algo para publicar!', 'warning');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('clube_posts')
        .insert([{
          clube_id: clubeId,
          usuario_id: user.id,
          mensagem: newPostText,
          curtidas: 0,
          comentarios: []
        }]);
      
      if (error) throw error;
      
      await carregarPosts();
      setNewPostText('');
      setShowNewPostModal(false);
      addNotification('Postagem criada!', 'Sua postagem foi publicada.', 'success');
    } catch (error) {
      console.error('Erro ao criar post:', error);
      addNotification('Erro', 'Não foi possível criar a postagem', 'error');
    }
  };

  // ==================== CURTIR POSTAGEM ====================
  const handleCurtir = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    try {
      if (post.curtido) {
        const { error } = await supabase
          .from('clube_post_curtidas')
          .delete()
          .eq('post_id', postId)
          .eq('usuario_id', user.id);
        
        if (error) throw error;
        
        await supabase
          .from('clube_posts')
          .update({ curtidas: (post.curtidas - 1) })
          .eq('id', postId);
      } else {
        const { error } = await supabase
          .from('clube_post_curtidas')
          .insert([{ post_id: postId, usuario_id: user.id }]);
        
        if (error) throw error;
        
        await supabase
          .from('clube_posts')
          .update({ curtidas: (post.curtidas + 1) })
          .eq('id', postId);
      }
      
      await carregarPosts();
    } catch (error) {
      console.error('Erro ao curtir:', error);
    }
  };

  // ==================== COMENTAR EM POSTAGEM ====================
  const handleComentar = async (postId) => {
    const texto = comentarioTexto[postId];
    if (!texto?.trim()) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const novoComentario = {
      id: Date.now(),
      usuario: user?.nome,
      usuarioId: user?.id,
      mensagem: texto,
      tempo: new Date().toLocaleString()
    };
    
    const comentariosAtuais = post.comentarios || [];
    const novosComentarios = [...comentariosAtuais, novoComentario];
    
    try {
      const { error } = await supabase
        .from('clube_posts')
        .update({ comentarios: novosComentarios })
        .eq('id', postId);
      
      if (error) throw error;
      
      await carregarPosts();
      setComentarioTexto({ ...comentarioTexto, [postId]: '' });
    } catch (error) {
      console.error('Erro ao comentar:', error);
    }
  };

  // ==================== CRIAR EVENTO ====================
  const handleAddEvento = async () => {
    if (!novoEvento.titulo || !novoEvento.data || !novoEvento.hora) {
      addNotification('Erro', 'Preencha os campos obrigatórios!', 'warning');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('clube_eventos')
        .insert([{
          clube_id: clubeId,
          ...novoEvento,
          inscritos: 0,
          created_at: new Date()
        }]);
      
      if (error) throw error;
      
      await carregarEventos();
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
      addNotification('Evento criado!', 'Evento adicionado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      addNotification('Erro', 'Não foi possível criar o evento', 'error');
    }
  };

  // ==================== ADICIONAR TREINO ====================
  const handleAddTreino = async () => {
    if (!novoTreino.dia || !novoTreino.horario) {
      addNotification('Erro', 'Preencha os campos obrigatórios!', 'warning');
      return;
    }
    
    try {
      console.log('🔄 Adicionando treino:', novoTreino);
      const { data, error } = await supabase
        .from('clube_treinos')
        .insert([{
          clube_id: clubeId,
          dia: novoTreino.dia,
          horario: novoTreino.horario,
          local: novoTreino.local || '',
          tipo: novoTreino.tipo || 'treino',
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      
      console.log('✅ Treino adicionado:', data);
      await carregarTreinos();
      setShowTreinoModal(false);
      setNovoTreino({
        dia: '',
        horario: '',
        local: '',
        tipo: 'treino'
      });
      addNotification('Treino adicionado!', 'Treino adicionado com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro ao criar treino:', error);
      addNotification('Erro', `Não foi possível adicionar o treino: ${error.message}`, 'error');
    }
  };

  // ==================== CRIAR DESAFIO ====================
  const handleAddDesafio = async () => {
    if (!novoDesafio.titulo || !novoDesafio.dataInicio || !novoDesafio.dataFim) {
      addNotification('Erro', 'Preencha os campos obrigatórios!', 'warning');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('clube_desafios')
        .insert([{
          clube_id: clubeId,
          ...novoDesafio,
          participantes: 0,
          completaram: 0,
          created_at: new Date()
        }]);
      
      if (error) throw error;
      
      await carregarDesafios();
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
      addNotification('Desafio criado!', 'Desafio adicionado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao criar desafio:', error);
      addNotification('Erro', 'Não foi possível criar o desafio', 'error');
    }
  };

  // ==================== DELETAR POSTAGEM ====================
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta postagem?')) return;
    
    try {
      console.log('🔄 Deletando postagem:', postId);
      
      const { error: curtidasError } = await supabase
        .from('clube_post_curtidas')
        .delete()
        .eq('post_id', postId);
      
      if (curtidasError) {
        console.warn('Erro ao deletar curtidas:', curtidasError);
      }
      
      const { error } = await supabase
        .from('clube_posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      
      console.log('✅ Postagem deletada');
      await carregarPosts();
      addNotification('Postagem excluída', 'Postagem removida com sucesso.', 'success');
    } catch (error) {
      console.error('❌ Erro ao excluir post:', error);
      addNotification('Erro', `Não foi possível excluir a postagem: ${error.message}`, 'error');
    }
  };

  // ==================== DELETAR EVENTO ====================
  const handleDeleteEvento = async (eventoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
    
    try {
      console.log('🔄 Deletando evento:', eventoId);
      const { error } = await supabase
        .from('clube_eventos')
        .delete()
        .eq('id', eventoId);
      
      if (error) throw error;
      
      console.log('✅ Evento deletado');
      await carregarEventos();
      addNotification('Evento excluído', 'Evento removido com sucesso.', 'success');
    } catch (error) {
      console.error('❌ Erro ao excluir evento:', error);
      addNotification('Erro', `Não foi possível excluir o evento: ${error.message}`, 'error');
    }
  };

  // ==================== DELETAR TREINO ====================
  const handleDeleteTreino = async (treinoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este treino?')) return;
    
    try {
      console.log('🔄 Deletando treino:', treinoId);
      const { error } = await supabase
        .from('clube_treinos')
        .delete()
        .eq('id', treinoId);
      
      if (error) throw error;
      
      console.log('✅ Treino deletado');
      await carregarTreinos();
      addNotification('Treino excluído', 'Treino removido com sucesso.', 'success');
    } catch (error) {
      console.error('❌ Erro ao excluir treino:', error);
      addNotification('Erro', `Não foi possível excluir o treino: ${error.message}`, 'error');
    }
  };

  // ==================== DELETAR DESAFIO ====================
  const handleDeleteDesafio = async (desafioId) => {
    if (!window.confirm('Tem certeza que deseja excluir este desafio?')) return;
    
    try {
      console.log('🔄 Deletando desafio:', desafioId);
      const { error } = await supabase
        .from('clube_desafios')
        .delete()
        .eq('id', desafioId);
      
      if (error) throw error;
      
      console.log('✅ Desafio deletado');
      await carregarDesafios();
      addNotification('Desafio excluído', 'Desafio removido com sucesso.', 'success');
    } catch (error) {
      console.error('❌ Erro ao excluir desafio:', error);
      addNotification('Erro', `Não foi possível excluir o desafio: ${error.message}`, 'error');
    }
  };

  // ==================== RANKING COM DADOS REAIS ====================
  const calcularRanking = async () => {
    if (!clube || membros.length === 0) {
      console.log('Sem membros para calcular ranking');
      return;
    }
    
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);
      
      const rankingPromises = membros.map(async (membro) => {
        const { data: atividades, error } = await supabase
          .from('atividades')
          .select('distancia, tipo')
          .eq('usuario_id', membro.id)
          .gte('data', dataLimite.toISOString());
        
        if (error) {
          console.error(`Erro ao buscar atividades de ${membro.nome}:`, error);
          return {
            id: membro.id,
            usuario: membro.nome,
            avatar: membro.avatar,
            quilometragem: 0,
            eventos: 0,
            atividadesCount: 0
          };
        }
        
        let quilometragemTotal = 0;
        atividades?.forEach(atv => {
          let distancia = parseFloat(atv.distancia) || 0;
          if (distancia > 100 && atv.tipo !== 'corrida') {
            distancia = distancia / 1000;
          }
          quilometragemTotal += distancia;
        });
        
        const { count: eventosCount } = await supabase
          .from('evento_participantes')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', membro.id);
        
        return {
          id: membro.id,
          usuario: membro.nome,
          avatar: membro.avatar,
          quilometragem: Math.round(quilometragemTotal * 10) / 10,
          eventos: eventosCount || 0,
          atividadesCount: atividades?.length || 0
        };
      });
      
      const ranking = await Promise.all(rankingPromises);
      const rankingOrdenado = ranking.sort((a, b) => b.quilometragem - a.quilometragem);
      
      setRankingData(rankingOrdenado);
      setLastUpdate(new Date().toLocaleDateString());
      console.log('✅ Ranking calculado:', rankingOrdenado);
    } catch (error) {
      console.error('❌ Erro ao calcular ranking:', error);
      const fallbackRanking = membros.map((membro, index) => ({
        id: membro.id,
        usuario: membro.nome,
        avatar: membro.avatar,
        quilometragem: 0,
        eventos: 0,
        atividadesCount: 0
      }));
      setRankingData(fallbackRanking);
    }
  };

  // ==================== ATUALIZAR RANKING MANUALMENTE ====================
  const handleAtualizarRanking = async () => {
    addNotification('Atualizando', 'Calculando ranking do clube...', 'info');
    await calcularRanking();
    addNotification('Ranking atualizado!', 'O ranking foi recalculado com os dados mais recentes.', 'success');
  };

  // ==================== ATUALIZAR CLUBE ====================
  const saveClubeEdits = async () => {
    setUploading(true);
    try {
      const { error } = await supabase
        .from('clubes')
        .update({
          nome: editFormData.nome,
          descricao: editFormData.descricao,
          localizacao: editFormData.localizacao,
          categoria: editFormData.categoria,
          instagram: editFormData.instagram,
          whatsapp: editFormData.whatsapp,
          youtube: editFormData.youtube,
          twitter: editFormData.twitter,
          facebook: editFormData.facebook
        })
        .eq('id', clubeId);
      
      if (error) throw error;
      
      await carregarClube();
      setShowEditModal(false);
      addNotification('Clube atualizado', 'Informações atualizadas com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar clube:', error);
      addNotification('Erro', 'Não foi possível atualizar o clube', 'error');
    } finally {
      setUploading(false);
    }
  };

  // ==================== ATUALIZAR IMAGENS DO CLUBE ====================
  const saveImagensEdits = async () => {
    setUploading(true);
    try {
      let capaUrl = editImagensData.capa;
      let logoUrl = editImagensData.logo;
      
      if (capaFile) {
        const uploadedUrl = await uploadImage(capaFile, `clubes/${clubeId}`);
        if (uploadedUrl) capaUrl = uploadedUrl;
      }
      
      if (logoFile) {
        const uploadedUrl = await uploadImage(logoFile, `clubes/${clubeId}`);
        if (uploadedUrl) logoUrl = uploadedUrl;
      }
      
      const { error } = await supabase
        .from('clubes')
        .update({
          capa: capaUrl,
          logo: logoUrl
        })
        .eq('id', clubeId);
      
      if (error) throw error;
      
      await carregarClube();
      setShowEditImagensModal(false);
      setCapaFile(null);
      setLogoFile(null);
      addNotification('Imagens atualizadas', 'Imagens do clube atualizadas com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar imagens:', error);
      addNotification('Erro', 'Não foi possível atualizar as imagens', 'error');
    } finally {
      setUploading(false);
    }
  };

  // ==================== EXCLUIR CLUBE ====================
  const excluirClube = async () => {
    const confirmed = window.confirm(
      `ATENÇÃO! Você está prestes a EXCLUIR PERMANENTEMENTE o clube "${clube?.nome}". Esta ação NÃO pode ser desfeita!`
    );
    
    if (confirmed) {
      const nomeDigitado = prompt(`Digite o nome do clube para confirmar: "${clube?.nome}"`);
      
      if (nomeDigitado === clube?.nome) {
        try {
          const { error } = await supabase
            .from('clubes')
            .delete()
            .eq('id', clubeId);
          
          if (error) throw error;
          
          addNotification('Clube excluído', `O clube "${clube?.nome}" foi excluído permanentemente.`, 'success');
          navigate('/clubes');
        } catch (error) {
          console.error('Erro ao excluir clube:', error);
          addNotification('Erro', 'Não foi possível excluir o clube', 'error');
        }
      } else {
        addNotification('Exclusão cancelada', 'O nome do clube não confere.', 'warning');
      }
    }
  };

  // ==================== HANDLERS ====================
  const handleEditClube = () => {
    setEditFormData({
      nome: clube.nome,
      descricao: clube.descricao,
      localizacao: clube.localizacao || '',
      categoria: clube.categoria,
      instagram: clube.instagram || '',
      whatsapp: clube.whatsapp || '',
      youtube: clube.youtube || '',
      twitter: clube.twitter || '',
      facebook: clube.facebook || ''
    });
    setShowEditModal(true);
  };

  const handleEditImagens = () => {
    setEditImagensData({
      capa: clube.capa || '',
      logo: clube.logo || ''
    });
    setCapaPreview(clube.capa);
    setAvatarPreview(clube.logo);
    setShowEditImagensModal(true);
  };

  const handleCapaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCapaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapaPreview(reader.result);
        setEditImagensData(prev => ({ ...prev, capa: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setEditImagensData(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleComentarios = (postId) => {
    setShowComentarios(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const inscreverEvento = (evento) => {
    if (!isMembro) {
      addNotification('Evento', 'Você precisa ser membro do clube para se inscrever!', 'warning');
      return;
    }
    addNotification('Evento', `Inscrito no evento "${evento.titulo}"!`, 'success');
  };

  const irParaMembros = () => {
    setShowMembrosModal(true);
  };

  // ==================== ESCUTAR MUDANÇAS EM TEMPO REAL ====================
  useEffect(() => {
    if (!clube || !user) return;

    const postsSubscription = supabase
      .channel('clube_posts_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'clube_posts', filter: `clube_id=eq.${clubeId}` },
        () => carregarPosts()
      )
      .subscribe();

    const membrosSubscription = supabase
      .channel('clube_membros_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'clubes_membros', filter: `clube_id=eq.${clubeId}` },
        () => {
          carregarMembros();
          verificarMembro();
        }
      )
      .subscribe();

    return () => {
      postsSubscription.unsubscribe();
      membrosSubscription.unsubscribe();
    };
  }, [clube, user, clubeId]);

  // ==================== LOADING INICIAL ====================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await carregarClube();
      setLoading(false);
    };
    
    if (user) {
      loadData();
    } else if (!user) {
      navigate('/login');
    } else {
      loadData();
    }
  }, [user, clubeId]);

  // ==================== CARREGAR DADOS APÓS CLUBE CARREGADO ====================
  useEffect(() => {
    if (clube) {
      const loadData = async () => {
        await verificarMembro();
        await carregarMembros();
        await carregarPosts();
        await carregarEventos();
        await carregarTreinos();
        await carregarDesafios();
        await calcularRanking();
      };
      loadData();
    }
  }, [clube]);

  if (loading || !clube) {
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

  const membrosAtivos = membros.filter(m => !m.banido);

  return (
    <>
      <Header />
      
      <div className="clube-detalhes-container">
        <div className="detalhes-capa">
          <img src={clube.capa || '/img/clube_capa_default.jpg'} alt={clube.nome} />
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
            <img src={clube.logo || '/img/clube_default.jpg'} alt={clube.nome} />
          </div>
          <div className="detalhes-info-texto">
            <div className="detalhes-nome-verificado">
              <h1>{clube.nome}</h1>
              {isAdmin && <span className="admin-badge">Administrador</span>}
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
              <p>{clube.descricao}</p>
            </div>

            <div className="detalhes-info-grid">
              <div className="detalhes-info-item">
                <i className="fas fa-tag"></i>
                <div><h4>Categoria</h4><p>{clube.categoria}</p></div>
              </div>
              <div className="detalhes-info-item">
                <i className="fas fa-map-marker-alt"></i>
                <div><h4>Localização</h4><p>{clube.localizacao || "Não informado"}</p></div>
              </div>
            </div>

            {/* Redes Sociais */}
            {(clube.instagram || clube.whatsapp || clube.youtube || clube.twitter || clube.facebook) && (
              <div className="detalhes-card redes-sociais-card">
                <h3><i className="fas fa-share-alt"></i> Redes Sociais</h3>
                <div className="redes-sociais-lista">
                  {clube.instagram && (
                    <a href={`https://instagram.com/${clube.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="rede-social-link instagram">
                      <i className="fab fa-instagram"></i>
                      <span>{clube.instagram}</span>
                    </a>
                  )}
                  {clube.whatsapp && (
                    <a href={`https://wa.me/55${clube.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="rede-social-link whatsapp">
                      <i className="fab fa-whatsapp"></i>
                      <span>{clube.whatsapp}</span>
                    </a>
                  )}
                  {clube.youtube && (
                    <a href={clube.youtube} target="_blank" rel="noopener noreferrer" className="rede-social-link youtube">
                      <i className="fab fa-youtube"></i>
                      <span>YouTube</span>
                    </a>
                  )}
                  {clube.twitter && (
                    <a href={`https://twitter.com/${clube.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="rede-social-link twitter">
                      <i className="fab fa-twitter"></i>
                      <span>{clube.twitter}</span>
                    </a>
                  )}
                  {clube.facebook && (
                    <a href={clube.facebook} target="_blank" rel="noopener noreferrer" className="rede-social-link facebook">
                      <i className="fab fa-facebook"></i>
                      <span>Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            )}

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
          </div>
        )}

        {/* Aba Eventos */}
        {activeTab === 'eventos' && (
          <div className="detalhes-eventos">
            <div className="detalhes-card">
              <div className="detalhes-postagens-header">
                <h3><i className="fas fa-calendar-alt"></i> Eventos e Desafios</h3>
                <div className="header-buttons">
                  {isAdmin && (
                    <>
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
                        <div className="desafio-content">
                          <div className="desafio-header">
                            <h4>{desafio.titulo}</h4>
                            <div className="desafio-periodo">
                              <span><i className="fas fa-calendar"></i> {desafio.dataInicio} a {desafio.dataFim}</span>
                            </div>
                          </div>
                          <p className="desafio-descricao">{desafio.descricao}</p>
                          <div className="desafio-stats">
                            <span><i className="fas fa-users"></i> {desafio.participantes} participantes</span>
                            <span><i className="fas fa-check-circle"></i> {desafio.completaram} completaram</span>
                          </div>
                          <div className="desafio-actions">
                            <button className="desafio-btn-participar" onClick={() => inscreverEvento(desafio)}>
                              <i className="fas fa-flag-checkered"></i> Participar
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
              
              {/* Eventos */}
              {eventos.length === 0 && desafios.length === 0 ? (
                <div className="detalhes-sem-postagens">
                  <i className="fas fa-calendar"></i>
                  <p>Nenhum evento ou desafio programado ainda.</p>
                  {isAdmin && <button className="detalhes-btn-entrar" onClick={() => setShowEventoModal(true)}>Adicionar Evento</button>}
                </div>
              ) : (
                eventos.length > 0 && (
                  <>
                    <h4 className="section-subtitle">Eventos</h4>
                    <div className="detalhes-eventos-lista">
                      {eventos.map(evento => (
                        <div key={evento.id} className="detalhes-evento-card">
                          <div className="detalhes-evento-data">
                            <span className="detalhes-evento-dia">{evento.data?.split('-')[2]}</span>
                            <span className="detalhes-evento-mes">{evento.data?.split('-')[1]}</span>
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
                <h3><i className="fas fa-dumbbell"></i> Treinos Programados</h3>
                {isAdmin && (
                  <button className="detalhes-btn-nova-postagem" onClick={() => setShowTreinoModal(true)}>
                    <i className="fas fa-plus"></i> Adicionar Treino
                  </button>
                )}
              </div>
              
              {treinos.length === 0 ? (
                <div className="detalhes-sem-postagens">
                  <i className="fas fa-dumbbell"></i>
                  <p>Nenhum treino programado ainda.</p>
                  {isAdmin && (
                    <button className="detalhes-btn-entrar" onClick={() => setShowTreinoModal(true)}>
                      Adicionar Treino
                    </button>
                  )}
                </div>
              ) : (
                <div className="treinos-lista">
                  {treinos.map(treino => (
                    <div key={treino.id} className="treino-card">
                      <div className="treino-dia">
                        <i className="fas fa-calendar-day"></i>
                        <strong>{treino.dia}</strong>
                      </div>
                      <div className="treino-info">
                        <div className="treino-horario">
                          <i className="fas fa-clock"></i>
                          <span>{treino.horario}</span>
                        </div>
                        {treino.local && (
                          <div className="treino-local">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{treino.local}</span>
                          </div>
                        )}
                        {treino.tipo && (
                          <div className="treino-tipo">
                            <i className="fas fa-running"></i>
                            <span>{treino.tipo}</span>
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <button className="btn-delete-treino" onClick={() => handleDeleteTreino(treino.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
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
                    {(isAdmin || post.usuarioId === user?.id) && (
                      <button className="btn-delete-post" onClick={() => handleDeletePost(post.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                  <p className="detalhes-postagem-mensagem">{post.mensagem}</p>
                  
                  <div className="detalhes-postagem-acoes">
                    <button className={`detalhes-postagem-curtir ${post.curtido ? 'curtido' : ''}`} onClick={() => handleCurtir(post.id)}>
                      <i className="fas fa-heart"></i> <span>{post.curtidas}</span>
                    </button>
                    <button className="detalhes-postagem-comentar" onClick={() => toggleComentarios(post.id)}>
                      <i className="fas fa-comment"></i> <span>{post.comentarios?.length || 0}</span>
                    </button>
                  </div>
                  
                  {showComentarios[post.id] && (
                    <div className="detalhes-postagem-comentarios">
                      <div className="detalhes-comentarios-lista">
                        {post.comentarios?.map(com => (
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
                clubeId={clubeId} 
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
                  <button className="btn-atualizar-ranking" onClick={handleAtualizarRanking}>
                    <i className="fas fa-sync-alt"></i> Atualizar
                  </button>
                </div>
              </div>
              
              {rankingData.length === 0 ? (
                <div className="detalhes-sem-postagens">
                  <i className="fas fa-chart-line"></i>
                  <p>Nenhuma atividade registrada ainda.</p>
                  <p className="ranking-empty-hint">Complete atividades para aparecer no ranking!</p>
                </div>
              ) : (
                <div className="detalhes-ranking-tabela">
                  <div className="detalhes-ranking-cabecalho">
                    <span>#</span>
                    <span>Atleta</span>
                    <span>Km</span>
                    <span>Eventos</span>
                    <span>Atividades</span>
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
                        <img src={item.avatar || '/img/usuarios/default.jpg'} alt={item.usuario} />
                        <span>{item.usuario}</span>
                      </div>
                      <span className="detalhes-ranking-km">
                        {item.quilometragem > 0 ? `${item.quilometragem} km` : '—'}
                      </span>
                      <span className="detalhes-ranking-eventos">
                        {item.eventos > 0 ? item.eventos : '—'}
                      </span>
                      <span className="detalhes-ranking-atividades">
                        {item.atividadesCount > 0 ? item.atividadesCount : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
                  <i className="fas fa-image"></i> Editar Imagens
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
              </div>
            </div>

            <div className="detalhes-card excluir-clube-card">
              <h3><i className="fas fa-exclamation-triangle"></i> Zona de Perigo</h3>
              <div className="excluir-clube-area">
                <p><strong>Atenção!</strong> Esta ação é irreversível.</p>
                <button className="btn-excluir-clube" onClick={excluirClube}>
                  <i className="fas fa-trash-alt"></i> Excluir Clube
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL - Nova Postagem */}
      {showNewPostModal && (
        <div className="modal-overlay" onClick={() => setShowNewPostModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova Postagem</h3>
              <button onClick={() => setShowNewPostModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <textarea
                className="post-textarea"
                placeholder="O que você está pensando?"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                rows="4"
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowNewPostModal(false)}>Cancelar</button>
              <button className="btn-submit" onClick={handleNovaPostagem}>Publicar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - Editar Informações do Clube */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content edit-clube-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Informações do Clube</h3>
              <button onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <input 
                type="text" 
                placeholder="Nome do Clube" 
                value={editFormData.nome || ''} 
                onChange={(e) => setEditFormData({...editFormData, nome: e.target.value})} 
              />
              <textarea 
                placeholder="Descrição" 
                value={editFormData.descricao || ''} 
                onChange={(e) => setEditFormData({...editFormData, descricao: e.target.value})}
                rows="4"
              />
              <input 
                type="text" 
                placeholder="Localização" 
                value={editFormData.localizacao || ''} 
                onChange={(e) => setEditFormData({...editFormData, localizacao: e.target.value})} 
              />
              <select 
                value={editFormData.categoria || ''} 
                onChange={(e) => setEditFormData({...editFormData, categoria: e.target.value})}
              >
                <option value="">Selecione uma categoria</option>
                <option value="Corrida">Corrida</option>
                <option value="Ciclismo">Ciclismo</option>
                <option value="Triatlo">Triatlo</option>
                <option value="Musculação">Musculação</option>
                <option value="Crossfit">Crossfit</option>
                <option value="Natação">Natação</option>
              </select>
              
              <h4 className="redes-sociais-title">Redes Sociais</h4>
              <div className="redes-sociais-inputs">
                <div className="rede-input">
                  <i className="fab fa-instagram"></i>
                  <input 
                    type="text" 
                    placeholder="@instagram" 
                    value={editFormData.instagram || ''} 
                    onChange={(e) => setEditFormData({...editFormData, instagram: e.target.value})}
                  />
                </div>
                <div className="rede-input">
                  <i className="fab fa-whatsapp"></i>
                  <input 
                    type="text" 
                    placeholder="WhatsApp (com DDD)" 
                    value={editFormData.whatsapp || ''} 
                    onChange={(e) => setEditFormData({...editFormData, whatsapp: e.target.value})}
                  />
                </div>
                <div className="rede-input">
                  <i className="fab fa-youtube"></i>
                  <input 
                    type="text" 
                    placeholder="YouTube URL" 
                    value={editFormData.youtube || ''} 
                    onChange={(e) => setEditFormData({...editFormData, youtube: e.target.value})}
                  />
                </div>
                <div className="rede-input">
                  <i className="fab fa-twitter"></i>
                  <input 
                    type="text" 
                    placeholder="@twitter" 
                    value={editFormData.twitter || ''} 
                    onChange={(e) => setEditFormData({...editFormData, twitter: e.target.value})}
                  />
                </div>
                <div className="rede-input">
                  <i className="fab fa-facebook"></i>
                  <input 
                    type="text" 
                    placeholder="Facebook URL" 
                    value={editFormData.facebook || ''} 
                    onChange={(e) => setEditFormData({...editFormData, facebook: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancelar</button>
              <button className="btn-submit" onClick={saveClubeEdits} disabled={uploading}>
                {uploading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - Editar Imagens do Clube */}
      {showEditImagensModal && (
        <div className="modal-overlay" onClick={() => setShowEditImagensModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Imagens do Clube</h3>
              <button onClick={() => setShowEditImagensModal(false)}>&times;</button>
            </div>
            <div className="modal-body imagens-edit-modal">
              <div className="imagem-edit-field">
                <label>Imagem de Capa</label>
                <div className="imagem-preview" onClick={() => document.getElementById('capaInput').click()}>
                  {capaPreview ? (
                    <img src={capaPreview} alt="Preview capa" />
                  ) : (
                    <div className="imagem-placeholder">
                      <i className="fas fa-image"></i>
                      <span>Clique para adicionar capa</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  id="capaInput" 
                  accept="image/*" 
                  onChange={handleCapaUpload}
                  style={{ display: 'none' }}
                />
              </div>
              
              <div className="imagem-edit-field">
                <label>Logo do Clube</label>
                <div className="imagem-preview logo-preview" onClick={() => document.getElementById('logoInput').click()}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview logo" />
                  ) : (
                    <div className="imagem-placeholder">
                      <i className="fas fa-image"></i>
                      <span>Clique para adicionar logo</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  id="logoInput" 
                  accept="image/*" 
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditImagensModal(false)}>Cancelar</button>
              <button className="btn-submit" onClick={saveImagensEdits} disabled={uploading}>
                {uploading ? 'Enviando...' : 'Salvar Imagens'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - Adicionar Evento */}
      {showEventoModal && (
        <div className="modal-overlay" onClick={() => setShowEventoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adicionar Evento</h3>
              <button onClick={() => setShowEventoModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <input type="text" placeholder="Título" value={novoEvento.titulo} onChange={(e) => setNovoEvento({...novoEvento, titulo: e.target.value})} />
              <textarea placeholder="Descrição" value={novoEvento.descricao} onChange={(e) => setNovoEvento({...novoEvento, descricao: e.target.value})} />
              <input type="date" value={novoEvento.data} onChange={(e) => setNovoEvento({...novoEvento, data: e.target.value})} />
              <input type="time" value={novoEvento.hora} onChange={(e) => setNovoEvento({...novoEvento, hora: e.target.value})} />
              <input type="text" placeholder="Local" value={novoEvento.local} onChange={(e) => setNovoEvento({...novoEvento, local: e.target.value})} />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEventoModal(false)}>Cancelar</button>
              <button className="btn-submit" onClick={handleAddEvento}>Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - Adicionar Treino */}
      {showTreinoModal && (
        <div className="modal-overlay" onClick={() => setShowTreinoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adicionar Treino</h3>
              <button onClick={() => setShowTreinoModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <select value={novoTreino.dia} onChange={(e) => setNovoTreino({...novoTreino, dia: e.target.value})}>
                <option value="">Selecione o dia</option>
                <option value="Segunda">Segunda-feira</option>
                <option value="Terça">Terça-feira</option>
                <option value="Quarta">Quarta-feira</option>
                <option value="Quinta">Quinta-feira</option>
                <option value="Sexta">Sexta-feira</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
              <input type="time" placeholder="Horário" value={novoTreino.horario} onChange={(e) => setNovoTreino({...novoTreino, horario: e.target.value})} />
              <input type="text" placeholder="Local" value={novoTreino.local} onChange={(e) => setNovoTreino({...novoTreino, local: e.target.value})} />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowTreinoModal(false)}>Cancelar</button>
              <button className="btn-submit" onClick={handleAddTreino}>Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - Criar Desafio */}
      {showDesafioModal && (
        <div className="modal-overlay" onClick={() => setShowDesafioModal(false)}>
          <div className="modal-content desafio-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Promover Desafio</h3>
              <button onClick={() => setShowDesafioModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <input type="text" placeholder="Título do Desafio" value={novoDesafio.titulo} onChange={(e) => setNovoDesafio({...novoDesafio, titulo: e.target.value})} />
              <textarea placeholder="Descrição" value={novoDesafio.descricao} onChange={(e) => setNovoDesafio({...novoDesafio, descricao: e.target.value})} />
              <input type="date" value={novoDesafio.dataInicio} onChange={(e) => setNovoDesafio({...novoDesafio, dataInicio: e.target.value})} />
              <input type="date" value={novoDesafio.dataFim} onChange={(e) => setNovoDesafio({...novoDesafio, dataFim: e.target.value})} />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDesafioModal(false)}>Cancelar</button>
              <button className="btn-submit" onClick={handleAddDesafio}>Criar Desafio</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - Gerenciar Membros */}
      {showMembrosModal && (
        <div className="modal-overlay" onClick={() => setShowMembrosModal(false)}>
          <div className="modal-content membros-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Membros do Clube ({membrosAtivos.length})</h3>
              <button onClick={() => setShowMembrosModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {membrosAtivos.length === 0 ? (
                <div className="sem-membros">
                  <i className="fas fa-users-slash"></i>
                  <p>Nenhum membro encontrado.</p>
                  <p className="membros-hint">Compartilhe o clube com amigos para começar!</p>
                </div>
              ) : (
                <div className="membros-lista">
                  {membrosAtivos.map(membro => (
                    <div key={membro.id} className="membro-item">
                      <img src={membro.avatar} alt={membro.nome} />
                      <div className="membro-info">
                        <strong>{membro.nome}</strong>
                        <span>{membro.cargo}</span>
                        {membro.id === clube.criador_id && <span className="admin-tag">Admin</span>}
                      </div>
                      {isAdmin && membro.id !== clube.criador_id && (
                        <button className="btn-expulsar" onClick={async () => {
                          if (window.confirm(`Deseja expulsar ${membro.nome} do clube?`)) {
                            try {
                              const { error } = await supabase
                                .from('clubes_membros')
                                .delete()
                                .eq('usuario_id', membro.id)
                                .eq('clube_id', clubeId);
                              
                              if (error) throw error;
                              
                              await carregarMembros();
                              addNotification('Membro expulso', `${membro.nome} foi removido do clube.`, 'info');
                            } catch (error) {
                              console.error('Erro ao expulsar membro:', error);
                              addNotification('Erro', 'Não foi possível expulsar o membro', 'error');
                            }
                          }
                        }}>
                          <i className="fas fa-user-minus"></i> Expulsar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
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