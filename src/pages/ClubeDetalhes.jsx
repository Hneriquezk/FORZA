import React, { useState, useEffect } from 'react';
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

  const [clube, setClube] = useState(null);
  const [membros, setMembros] = useState([]);
  const [eventos, setEventos] = useState([]);
  
  // Estados para Postagens
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage1, setNewPostImage1] = useState(null);
  const [newPostImage2, setNewPostImage2] = useState(null);
  const [newPostImagePreview1, setNewPostImagePreview1] = useState(null);
  const [newPostImagePreview2, setNewPostImagePreview2] = useState(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [comentarioTexto, setComentarioTexto] = useState({});
  const [showComentarios, setShowComentarios] = useState({});
  
  // Estados para Ranking
  const [rankingData, setRankingData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const clubesData = {
    1: {
      id: 1,
      nome: "Corredores de São José e Região",
      nomeAbreviado: "Corredores SJC",
      avatar: "/img/clubes/corredores_sjc_avatar.jpg",
      capa: "/img/clubes/corredores_sjc.jpg",
      descricao: "Somos um grupo de corredores apaixonados por corrida de rua, trilha e bem-estar. Nos reunimos semanalmente para treinos em grupo, participamos de provas e eventos e compartilhamos dicas de treino, nutrição e equipamentos. Venha correr conosco!",
      sobre: "Fundado em 2018, o Clube Corredores de São José e Região reúne atletas amadores e profissionais da região do Vale do Paraíba. Com mais de 500 membros ativos, realizamos treinos coletivos às terças e quintas-feiras no Parque da Cidade, além de treinos de longão aos sábados.",
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
        strava: "Corredores SJC",
        whatsapp: "Grupo Oficial"
      },
      horarios: {
        terça: "19h30 - Parque da Cidade",
        quinta: "19h30 - Parque da Cidade", 
        sábado: "07h00 - Longão (local varia)"
      },
      valores: {
        mensalidade: "Gratuito",
        adesao: "Gratuita"
      },
      contato: {
        email: "contato@corredoressjc.com",
        telefone: "(12) 99729-1076"
      }
    },
    2: {
      id: 2,
      nome: "Ciclotech",
      nomeAbreviado: "Ciclotech",
      avatar: "/img/clubes/ciclotech.png",
      capa: "/img/clubes/ciclotech_capa.jpg",
      descricao: "Equipe de ciclismo focada em performance, tecnologia e comunidade. Treinos de estrada, MTB e indoor.",
      sobre: "A Ciclotech é referência em tecnologia aplicada ao ciclismo. Oferecemos treinos inteligentes com análise de dados, potência e frequência cardíaca. Nossa equipe compete em provas regionais e nacionais.",
      localizacao: "São José dos Campos, SP, Brasil",
      regiao: "Vale do Paraíba",
      membrosCount: 328,
      eventoCount: 45,
      fundacao: "2020",
      tipo: "Privado",
      categoria: "Ciclismo",
      verificado: true,
      redes: {
        instagram: "@ciclotech",
        strava: "Ciclotech Team"
      },
      horarios: {
        terça: "06h00 - Treino de Estrada",
        quinta: "06h00 - Treino de Estrada",
        sábado: "07h00 - MTB / Longão"
      },
      valores: {
        mensalidade: "R$ 49,90",
        adesao: "Gratuita"
      },
      contato: {
        email: "equipe@ciclotech.com.br"
      }
    },
    3: {
      id: 3,
      nome: "Parkrun UK",
      nomeAbreviado: "Parkrun UK",
      avatar: "/img/clubes/parkrun.png",
      capa: "/img/clubes/parkrun_capa.jpg",
      descricao: "Comunidade global de corrida gratuita. Eventos de 5km todos os sábados. Todos são bem-vindos!",
      sobre: "Parkrun é um movimento global que organiza corridas gratuitas de 5km em parques públicos todos os sábados. Na UK, somos uma das maiores comunidades, com mais de 500 eventos semanais.",
      localizacao: "Reino Unido",
      regiao: "Global",
      membrosCount: 12500,
      eventoCount: 512,
      fundacao: "2004",
      tipo: "Público",
      categoria: "Corrida",
      verificado: true,
      redes: {
        instagram: "@parkrun",
        strava: "Parkrun"
      },
      horarios: {
        sábado: "09h00 - 5km"
      },
      valores: {
        mensalidade: "Gratuito",
        adesao: "Gratuita"
      }
    },
    4: {
      id: 4,
      nome: "Red Bull UK",
      nomeAbreviado: "Red Bull",
      avatar: "/img/clubes/red_bull.png",
      capa: "/img/clubes/red_bull_capa.jpg",
      descricao: "Equipe oficial Red Bull para atletas de alto rendimento. Treinos exclusivos e suporte profissional.",
      sobre: "A Red Bull UK é a equipe elite de atletas patrocinados pela Red Bull. Treinos intensivos, preparação para competições internacionais e suporte completo.",
      localizacao: "Reino Unido",
      regiao: "Global",
      membrosCount: 89,
      eventoCount: 67,
      fundacao: "2010",
      tipo: "Privado",
      categoria: "Multi-esportes",
      verificado: true,
      valores: {
        mensalidade: "Por convite",
        adesao: "Seletiva"
      }
    }
  };

  const membrosData = {
    1: [
      { id: 1, nome: "Gabriel Bastos", avatar: "/img/usuarios/gabriel.png", cargo: "Administrador", atividades: 128 },
      { id: 2, nome: "Giovanni Morette", avatar: "/img/usuarios/giovanni_borsoi.jpg", cargo: "Moderador", atividades: 95 },
      { id: 3, nome: "Henrique Lima", avatar: "/img/usuarios/henrique_santosz.jpg", cargo: "Membro", atividades: 34 },
      { id: 4, nome: "Vitor Vaz", avatar: "/img/usuarios/vitor_vaz.jpg", cargo: "Membro", atividades: 21 },
      { id: 5, nome: "Caio Figueira", avatar: "/img/usuarios/caio.png", cargo: "Membro", atividades: 67 }
    ],
    2: [
      { id: 1, nome: "André Bike", avatar: "/img/usuarios/avatar_andre.png", cargo: "Administrador", atividades: 245 },
      { id: 2, nome: "Carla Pedal", avatar: "/img/usuarios/avatar_carla.png", cargo: "Moderador", atividades: 187 },
      { id: 3, nome: "Ricardo Speed", avatar: "/img/usuarios/avatar_ricardo.png", cargo: "Membro", atividades: 98 }
    ],
    3: [
      { id: 1, nome: "John Runner", avatar: "/img/usuarios/avatar_john.png", cargo: "Administrador", atividades: 512 },
      { id: 2, nome: "Sarah Park", avatar: "/img/usuarios/avatar_sarah.png", cargo: "Moderador", atividades: 345 }
    ],
    4: [
      { id: 1, nome: "Max Power", avatar: "/img/usuarios/avatar_max.png", cargo: "Administrador", atividades: 890 }
    ]
  };

  const eventosData = {
    1: [
      { id: 1, titulo: "Treino Coletivo - Parque da Cidade", data: "15/04/2026", hora: "19h30", tipo: "Treino", local: "Parque da Cidade", vagas: 50, inscritos: 32, km: 8 },
      { id: 2, titulo: "Longão de Sábado - 15km", data: "20/04/2026", hora: "07h00", tipo: "Treino", local: "Av. Andrômeda", vagas: 100, inscritos: 67, km: 15 },
      { id: 3, titulo: "Corrida Noturna SJC", data: "28/04/2026", hora: "18h00", tipo: "Evento", local: "Centro", vagas: 200, inscritos: 156, km: 10 }
    ],
    2: [
      { id: 1, titulo: "Pedal Matinal - Estrada", data: "16/04/2026", hora: "06h00", tipo: "Treino", local: "Via SJC", vagas: 30, inscritos: 18, km: 45 },
      { id: 2, titulo: "Treino de Potência - Indoor", data: "18/04/2026", hora: "19h00", tipo: "Treino", local: "Sede Ciclotech", vagas: 20, inscritos: 15, km: 30 }
    ]
  };

  // Função para upload de imagem
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

  // Carregar posts do clube
  const loadPosts = () => {
    const savedPosts = localStorage.getItem(`clube_posts_${clubeId}`);
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      const initialPosts = [
        {
          id: 1,
          usuario: "Gabriel Bastos",
          avatar: "/img/usuarios/gabriel.png",
          mensagem: "Bom dia pessoal! Treino hoje no Parque da Cidade às 19h, quem vai? 🏃‍♂️",
          imagem1: null,
          imagem2: null,
          curtidas: 12,
          comentarios: [
            { id: 1, usuario: "Giovanni Morette", mensagem: "Vou sim! Te encontro lá", tempo: "2h atrás" },
            { id: 2, usuario: "Vitor Vaz", mensagem: "Hoje não vou conseguir, mas semana que vem estou lá!", tempo: "1h atrás" }
          ],
          data: new Date().toISOString(),
          curtido: false
        },
        {
          id: 2,
          usuario: "Giovanni Morette",
          avatar: "/img/usuarios/giovanni_borsoi.jpg",
          mensagem: "Alguém anima um pedal no sábado? 🔥",
          imagem1: null,
          imagem2: null,
          curtidas: 8,
          comentarios: [
            { id: 1, usuario: "Caio Figueira", mensagem: "Eu topo! Que horas?", tempo: "3h atrás" }
          ],
          data: new Date(Date.now() - 86400000).toISOString(),
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
    
    const post = posts.find(p => p.id === postId);
    if (!post?.curtido) {
      addNotification('Curtida!', 'Você curtiu esta postagem.', 'success', 'fa-heart');
    }
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
    addNotification('Comentário adicionado', 'Seu comentário foi publicado.', 'success', 'fa-comment');
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
      avatar: user?.avatar || "/img/usuarios/vitor_vaz.jpg",
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

  // Calcular ranking baseado nos eventos
  const calcularRanking = () => {
    const participantesEventos = [
      { id: 1, usuario: "Gabriel Bastos", avatar: "/img/usuarios/gabriel.png", quilometragem: 156.5, eventos: 8 },
      { id: 2, usuario: "Giovanni Morette", avatar: "/img/usuarios/giovanni_borsoi.jpg", quilometragem: 142.3, eventos: 7 },
      { id: 3, usuario: "Henrique Lima", avatar: "/img/usuarios/henrique_santosz.jpg", quilometragem: 98.7, eventos: 5 },
      { id: 4, usuario: "Vitor Vaz", avatar: "/img/usuarios/vitor_vaz.jpg", quilometragem: 87.2, eventos: 4 },
      { id: 5, usuario: "Caio Figueira", avatar: "/img/usuarios/caio.png", quilometragem: 65.4, eventos: 3 },
      { id: 6, usuario: "Ana Costa", avatar: "https://img.magnific.com/fotos-gratis/feliz-bonito-mulher-jovem-posar-camera-em-parque-cidade_1262-19158.jpg", quilometragem: 45.8, eventos: 2 },
      { id: 7, usuario: "Pedro Oliveira", avatar: "https://dgtzuqphqg23d.cloudfront.net/N91108auwK0YySdlMCoPXFUS-LTleaTDFvBdYUxNZJY-1536x2048.jpg", quilometragem: 32.1, eventos: 2 },
      { id: 8, usuario: "Carlos Lima", avatar: "https://dgtzuqphqg23d.cloudfront.net/fMFl9s-OMkVe-wJ-SnpVnrzocU2MZAXLe6qsr1lbuBw-1536x2048.jpg", quilometragem: 28.5, eventos: 1 }
    ];
    
    const sorted = [...participantesEventos].sort((a, b) => b.quilometragem - a.quilometragem);
    setRankingData(sorted);
    setLastUpdate(new Date().toLocaleDateString());
  };

  const atualizarRanking = () => {
    calcularRanking();
    addNotification('Ranking atualizado!', 'A classificação do clube foi atualizada.', 'info', 'fa-chart-line');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (clubeId && clubesData[clubeId]) {
      setClube(clubesData[clubeId]);
      setMembros(membrosData[clubeId] || []);
      setEventos(eventosData[clubeId] || []);
      
      const clubesParticipados = JSON.parse(localStorage.getItem('forza_clubes_membros') || '[]');
      setIsMembro(clubesParticipados.includes(parseInt(clubeId)));
      
      loadPosts();
      calcularRanking();
    } else {
      navigate('/clubes');
    }
    
    setLoading(false);
  }, [isAuthenticated, navigate, clubeId]);

  const entrarNoClube = async () => {
    if (isMembro) {
      addNotification('Clube', `Você já é membro do ${clube.nome}!`, 'warning', 'fa-exclamation-circle');
      return;
    }
    
    const confirmed = await window.confirm(`Deseja participar do clube "${clube.nome}"?\n\n${clube.tipo === 'Privado' ? 'Este clube é privado. Seu pedido será analisado pelos administradores.' : 'Clube público! Você será adicionado imediatamente.'}`);
    
    if (confirmed) {
      const clubesParticipados = JSON.parse(localStorage.getItem('forza_clubes_membros') || '[]');
      clubesParticipados.push(clube.id);
      localStorage.setItem('forza_clubes_membros', JSON.stringify(clubesParticipados));
      setIsMembro(true);
      
      addNotification('Clube', `Você entrou no clube "${clube.nome}"! Bem-vindo(a)!`, 'success', 'fa-check-circle');
    }
  };

  const sairDoClube = async () => {
    const confirmed = await window.confirm(`Tem certeza que deseja sair do clube "${clube.nome}"?`);
    if (confirmed) {
      const clubesParticipados = JSON.parse(localStorage.getItem('forza_clubes_membros') || '[]');
      const novos = clubesParticipados.filter(id => id !== clube.id);
      localStorage.setItem('forza_clubes_membros', JSON.stringify(novos));
      setIsMembro(false);
      
      addNotification('Clube', `Você saiu do clube "${clube.nome}". Sentiremos sua falta!`, 'info', 'fa-sign-out-alt');
      navigate('/clubes');
    }
  };

  const inscreverEvento = (evento) => {
    if (!isMembro) {
      addNotification('Evento', 'Você precisa ser membro do clube para se inscrever nos eventos!', 'warning', 'fa-exclamation-circle');
      return;
    }
    addNotification('Evento', `Inscrito no evento "${evento.titulo}"! Compareça no dia ${evento.data} às ${evento.hora}.`, 'success', 'fa-calendar-check');
  };

  const irParaMembros = () => {
    navigate(`/clube/${clubeId}/membros`);
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

  return (
    <>
      <Header />
      
      <div className="clube-detalhes-container">
        {/* Capa do Clube */}
        <div className="detalhes-capa">
          <img src={clube.capa} alt={clube.nome} />
          <button className="detalhes-voltar" onClick={() => navigate('/clubes')}>
            <i className="fas fa-arrow-left"></i> Voltar
          </button>
        </div>

        {/* Info do Clube */}
        <div className="detalhes-info-header">
          <div className="detalhes-avatar-grande">
            <img src={clube.avatar} alt={clube.nome} />
          </div>
          <div className="detalhes-info-texto">
            <div className="detalhes-nome-verificado">
              <h1>{clube.nome}</h1>
              {clube.verificado && <i className="fas fa-check-circle verified"></i>}
            </div>
            <p className="detalhes-descricao">{clube.descricao}</p>
            <div className="detalhes-stats">
              <span className="detalhes-stats-clickable" onClick={irParaMembros}>
                <i className="fas fa-users"></i> {clube.membrosCount} membros
              </span>
              <span><i className="fas fa-calendar-alt"></i> {clube.eventoCount} eventos</span>
              <span><i className="fas fa-map-marker-alt"></i> {clube.localizacao}</span>
            </div>
          </div>
          <div className="detalhes-acoes">
            {isMembro ? (
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

        {/* Tabs */}
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
        </div>

        {/* Conteúdo - Aba Postagens */}
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
                  </div>
                  <p className="detalhes-postagem-mensagem">{post.mensagem}</p>
                  
                  {/* Imagens do post */}
                  {(post.imagem1 || post.imagem2) && (
                    <div className="detalhes-postagem-imagens">
                      {post.imagem1 && (
                        <img 
                          src={post.imagem1} 
                          alt="Imagem do post" 
                          className="detalhes-postagem-imagem"
                          onClick={() => window.open(post.imagem1, '_blank')}
                        />
                      )}
                      {post.imagem2 && (
                        <img 
                          src={post.imagem2} 
                          alt="Imagem do post" 
                          className="detalhes-postagem-imagem"
                          onClick={() => window.open(post.imagem2, '_blank')}
                        />
                      )}
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
                  
                  {/* Comentários */}
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

        {/* Outras abas (Sobre, Membros, Eventos, Treinos, Chat, Ranking) - mantidas simplificadas */}
        {activeTab === 'sobre' && (
          <div className="detalhes-sobre">
            <div className="detalhes-card">
              <h3><i className="fas fa-history"></i> Sobre o Clube</h3>
              <p>{clube.sobre}</p>
            </div>

            <div className="detalhes-info-grid">
              <div className="detalhes-info-item">
                <i className="fas fa-calendar-alt"></i>
                <div><h4>Fundação</h4><p>{clube.fundacao}</p></div>
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
                <div><h4>Região</h4><p>{clube.regiao}</p></div>
              </div>
            </div>

            {clube.horarios && (
              <div className="detalhes-card">
                <h3><i className="fas fa-clock"></i> Horários de Treino</h3>
                <div className="detalhes-horarios">
                  {Object.entries(clube.horarios).map(([dia, horario]) => (
                    <div key={dia} className="detalhes-horario-item">
                      <span className="detalhes-dia">{dia.charAt(0).toUpperCase() + dia.slice(1)}</span>
                      <span className="detalhes-horario">{horario}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {clube.redes && (
              <div className="detalhes-card">
                <h3><i className="fas fa-share-alt"></i> Redes Sociais</h3>
                <div className="detalhes-redes">
                  {clube.redes.instagram && <div className="detalhes-rede-item"><i className="fab fa-instagram"></i><span>{clube.redes.instagram}</span></div>}
                  {clube.redes.strava && <div className="detalhes-rede-item"><i className="fab fa-strava"></i><span>{clube.redes.strava}</span></div>}
                  {clube.redes.whatsapp && <div className="detalhes-rede-item"><i ClassName="fab fa-whatsapp"></i><span>{clube.redes.whatsapp}</span></div>}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'membros' && (
          <div className="detalhes-membros">
            <div className="detalhes-card">
              <h3><i className="fas fa-users"></i> Membros ({membros.length})</h3>
              <div className="detalhes-membros-grid">
                {membros.map(membro => (
                  <div key={membro.id} className="detalhes-membro-card">
                    <img src={membro.avatar} alt={membro.nome} />
                    <div className="detalhes-membro-info">
                      <h4>{membro.nome}</h4>
                      <span className="detalhes-membro-cargo">{membro.cargo}</span>
                      <span className="detalhes-membro-atividades"><i className="fas fa-running"></i> {membro.atividades} atividades</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'eventos' && (
          <div className="detalhes-eventos">
            <div className="detalhes-card">
              <h3><i className="fas fa-calendar-alt"></i> Próximos Eventos</h3>
              <div className="detalhes-eventos-lista">
                {eventos.map(evento => (
                  <div key={evento.id} className="detalhes-evento-card">
                    <div className="detalhes-evento-data">
                      <span className="detalhes-evento-dia">{evento.data.split('/')[0]}</span>
                      <span className="detalhes-evento-mes">{evento.data.split('/')[1]}</span>
                    </div>
                    <div className="detalhes-evento-info">
                      <h4>{evento.titulo}</h4>
                      <div className="detalhes-evento-detalhes">
                        <span><i className="fas fa-clock"></i> {evento.hora}</span>
                        <span><i className="fas fa-map-marker-alt"></i> {evento.local}</span>
                        <span className={`detalhes-evento-tipo ${evento.tipo === 'Evento' ? 'evento' : 'treino'}`}>{evento.tipo}</span>
                      </div>
                      <div className="detalhes-evento-vagas">
                        <div className="detalhes-vagas-bar"><div className="detalhes-vagas-fill" style={{ width: `${(evento.inscritos / evento.vagas) * 100}%` }}></div></div>
                        <span>{evento.inscritos}/{evento.vagas} inscritos</span>
                      </div>
                    </div>
                    <button className="detalhes-evento-btn" onClick={() => inscreverEvento(evento)}>
                      {isMembro ? 'Inscrever-se' : 'Entre no clube'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'treinos' && clube.horarios && (
          <div className="detalhes-treinos">
            <div className="detalhes-card">
              <h3><i className="fas fa-dumbbell"></i> Treinos da Semana</h3>
              <div className="detalhes-treinos-semana">
                {Object.entries(clube.horarios).map(([dia, horario]) => (
                  <div key={dia} className="detalhes-treino-dia-card">
                    <div className="detalhes-treino-dia-nome">{dia.charAt(0).toUpperCase() + dia.slice(1)}</div>
                    <div className="detalhes-treino-dia-info"><i className="fas fa-clock"></i> {horario}</div>
                    <button className="detalhes-treino-btn" disabled={!isMembro}>
                      <i className="fas fa-check"></i> {isMembro ? 'Confirmar Presença' : 'Entre no clube'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="detalhes-chat">
            {isMembro ? (
              <ClubeChat 
                clubeId={parseInt(clubeId)} 
                clubeNome={clube.nome} 
                onClose={() => {}}
                embedded={true}
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

        {activeTab === 'ranking' && (
          <div className="detalhes-ranking">
            <div className="detalhes-card">
              <div className="detalhes-ranking-header">
                <h3><i className="fas fa-trophy"></i> Ranking do Clube</h3>
                <div className="detalhes-ranking-info">
                  <span>Atualizado em: {lastUpdate || 'Carregando...'}</span>
                  <button className="detalhes-btn-atualizar" onClick={atualizarRanking}>
                    <i className="fas fa-sync-alt"></i> Atualizar
                  </button>
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
              
              <div className="detalhes-ranking-footer">
                <p><i className="fas fa-info-circle"></i> Ranking atualizado automaticamente a cada 7 dias baseado na quilometragem total dos eventos.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Nova Postagem - DESIGN ATUALIZADO */}
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
                  {/* Foto 1 */}
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
                  
                  {/* Foto 2 */}
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

      <Footer />
    </>
  );
}

export default ClubeDetalhes;