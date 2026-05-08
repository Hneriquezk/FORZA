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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: ''
  });

  const faqs = [
    {
      pergunta: "Como registro uma nova atividade?",
      resposta: "Para registrar uma nova atividade, clique no ícone '+' no canto superior direito da tela ou acesse a seção 'Treinamento' e selecione o tipo de atividade desejada. Preencha os dados como distância, tempo e data, e clique em 'Salvar'.",
      categoria: "atividades"
    },
    {
      pergunta: "Como funciona o sistema de recompensas?",
      resposta: "O sistema de recompensas é baseado em pontos conquistados ao completar atividades, desafios e metas. Cada atividade registrada gera pontos que podem ser trocados por benefícios exclusivos na plataforma.",
      categoria: "atividades"
    },
    {
      pergunta: "Como entro em um clube?",
      resposta: "Acesse a seção 'Clubes' na barra de navegação. Você pode buscar clubes por nome, modalidade ou localização. Clique em 'Entrar' no clube desejado. Clubes públicos são de entrada imediata; clubes privados aguardam aprovação do administrador.",
      categoria: "clubes"
    },
    {
      pergunta: "Posso conectar meu relógio esportivo?",
      resposta: "Sim! A Forza é compatível com Garmin, Apple Watch, Polar, Suunto e Fitbit. Acesse 'Conta > Dispositivos Conectados' e siga as instruções para vincular seu wearable.",
      categoria: "conta"
    },
    {
      pergunta: "Como altero meu plano de treino?",
      resposta: "Vá até a seção 'Treinamento', selecione 'Meu Plano' e clique em 'Editar Plano'. Você pode ajustar frequência semanal, objetivos, modalidades e nível de intensidade.",
      categoria: "treinamento"
    },
    {
      pergunta: "Meus dados estão seguros?",
      resposta: "Sim, a segurança dos seus dados é nossa prioridade. Utilizamos criptografia de ponta a ponta, autenticação em dois fatores e seguimos rigorosamente a LGPD.",
      categoria: "conta"
    }
  ];

  const categorias = [
    { id: "atividades", nome: "Atividades", descricao: "Registro e histórico", icone: "fa-bolt" },
    { id: "clubes", nome: "Clubes", descricao: "Participação e gestão", icone: "fa-users" },
    { id: "conta", nome: "Conta", descricao: "Segurança e privacidade", icone: "fa-user-shield" },
    { id: "treinamento", nome: "Treinamento", descricao: "Planos e coaching", icone: "fa-dumbbell" }
  ];

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
      addNotification('Campos vazios', 'Preencha todos os campos obrigatórios!', 'warning', 'fa-exclamation-circle');
      return;
    }
    
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      addNotification('E-mail inválido', 'Digite um e-mail válido!', 'warning', 'fa-envelope');
      return;
    }
    
    addNotification('Mensagem enviada!', `Responderemos em breve no e-mail: ${formData.email}`, 'success', 'fa-paper-plane');
    setFormData({ nome: '', email: '', assunto: '', mensagem: '' });
  };

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.pergunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.resposta.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todas' || faq.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

        {/* Categorias */}
        <div className="sobre-categorias">
          <div className="sobre-categorias-grid">
            {categorias.map(cat => (
              <div 
                key={cat.id} 
                className={`sobre-categoria-card ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'todas' : cat.id)}
              >
                <div className="sobre-categoria-icon">
                  <i className={`fas ${cat.icone}`}></i>
                </div>
                <h4>{cat.nome}</h4>
                <p>{cat.descricao}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="sobre-faq-section">
          <h2>Perguntas Frequentes</h2>
          
          <div className="sobre-faq-busca">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Buscar perguntas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="sobre-faq-lista">
            {filteredFaqs.length === 0 ? (
              <div className="sobre-faq-empty">
                <i className="fas fa-inbox"></i>
                <p>Nenhuma pergunta encontrada.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <div key={index} className={`sobre-faq-item ${faqOpen === index ? 'open' : ''}`}>
                  <div className="sobre-faq-pergunta" onClick={() => toggleFaq(index)}>
                    <span>{faq.pergunta}</span>
                    <i className={`fas fa-chevron-${faqOpen === index ? 'up' : 'down'}`}></i>
                  </div>
                  {faqOpen === index && (
                    <div className="sobre-faq-resposta">
                      {faq.resposta}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contato Section */}
        <div className="sobre-contato-section">
          <div className="sobre-contato-form">
            <h3><i className="fas fa-paper-plane"></i> Envie sua mensagem</h3>
            <p>Nossa equipe responde em até 24 horas úteis.</p>
            
            <form onSubmit={handleSubmit}>
              <input type="text" name="nome" placeholder="Seu nome" value={formData.nome} onChange={handleInputChange} className="sobre-input" />
              <input type="email" name="email" placeholder="Seu e-mail" value={formData.email} onChange={handleInputChange} className="sobre-input" />
              <input type="text" name="assunto" placeholder="Assunto" value={formData.assunto} onChange={handleInputChange} className="sobre-input" />
              <textarea name="mensagem" placeholder="Descreva sua dúvida ou problema" rows="4" value={formData.mensagem} onChange={handleInputChange} className="sobre-textarea"></textarea>
              <button type="submit" className="sobre-btn-enviar">
                <i className="fas fa-paper-plane"></i> Enviar Mensagem
              </button>
            </form>
          </div>

          <div className="sobre-canais-card">
            <h3><i className="fas fa-headset"></i> Canais de Atendimento</h3>
            <p>Escolha a melhor forma para falar conosco</p>
            
            <div className="sobre-canal-item">
              <div className="sobre-canal-icon chat">
                <i className="fa-regular fa-comment-dots"></i>
              </div>
              <div className="sobre-canal-info">
                <h4>Chat ao vivo</h4>
                <p>Seg–Sex, 9h–19h</p>
              </div>
              <button className="sobre-canal-btn" onClick={() => addNotification('Chat', 'Chat em breve disponível!', 'info', 'fa-comment')}>
               <a href="https://wa.me/5512997291076? text=Olá,%20Boa%20tarde%20gostaria%20de%20retirar%20algumas%20dúvidas!" target="_blank" rel="noopener noreferrer" className="sobre-canal-btn">Iniciar chat →</a>
              </button>
            </div>

            <div className="sobre-canal-item">
              <div className="sobre-canal-icon email">
                <i className="fa-regular fa-envelope"></i>
              </div>
              <div className="sobre-canal-info">
                <h4>E-mail</h4>
                <p>suporte@forza.com</p>
              </div>
              <a href="mailto:suporte@forza.com" className="sobre-canal-btn">
                Enviar e-mail →
              </a>
            </div>

            <div className="sobre-canal-item">
              <div className="sobre-canal-icon phone">
                <i className="fa-solid fa-phone"></i>
              </div>
              <div className="sobre-canal-info">
                <h4>Telefone</h4>
                <p>(12) 99729-1076</p>
              </div>
              <a href="tel:+5512997291076" className="sobre-canal-btn">
                Ligar agora →
              </a>
            </div>

            <div className="sobre-canal-item">
              <div className="sobre-canal-icon youtube">
                <i className="fa-brands fa-youtube"></i>
              </div>
              <div className="sobre-canal-info">
                <h4>Tutoriais em vídeo</h4>
                <p>Aprenda com guias visuais passo a passo.</p>
              </div>
              <a href="https://www.youtube.com/@FORZAOG" target="_blank" rel="noreferrer" className="sobre-canal-btn">
                Assistir →
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Sobre;