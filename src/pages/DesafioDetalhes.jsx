import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';
import { buscarDesafios } from '../services/desafiosService';
import { completarDesafio } from '../services/desafiosCompletadosService';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import './DesafioDetalhes.css';

function DesafioDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  
  const [desafio, setDesafio] = useState(null);
  const [participando, setParticipando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [participantes, setParticipantes] = useState(0);
  const [desafioCompletado, setDesafioCompletado] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    carregarDesafio();
  }, [id, isAuthenticated, navigate, user]);

  const carregarDesafio = async () => {
    setCarregando(true);
    
    // Buscar todos os desafios
    const todosDesafios = await buscarDesafios();
    
    // Se for o desafio FORZA (id = 'forza_10min_10dias' ou encontrar pelo nome)
    let desafioEncontrado;
    if (id === 'forza_10min_10dias') {
      desafioEncontrado = todosDesafios.find(d => d.titulo === 'Forza 10min x 10 dias');
    } else {
      desafioEncontrado = todosDesafios.find(d => d.id === id);
    }
    
    setDesafio(desafioEncontrado);
    
    // Verificar se está participando
    const saved = localStorage.getItem('forza_desafios_participados');
    if (saved) {
      const participados = JSON.parse(saved);
      const estaParticipando = participados.includes(id) || (id === 'forza_10min_10dias' && participados.includes('forza_10min_10dias'));
      setParticipando(estaParticipando);
    }
    
    // Verificar se já completou o desafio
    if (user && desafioEncontrado) {
      const { data } = await supabase
        .from('desafios_completados')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('desafio_id', desafioEncontrado.id)
        .single();
      
      setDesafioCompletado(!!data);
    }
    
    // Contar quantas pessoas completaram este desafio
    if (desafioEncontrado) {
      const { count } = await supabase
        .from('desafios_completados')
        .select('id', { count: 'exact', head: true })
        .eq('desafio_id', desafioEncontrado.id);
      
      setParticipantes(count || 0);
    }
    
    setCarregando(false);
  };

  const handleParticipar = async () => {
    if (participando) {
      addNotification('Desafio', 'Você já está participando deste desafio!', 'warning');
      return;
    }
    
    const desafioId = desafio?.id;
    const desafioTitulo = desafio?.titulo || 'Forza 10min x 10 dias';
    
    const confirmed = await window.confirm(`Deseja participar do desafio "${desafioTitulo}"?\n\nComplete a meta e ganhe sua medalha!`);
    
    if (confirmed) {
      const saved = localStorage.getItem('forza_desafios_participados');
      const participados = saved ? JSON.parse(saved) : [];
      participados.push(desafioId);
      localStorage.setItem('forza_desafios_participados', JSON.stringify(participados));
      setParticipando(true);
      addNotification('Desafio iniciado!', `Você começou o desafio "${desafioTitulo}". Complete a meta e ganhe sua medalha!`, 'success');
    }
  };

  const handleCompletarDesafio = async () => {
    if (!user) {
      addNotification('Erro', 'Faça login para completar desafios!', 'error');
      return;
    }

    if (desafioCompletado) {
      addNotification('Aviso', 'Você já completou este desafio!', 'warning');
      return;
    }

    const confirmed = await window.confirm(`Você completou o desafio "${desafio?.titulo}"?\n\nConfirme para ganhar sua medalha!`);
    
    if (confirmed) {
      const resultado = await completarDesafio(user.id, desafio.id, desafio.medalhaImg, desafio.titulo);
      
      if (resultado.success) {
        setDesafioCompletado(true);
        setParticipantes(prev => prev + 1);
        addNotification('Parabéns!', `Você completou o desafio "${desafio?.titulo}"! Medalha adicionada ao seu perfil!`, 'success');
      } else {
        addNotification('Aviso', resultado.message || 'Erro ao completar desafio', 'warning');
      }
    }
  };

  const handleConvidarAmigos = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    addNotification('Link copiado!', 'Compartilhe o desafio com seus amigos!', 'success');
  };

  const handleIngressarClube = () => {
    addNotification('Clube', 'Você ingressou no FORZA CLUB!', 'success');
    setTimeout(() => navigate('/clubes'), 1500);
  };

  if (carregando) {
    return (
      <>
        <Header />
        <div className="detalhes-page" style={{ textAlign: 'center', padding: '100px' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#ff1e2d' }}></i>
          <p>Carregando desafio...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!desafio) {
    return (
      <>
        <Header />
        <div className="detalhes-page" style={{ textAlign: 'center', padding: '100px' }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ff1e2d' }}></i>
          <p>Desafio não encontrado!</p>
          <button onClick={() => navigate('/desafios')} style={{ marginTop: '20px', padding: '10px 20px', background: '#ff1e2d', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer' }}>
            Voltar para desafios
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className="detalhes-page">
        <div className="detalhes-banner">
          <img src={desafio.bgImage || "/img/desafios.png"} alt={desafio.titulo} className="detalhes-banner-img" />
        </div>

        <div className="detalhes-card-principal">
          <div className="detalhes-medalha">
            <img src={desafio.medalhaImg || "/img/default-medal.png"} alt="Medalha" />
          </div>

          <div className="detalhes-top">
            <div className="detalhes-info">
              <h1>
                Desafio: <strong>{desafio.titulo}</strong>
              </h1>
              <p className="detalhes-sub">
                {desafio.descricao}
              </p>
              <div className="detalhes-lista">
                <div className="detalhes-item">
                  <i className="fa-regular fa-calendar"></i>
                  <span>{desafio.data}</span>
                </div>
                <div className="detalhes-item">
                  <i className="fa-solid fa-chart-line"></i>
                  <span>{desafio.descricao}</span>
                </div>
                <div className="detalhes-item">
                  <i className="fa-solid fa-medal"></i>
                  <span>Ganhe uma medalha digital e adicione à sua coleção.</span>
                </div>
              </div>
            </div>

            <div className="detalhes-acoes">
              {!desafioCompletado ? (
                <>
                  {!participando ? (
                    <button 
                      className="detalhes-btn-participar"
                      onClick={handleParticipar}
                    >
                      <i className="fas fa-play"></i>
                      PARTICIPAR DO DESAFIO
                    </button>
                  ) : (
                    <button 
                      className="detalhes-btn-participar participando"
                      onClick={handleCompletarDesafio}
                    >
                      <i className="fas fa-check-circle"></i>
                      COMPLETAR DESAFIO
                    </button>
                  )}
                </>
              ) : (
                <button className="detalhes-btn-completado" disabled>
                  <i className="fas fa-trophy"></i>
                  DESAFIO COMPLETADO! 🏆
                </button>
              )}
              <button className="detalhes-btn-convidar" onClick={handleConvidarAmigos}>
                <i className="fas fa-user-plus"></i> Convidar amigos
              </button>
              <p className="detalhes-participantes">
                Pessoas que completaram<br /><strong>{participantes.toLocaleString()}</strong>
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
                Desafie-se todos os dias e mantenha-se em movimento. Complete 10 minutos de atividade por 10 dias — 
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