import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import './Sobre.css';

function Sobre() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: ''
  });

  const faqs = [
    {
      pergunta: "Como registro uma nova atividade?",
      resposta: "Para registrar uma nova atividade, clique no ícone '+' no canto superior direito da tela ou acesse a seção 'Treinamento' e selecione o tipo de atividade desejada. Preencha os dados como distância, tempo e data, e clique em 'Salvar'."
    },
    {
      pergunta: "Como funciona o sistema de recompensas?",
      resposta: "O sistema de recompensas é baseado em pontos conquistados ao completar atividades, desafios e metas. Cada atividade registrada gera pontos que podem ser trocados por benefícios exclusivos na plataforma."
    },
    {
      pergunta: "Como entro em um clube?",
      resposta: "Acesse a seção 'Clubes' na barra de navegação. Você pode buscar clubes por nome, modalidade ou localização. Clique em 'Entrar' no clube desejado. Clubes públicos são de entrada imediata; clubes privados aguardam aprovação do administrador."
    },
    {
      pergunta: "Posso conectar meu relógio esportivo?",
      resposta: "Sim! A Forza é compatível com Garmin, Apple Watch, Polar, Suunto e Fitbit. Acesse 'Conta > Dispositivos Conectados' e siga as instruções para vincular seu wearable."
    },
    {
      pergunta: "Como altero meu plano de treino?",
      resposta: "Vá até a seção 'Treinamento', selecione 'Meu Plano' e clique em 'Editar Plano'. Você pode ajustar frequência semanal, objetivos, modalidades e nível de intensidade."
    },
    {
      pergunta: "Meus dados estão seguros?",
      resposta: "Sim, a segurança dos seus dados é nossa prioridade. Utilizamos criptografia de ponta a ponta, autenticação em dois fatores e seguimos rigorosamente a LGPD."
    }
  ];

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setLoading(false);
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.mensagem) {
      addNotification('⚠️ Campos vazios', 'Preencha todos os campos obrigatórios!', 'warning', 'fa-exclamation-circle');
      return;
    }
    
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      addNotification('📧 E-mail inválido', 'Digite um e-mail válido!', 'warning', 'fa-envelope');
      return;
    }
    
    addNotification('✅ Mensagem enviada!', `Responderemos em breve no e-mail: ${formData.email}`, 'success', 'fa-paper-plane');
    
    setFormData({ nome: '', email: '', assunto: '', mensagem: '' });
  };

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
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
      
      <div className="sobre-container">
        {/* Hero Section */}
        <div className="sobre-hero">
          <div className="sobre-hero-badge">
            <i className="fa-solid fa-headset"></i> Central de Suporte
          </div>
          <h1>Como podemos ajudar?</h1>
          <p>Encontre respostas rápidas, explore nossa base de conhecimento ou entre em contato com nossa equipe.</p>
        </div>

        {/* FAQ Section */}
        <div className="sobre-faq-section">
          <h2>Perguntas Frequentes</h2>
          
          <div className="sobre-faq-lista">
            {faqs.map((faq, index) => (
              <div key={index} className={`sobre-faq-item ${faqOpen === index ? 'open' : ''}`}>
                <div 
                  className="sobre-faq-pergunta"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.pergunta}</span>
                  <i className={`fas fa-chevron-${faqOpen === index ? 'up' : 'down'}`}></i>
                </div>
                {faqOpen === index && (
                  <div className="sobre-faq-resposta">
                    {faq.resposta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contato Section */}
        <div className="sobre-contato-section">
          {/* Formulário de Contato */}
          <div className="sobre-contato-form">
            <h3>
              <i className="fas fa-paper-plane"></i> Envie sua mensagem
            </h3>
            <p>Nossa equipe responde em até 24 horas úteis.</p>
            
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="nome"
                placeholder="Seu nome"
                value={formData.nome}
                onChange={handleInputChange}
                className="sobre-input"
              />
              <input
                type="email"
                name="email"
                placeholder="Seu e-mail"
                value={formData.email}
                onChange={handleInputChange}
                className="sobre-input"
              />
              <input
                type="text"
                name="assunto"
                placeholder="Assunto"
                value={formData.assunto}
                onChange={handleInputChange}
                className="sobre-input"
              />
              <textarea
                name="mensagem"
                placeholder="Sua mensagem"
                rows="4"
                value={formData.mensagem}
                onChange={handleInputChange}
                className="sobre-textarea"
              ></textarea>
              <button type="submit" className="sobre-btn-enviar">
                <i className="fas fa-paper-plane"></i> Enviar Mensagem
              </button>
            </form>
          </div>

          {/* Canais de Atendimento */}
          <div className="sobre-canais-card">
            <h3>
              <i className="fas fa-headset"></i> Canais de Atendimento
            </h3>
            <p>Escolha a melhor forma para falar conosco</p>
            
            {/* Chat */}
            <div className="sobre-canal-item">
              <div className="sobre-canal-icon chat">
                <i className="fa-regular fa-comment-dots"></i>
              </div>
              <div className="sobre-canal-info">
                <h4>Chat ao vivo</h4>
                <p>Seg–Sex, 9h–19h</p>
              </div>
              <button className="sobre-canal-btn" onClick={() => addNotification('💬 Chat', 'Chat em breve disponível!', 'info', 'fa-comment')}>
                Iniciar →
              </button>
            </div>

            {/* E-mail */}
            <div className="sobre-canal-item">
              <div className="sobre-canal-icon email">
                <i className="fa-regular fa-envelope"></i>
              </div>
              <div className="sobre-canal-info">
                <h4>E-mail</h4>
                <p>suporte@forza.com</p>
              </div>
              <a href="mailto:suporte@forza.com" className="sobre-canal-btn">
                Enviar →
              </a>
            </div>

            {/* Telefone */}
            <div className="sobre-canal-item">
              <div className="sobre-canal-icon phone">
                <i className="fa-solid fa-phone"></i>
              </div>
              <div className="sobre-canal-info">
                <h4>Telefone</h4>
                <p>(12) 99729-1076</p>
              </div>
              <a href="tel:+5512997291076" className="sobre-canal-btn">
                Ligar →
              </a>
            </div>

            {/* YouTube */}
            <div className="sobre-canal-item">
              <div className="sobre-canal-icon youtube">
                <i className="fa-brands fa-youtube"></i>
              </div>
              <div className="sobre-canal-info">
                <h4>Tutoriais em vídeo</h4>
                <p>Aprenda com guias visuais</p>
              </div>
              <a href="https://www.youtube.com/@FORZAOG" target="_blank" rel="noreferrer" className="sobre-canal-btn">
                Assistir →
              </a>
            </div>
          </div>
        </div>

        {/* Valores da Empresa */}
        <div className="sobre-valores">
          <h3><i className="fas fa-heart"></i> Nossos Valores</h3>
          <div className="sobre-valores-grid">
            <div className="sobre-valor-item">
              <i className="fas fa-users"></i>
              <h4>Comunidade</h4>
              <p>Juntos somos mais fortes. Construímos uma comunidade que se apoia e evolui junto.</p>
            </div>
            <div className="sobre-valor-item">
              <i className="fas fa-chart-line"></i>
              <h4>Evolução</h4>
              <p>Acreditamos no progresso contínuo, seja pequeno ou grande, cada passo importa.</p>
            </div>
            <div className="sobre-valor-item">
              <i className="fas fa-shield-alt"></i>
              <h4>Segurança</h4>
              <p>Seus dados e sua jornada estão protegidos com a mais alta tecnologia.</p>
            </div>
            <div className="sobre-valor-item">
              <i className="fas fa-star"></i>
              <h4>Excelência</h4>
              <p>Buscamos sempre o melhor para nossos atletas, com qualidade e inovação.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Sobre;