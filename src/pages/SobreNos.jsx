import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import './SobreNos.css';

function SobreNos() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);

  // Dados das notificações
  const notificacoesData = [
    {
      id: 1,
      usuario: "Henrique Santos",
      avatar: "/img/usuarios/avatar_henrique.png",
      mensagem: "curtiu sua atividade",
      lida: false,
      tempo: "5 min atrás"
    },
    {
      id: 2,
      usuario: "Giovanni Borsoli",
      avatar: "/img/usuarios/avatar_giovanni.png",
      mensagem: "comentou no seu post: 'Mandou bem!'",
      lida: false,
      tempo: "15 min atrás"
    },
    {
      id: 3,
      usuario: "Gabriel Bastos",
      avatar: "/img/usuarios/avatar_bastos.png",
      mensagem: "começou a seguir você",
      lida: false,
      tempo: "1 hora atrás"
    },
    {
      id: 4,
      usuario: "Sistema",
      avatar: "/img/logo-icon.png",
      mensagem: "Novo desafio disponível: Corrida de 10km",
      lida: true,
      tempo: "2 horas atrás"
    },
    {
      id: 5,
      usuario: "Nino Schurter",
      avatar: "/img/usuarios/avatar_nino.png",
      mensagem: "curtiu sua atividade",
      lida: true,
      tempo: "1 dia atrás"
    }
  ];

  useEffect(() => {
    setNotificacoes(notificacoesData);
    const naoLidas = notificacoesData.filter(n => !n.lida).length;
    setNotificacoesNaoLidas(naoLidas);
    setLoading(false);
  }, []);

  const marcarNotificacaoComoLida = (id) => {
    setNotificacoes(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, lida: true } : notif
      )
    );
    const novasNotificacoes = notificacoes.map(notif =>
      notif.id === id ? { ...notif, lida: true } : notif
    );
    const naoLidas = novasNotificacoes.filter(n => !n.lida).length;
    setNotificacoesNaoLidas(naoLidas);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="sobre-loading">
          <div className="sobre-loading-spinner"></div>
          <p>Carregando...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      {/* Overlay para fechar notificações */}
      <div className={`overlay ${notificacoesAbertas ? 'ativo' : ''}`} onClick={() => setNotificacoesAbertas(false)}></div>

      {/* Painel de Notificações */}
      <div className={`notificacoes-panel ${notificacoesAbertas ? 'aberto' : ''}`}>
        <div className="notificacoes-header">
          <h2>Notificações</h2>
          <button onClick={() => setNotificacoesAbertas(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="notificacoes-lista">
          {notificacoes.map(notif => (
            <div 
              key={notif.id} 
              className={`notificacao-item ${!notif.lida ? 'nao-lida' : ''}`}
              onClick={() => marcarNotificacaoComoLida(notif.id)}
            >
              <div className="notificacao-avatar">
                <img src={notif.avatar} alt={notif.usuario} />
              </div>
              <div className="notificacao-conteudo">
                <p><strong>{notif.usuario}</strong> {notif.mensagem}</p>
                <small>{notif.tempo}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner */}
      <section className="sobre-banner">
        <img src="/img/desafios/desafios.png" alt="Sobre Forza" />
      </section>

      {/* Sobre */}
      <section className="sobre-section">
        <h2>Transformando <span>esforço</span><br /> em evolução</h2>

        <p className="descricao">
          A FORZA nasceu da paixão pelo esporte e da vontade de criar a melhor plataforma
          de treinos do mundo. Unimos tecnologia, comunidade e gamificação para que cada
          passo, pedalada ou braçada conte.
        </p>

        {/* Stats */}
        <div className="stats">
          <div className="sobre-stat">
            <h3>50K+</h3>
            <p>Atletas Ativos</p>
          </div>
          <div className="sobre-stat">
            <h3>1.2M</h3>
            <p>Atividades Registradas</p>
          </div>
          <div className="sobre-stat">
            <h3>320+</h3>
            <p>Clubes Criados</p>
          </div>
          <div className="sobre-stat">
            <h3>98%</h3>
            <p>Satisfação</p>
          </div>
        </div>

        {/* Missão */}
        <div className="missao-area">
          <div className="missao-texto">
            <h3 className="valores-titulo">Nossa Missão</h3>
            <p>
              Democratizar o acesso a ferramentas de treino e criar uma comunidade
              onde cada atleta — do iniciante ao profissional — se sinta motivado a
              superar seus limites.
            </p>
            <p>
              Acreditamos que a tecnologia deve servir ao esporte, não o contrário.
              Por isso, desenvolvemos uma plataforma intuitiva que se adapta ao seu
              ritmo e objetivos.
            </p>
          </div>

          {/* Vídeo local */}
          <div className="missao-video">
            <video
              width="100%"
              height="auto"
              controls
              autoPlay
              muted
              poster="/img/video-thumbnail.jpg"
            >
              <source src="/videos/FORZA.mp4" type="video/mp4" />
              Seu navegador não suporta vídeos HTML5.
            </video>
          </div>
        </div>

        {/* Valores */}
        <h3 className="valores-titulo">Nossos Valores</h3>
        <br />
        <div className="valores">
          <div className="valor">
            <i className="fa-solid fa-bullseye"></i>
            <h4>Foco em Resultados</h4>
            <p>Cada funcionalidade é pensada para impulsionar seu desempenho e ajudar a bater recordes pessoais.</p>
          </div>
          <div className="valor">
            <i className="fa-solid fa-users"></i>
            <h4>Comunidade Forte</h4>
            <p>Conectamos atletas de todos os níveis em clubes e desafios colaborativos.</p>
          </div>
          <div className="valor">
            <i className="fa-solid fa-trophy"></i>
            <h4>Gamificação Real</h4>
            <p>Recompensas, conquistas e desafios que transformam treino em experiência.</p>
          </div>
          <div className="valor">
            <i className="fa-solid fa-heart-pulse"></i>
            <h4>Saúde em Primeiro Lugar</h4>
            <p>Monitoramos métricas essenciais para que você treine com segurança e inteligência.</p>
          </div>
          <div className="valor">
            <i className="fa-solid fa-microchip"></i>
            <h4>Tecnologia de Ponta</h4>
            <p>IA integrada, mapas interativos e análises detalhadas para otimizar cada sessão.</p>
          </div>
          <div className="valor">
            <i className="fa-solid fa-globe"></i>
            <h4>Para Todos os Esportes</h4>
            <p>Corrida, ciclismo, natação, caminhada e qualquer modalidade em uma única plataforma.</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default SobreNos;