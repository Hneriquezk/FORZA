import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import './DesafioDetalhes.css';

function DesafioDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const [participando, setParticipando] = useState(false);
  const [participantes, setParticipantes] = useState(100367);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const saved = localStorage.getItem('forza_desafios_participados');
    if (saved) {
      const participados = JSON.parse(saved);
      setParticipando(participados.includes('forza_10min_10dias'));
    }
  }, [isAuthenticated, navigate]);

  const handleParticipar = async () => {
    if (participando) {
      addNotification('Desafio', 'Você já está participando deste desafio!', 'warning', 'fa-exclamation-circle');
      return;
    }
    
    const confirmed = await window.confirm('Deseja participar do desafio "10 minutos por 10 dias"?\n\nComplete 10 minutos de atividade por 10 dias e ganhe uma medalha exclusiva!');
    
    if (confirmed) {
      const saved = localStorage.getItem('forza_desafios_participados');
      const participados = saved ? JSON.parse(saved) : [];
      participados.push('forza_10min_10dias');
      localStorage.setItem('forza_desafios_participados', JSON.stringify(participados));
      setParticipando(true);
      setParticipantes(prev => prev + 1);
      addNotification('Desafio iniciado!', 'Você começou o desafio "10 minutos por 10 dias". Complete a meta e ganhe sua medalha!', 'success', 'fa-trophy');
    }
  };

  const handleConvidarAmigos = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    addNotification('Link copiado!', 'Compartilhe o desafio com seus amigos!', 'success', 'fa-share');
  };

  const handleIngressarClube = () => {
    addNotification('Clube', 'Você ingressou no FORZA CLUB!', 'success', 'fa-users');
    setTimeout(() => navigate('/clubes'), 1500);
  };

  return (
    <>
      <Header />
      
      <div className="detalhes-page">
        {/* Banner */}
        <div className="detalhes-banner">
          <img src="/img/desafios.png" alt="Desafio Forza" className="detalhes-banner-img" />
        </div>

        {/* Card Principal */}
        <div className="detalhes-card-principal">
          <div className="detalhes-medalha">
            <img src="/img/desafios/10min_desafio.png" alt="Medalha" />
          </div>

          <div className="detalhes-top">
            <div className="detalhes-info">
              <h1>
                Desafio de Março: <strong>Faça 10 minutos de atividade por 10 dias.</strong>
              </h1>
              <p className="detalhes-sub">
                Faça 10 minutos de atividade por 10 dias. Ganhe uma medalha digital de finalização para a sua Coleção de Desafios Completos.
              </p>
              <div className="detalhes-lista">
                <div className="detalhes-item">
                  <i className="fa-regular fa-calendar"></i>
                  <span>1 de mar. de 2026 a 31 de mar. de 2026</span>
                </div>
                <div className="detalhes-item">
                  <i className="fa-solid fa-chart-line"></i>
                  <span>Faça 10 minutos de atividade por 10 dias em março. Todas as atividades contam! Corrida, Ciclismo e natação</span>
                </div>
                <div className="detalhes-item">
                  <i className="fa-solid fa-medal"></i>
                  <span>Ganhe uma medalha digital de conclusão e adicione à sua coleção.</span>
                </div>
              </div>
            </div>

            <div className="detalhes-acoes">
              <button 
                className={`detalhes-btn-participar ${participando ? 'participando' : ''}`}
                onClick={handleParticipar}
                disabled={participando}
              >
                <i className={`fas ${participando ? 'fa-check-circle' : 'fa-play'}`}></i>
                {participando ? 'Participando' : 'Participar do desafio'}
              </button>
              <button className="detalhes-btn-convidar" onClick={handleConvidarAmigos}>
                <i className="fas fa-user-plus"></i> Convidar amigos
              </button>
              <p className="detalhes-participantes">
                Participantes<br /><strong>{participantes.toLocaleString()}</strong>
              </p>
              <div className="detalhes-clube-organizador">
                <p className="detalhes-org">CLUBE ORGANIZADOR</p>
                <div className="detalhes-clube">
                  <img src="/img/forza icon.png" alt="Forza Club" />
                  <span>FORZA CLUB</span>
                </div>
                <button className="detalhes-btn-clube" onClick={handleIngressarClube}>
                  Ingressar no Clube
                </button>
              </div>
            </div>
          </div>

          <div className="detalhes-conteudo">
            <div className="detalhes-visao">
              <h3><i className="fas fa-eye"></i> Visão geral</h3>
              <p>
                Desafie-se todos os dias e mantenha-se em movimento. Complete 10 minutos de atividade por 10 dias em março — 
                seja em sessões curtas ou nas suas rotinas diárias. Correr, caminhar, pedalar, nadar ou qualquer outra atividade 
                que eleve seus batimentos cardíacos conta!
              </p>
            </div>
            <div className="detalhes-qualificacao">
              <h3><i className="fas fa-info-circle"></i> Detalhes e qualificação</h3>
              
              <p><strong>Recompensas</strong></p>
              <p>
                Todos os atletas que completarem o desafio receberão uma medalha digital de finalização para adicionar à sua 
                coleção de conquistas.
              </p>
              
              <p><strong>Informações adicionais</strong></p>
              <p>
                Este desafio começa e termina de acordo com o fuso horário local de cada participante. Você pode registrar suas 
                atividades manualmente ou sincronizar com seu dispositivo wearable.
              </p>
              
              <p><strong>Regras</strong></p>
              <p>
                Esperamos que todos os atletas respeitem as diretrizes da comunidade Forza e pratiquem atividades físicas com 
                responsabilidade. Apenas atividades registradas durante o período do desafio serão consideradas.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default DesafioDetalhes;