import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationContext'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import ClubeChat from '../components/ClubeChat'

const Clubes = () => {
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [membros, setMembros] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [clubesPersonalizados, setClubesPersonalizados] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('forza_clubes_personalizados')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setClubesPersonalizados(parsed)
      } catch (e) {
        console.error('Erro ao carregar clubes:', e)
      }
    }
  }, [])

  const clubesData = [
    { id: 1, nome: "Corredores de São José dos Campos e Região", tipo: "corrida", membros: 5002, descricao: "Grupo de corrida de São José e região. Treinos diários, desafios semanais.", capa: "/img/clubes/corredores_sjc.jpg", avatar: "/img/clubes/corredores_sjc_avatar.jpg", criadorId: null },
    { id: 2, nome: "NEM PENSA, SÓ VAI", tipo: "corrida", membros: 7606, descricao: "Comunidade para quem não quer pensar, só agir!", capa: "/img/clubes/nem_pensa_so_vai.jpg", avatar: "/img/clubes/nem_pensa_so_vai_avatar.jpg", criadorId: null },
    { id: 3, nome: "Shimano Cycling Team", tipo: "ciclismo", membros: 16237, descricao: "Junte-se a outros atletas Shimano!", capa: "/img/clubes/shimano_cycling.jpg", avatar: "/img/clubes/shimano_cycling_avatar.jpg", criadorId: null },
    { id: 4, nome: "RAPHA500 2026", tipo: "ciclismo", membros: 9211, descricao: "500km em 2026! Desafio anual para ciclistas.", capa: "/img/clubes/rapha500.jpg", avatar: "/img/clubes/rapha500_avatar.jpg", criadorId: null },
    { id: 5, nome: "Tour de France Community", tipo: "ciclismo", membros: 305384, descricao: "Acompanhe as etapas do Tour!", capa: "/img/clubes/tour_france.jpg", avatar: "/img/clubes/tour_france_avatar.jpg", criadorId: null },
    { id: 6, nome: "Forza Runners Elite", tipo: "corrida", membros: 3421, descricao: "Grupo exclusivo para alta performance.", capa: "/img/clubes/forza_runners_elite.jpg", avatar: "/img/clubes/forza_runners_elite_avatar.jpg", criadorId: null },
    { id: 7, nome: "Triathlon Brasil", tipo: "fitness", membros: 12500, descricao: "Comunidade para triatletas.", capa: "/img/clubes/triathlon_brasil.jpg", avatar: "/img/clubes/triathlon_brasil_avatar.jpg", criadorId: null },
    { id: 8, nome: "Maratonas Aquáticas", tipo: "natacao", membros: 3100, descricao: "Para amantes da natação em águas abertas.", capa: "/img/clubes/maratonas_aquaticas.jpg", avatar: "/img/clubes/maratonas_aquaticas_avatar.jpg", criadorId: null },
    { id: 9, nome: "CrossFit Forza Team", tipo: "fitness", membros: 2150, descricao: "Equipe de alta performance no CrossFit.", capa: "/img/clubes/crossfit_forza.jpg", avatar: "/img/clubes/crossfit_forza_avatar.jpg", criadorId: null }
  ]

  // Combinar clubes padrão com personalizados, garantindo que membros seja um número
  let todosClubes = [
    ...clubesData,
    ...clubesPersonalizados.map(clube => ({
      ...clube,
      membros: clube.membrosCount || clube.membros || 1,
      membrosCount: clube.membrosCount || clube.membros || 1,
      tipo: clube.categoria === 'Corrida' ? 'corrida' :
             clube.categoria === 'Ciclismo' ? 'ciclismo' :
             clube.categoria === 'Fitness' ? 'fitness' :
             clube.categoria === 'Natação' ? 'natacao' : 'corrida'
    }))
  ]
  
  // Ordenar: clubes do usuário primeiro
  todosClubes = todosClubes.sort((a, b) => {
    const aIsUserClub = a.criadorId === user?.id
    const bIsUserClub = b.criadorId === user?.id
    if (aIsUserClub && !bIsUserClub) return -1
    if (!aIsUserClub && bIsUserClub) return 1
    return 0
  })

  const clubesParticipantes = todosClubes.filter(clube => membros.includes(clube.id))

  useEffect(() => {
    const saved = localStorage.getItem('forza_clubes_membros')
    if (saved) {
      try {
        setMembros(JSON.parse(saved))
      } catch (e) {
        console.error('Erro ao carregar membros:', e)
      }
    }
  }, [])

  const entrarClube = async (id, nome) => {
    const isMembro = membros.includes(id)
    
    if (isMembro) {
      const confirmed = await window.confirm(`Deseja sair do clube "${nome}"?`)
      if (confirmed) {
        const newMembros = membros.filter(m => m !== id)
        setMembros(newMembros)
        localStorage.setItem('forza_clubes_membros', JSON.stringify(newMembros))
        addNotification('Saiu do clube', `Você saiu do clube "${nome}".`, 'info', 'fa-sign-out-alt')
        if (selectedChat?.id === id) setSelectedChat(null)
      }
    } else {
      const confirmed = await window.confirm(`Deseja entrar no clube "${nome}"?`)
      if (confirmed) {
        const newMembros = [...membros, id]
        setMembros(newMembros)
        localStorage.setItem('forza_clubes_membros', JSON.stringify(newMembros))
        addNotification('Bem-vindo ao clube!', `Você entrou no clube "${nome}".`, 'success', 'fa-check-circle')
      }
    }
  }

  const irParaClube = (clubeId) => {
    navigate(`/clube/${clubeId}`)
  }

  const criarClube = (novoClube) => {
    const novoId = Date.now()
    
    const clubeCompleto = {
      id: novoId,
      nome: novoClube.nome,
      nomeAbreviado: novoClube.nome.length > 20 ? novoClube.nome.substring(0, 20) + "..." : novoClube.nome,
      descricao: novoClube.descricao,
      sobre: novoClube.sobre || novoClube.descricao,
      localizacao: novoClube.localizacao || "Não informado",
      regiao: novoClube.regiao || "Não informado",
      membrosCount: 1,
      membros: 1,
      eventoCount: 0,
      fundacao: new Date().getFullYear().toString(),
      tipo: novoClube.tipo === 'publico' ? "Público" : "Privado",
      categoria: novoClube.categoria === 'corrida' ? "Corrida" : 
                  novoClube.categoria === 'ciclismo' ? "Ciclismo" : 
                  novoClube.categoria === 'fitness' ? "Fitness" : "Natação",
      verificado: false,
      capa: novoClube.capa || "/img/clubes/default_capa.jpg",
      avatar: novoClube.avatar || "/img/clubes/default_avatar.jpg",
      criadorId: user?.id,
      criadorNome: user?.nome,
      horarios: {},
      redes: {
        instagram: novoClube.redesSociais?.instagram || "",
        twitter: novoClube.redesSociais?.twitter || "",
        whatsapp: novoClube.redesSociais?.whatsapp || ""
      },
      valores: {
        mensalidade: "Gratuito",
        adesao: "Gratuita"
      },
      contato: {
        email: user?.email || "",
        telefone: ""
      }
    }
    
    if (novoClube.horariosTreino && novoClube.horariosTreino.length > 0) {
      novoClube.horariosTreino.forEach(horario => {
        if (horario.dia && horario.horario) {
          const diaKey = horario.dia.toLowerCase()
          clubeCompleto.horarios[diaKey] = `${horario.horario} - ${horario.local || 'Local a definir'}`
        }
      })
    }
    
    const savedPersonalizados = localStorage.getItem('forza_clubes_personalizados')
    const personalizados = savedPersonalizados ? JSON.parse(savedPersonalizados) : []
    personalizados.push(clubeCompleto)
    localStorage.setItem('forza_clubes_personalizados', JSON.stringify(personalizados))
    
    const savedMembros = localStorage.getItem('forza_clubes_membros')
    const membrosGlobal = savedMembros ? JSON.parse(savedMembros) : []
    if (!membrosGlobal.includes(novoId)) {
      membrosGlobal.push(novoId)
      localStorage.setItem('forza_clubes_membros', JSON.stringify(membrosGlobal))
    }
    
    const membrosDoClube = [
      {
        id: user?.id || Date.now(),
        nome: user?.nome || "Administrador",
        avatar: user?.avatar || "/img/usuarios/default.jpg",
        cargo: "Administrador",
        atividades: 0,
        dataEntrada: new Date().toISOString()
      }
    ]
    localStorage.setItem(`clube_membros_${novoId}`, JSON.stringify(membrosDoClube))
    
    const postagemInicial = [
      {
        id: Date.now(),
        usuario: user?.nome || "Administrador",
        avatar: user?.avatar || "/img/usuarios/default.jpg",
        mensagem: `🎉 Bem-vindos ao ${novoClube.nome}! Estamos muito felizes em ter vocês aqui. Vamos juntos alcançar nossos objetivos!`,
        imagem1: null,
        imagem2: null,
        curtidas: 0,
        comentarios: [],
        data: new Date().toISOString(),
        curtido: false
      }
    ]
    localStorage.setItem(`clube_posts_${novoId}`, JSON.stringify(postagemInicial))
    
    addNotification('Clube criado!', `Seu clube "${novoClube.nome}" foi criado com sucesso.`, 'success', 'fa-check-circle')
    setShowCreateModal(false)
    navigate(`/clube/${novoId}`)
  }

  const filteredClubes = todosClubes.filter(clube => {
    const matchCategory = activeCategory === 'todos' || clube.tipo === activeCategory
    const matchSearch = clube.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (clube.descricao && clube.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchCategory && matchSearch
  })

  const getTipoNome = (tipo) => {
    const tipos = { 
      corrida: 'Corrida', 
      ciclismo: 'Ciclismo', 
      fitness: 'Fitness', 
      natacao: 'Natação',
      Corrida: 'Corrida',
      Ciclismo: 'Ciclismo',
      Fitness: 'Fitness',
      Natação: 'Natação'
    }
    return tipos[tipo] || tipo
  }

  const getTipoIcone = (tipo) => {
    const icones = { 
      corrida: 'fa-running', 
      ciclismo: 'fa-bicycle', 
      fitness: 'fa-dumbbell', 
      natacao: 'fa-water',
      Corrida: 'fa-running',
      Ciclismo: 'fa-bicycle', 
      Fitness: 'fa-dumbbell', 
      Natação: 'fa-water'
    }
    return icones[tipo] || 'fa-users'
  }

  const formatarMembros = (membrosCount) => {
    if (!membrosCount && membrosCount !== 0) return '1'
    return membrosCount.toLocaleString()
  }

  return (
    <>
      <Header />
      
      <div className="container">
        <div className="clubes-hero">
          <div className="hero-content">
            <h1>Clubes</h1>
            <p>Encontre grupos de pessoas com os mesmos objetivos que você. Treine junto, compartilhe experiências e evolua!</p>
          </div>
        </div>

        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Pesquise clube por nome, tipo ou localização..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="categoria-tabs">
          <button className={`categoria-btn ${activeCategory === 'todos' ? 'active' : ''}`} onClick={() => setActiveCategory('todos')}>
            <i className="fas fa-globe"></i> Todos
          </button>
          <button className={`categoria-btn ${activeCategory === 'corrida' ? 'active' : ''}`} onClick={() => setActiveCategory('corrida')}>
            <i className="fas fa-running"></i> Corrida
          </button>
          <button className={`categoria-btn ${activeCategory === 'ciclismo' ? 'active' : ''}`} onClick={() => setActiveCategory('ciclismo')}>
            <i className="fas fa-bicycle"></i> Ciclismo
          </button>
          <button className={`categoria-btn ${activeCategory === 'fitness' ? 'active' : ''}`} onClick={() => setActiveCategory('fitness')}>
            <i className="fas fa-dumbbell"></i> Fitness
          </button>
          <button className={`categoria-btn ${activeCategory === 'natacao' ? 'active' : ''}`} onClick={() => setActiveCategory('natacao')}>
            <i className="fas fa-water"></i> Natação
          </button>
        </div>

        <div className="clubes-grid">
          {filteredClubes.map(clube => {
            const isMembro = membros.includes(clube.id)
            const isUserClub = clube.criadorId === user?.id
            const membrosCount = clube.membrosCount || clube.membros || 1
            return (
              <div key={clube.id} className={`clube-card ${isUserClub ? 'user-club' : ''}`} onClick={() => isMembro && irParaClube(clube.id)}>
                {isUserClub && (
                  <div className="user-club-badge">
                    <i className="fas fa-crown"></i> Meu Clube
                  </div>
                )}
                <div className="clube-capa">
                  <img src={clube.capa} alt={clube.nome} onError={(e) => e.target.src = "/img/clubes/default_capa.jpg"} />
                  <div className="clube-avatar-wrapper">
                    <img src={clube.avatar} alt={clube.nome} onError={(e) => e.target.src = "/img/clubes/default_avatar.jpg"} />
                  </div>
                </div>
                <div className="clube-content">
                  <div className="clube-header">
                    <h3>{clube.nome}</h3>
                    <span className="clube-tipo">
                      <i className={`fas ${getTipoIcone(clube.tipo)}`}></i>
                      {getTipoNome(clube.tipo)}
                    </span>
                  </div>
                  <p className="clube-descricao">{clube.descricao || "Sem descrição"}</p>
                  <div className="clube-stats">
                    <div className="stat">
                      <i className="fas fa-users"></i>
                      <strong>{formatarMembros(membrosCount)}</strong> membros
                    </div>
                  </div>
                  {!isMembro ? (
                    <button className="btn-entrar" onClick={(e) => { e.stopPropagation(); entrarClube(clube.id, clube.nome) }}>
                      <i className="fas fa-sign-in-alt"></i> Entrar
                    </button>
                  ) : (
                    <div className="clube-member-actions">
                      <button className="btn-membro" onClick={(e) => { e.stopPropagation(); irParaClube(clube.id) }}>
                        <i className="fas fa-eye"></i> {isUserClub ? 'Administrar' : 'Ver Clube'}
                      </button>
                      <button className="btn-chat" onClick={(e) => { e.stopPropagation(); setSelectedChat({ id: clube.id, nome: clube.nome }) }}>
                        <i className="fas fa-comment-dots"></i> Chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {showCreateModal && (
          <CreateClubeModal 
            onClose={() => setShowCreateModal(false)}
            onCreate={criarClube}
          />
        )}

        {selectedChat && (
          <div className="chat-section">
            <ClubeChat 
              clubeId={selectedChat.id} 
              clubeNome={selectedChat.nome} 
              onClose={() => setSelectedChat(null)}
            />
          </div>
        )}

        {clubesParticipantes.length > 0 && !selectedChat && (
          <div className="chat-selector">
            <h3><i className="fas fa-comments"></i> Conversas dos Clubes</h3>
            <div className="chat-clubes-list">
              {clubesParticipantes.map(clube => (
                <button 
                  key={clube.id} 
                  className="chat-clube-btn"
                  onClick={() => setSelectedChat({ id: clube.id, nome: clube.nome })}
                >
                  <img src={clube.avatar} alt={clube.nome} onError={(e) => e.target.src = "/img/clubes/default_avatar.jpg"} />
                  <div>
                    <strong>{clube.nome}</strong>
                    <span>Clique para conversar</span>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button className="btn-criar-clube-fixed" onClick={() => setShowCreateModal(true)}>
        <i className="fas fa-plus-circle"></i>
        <span>Criar Clube</span>
      </button>

      <Footer />

      <style jsx>{`
        .container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px 60px;
          padding-bottom: 100px;
        }
        
        .clubes-hero {
          border-radius: 28px;
          padding: 40px;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .hero-content h1 {
          font-size: 36px;
          margin-bottom: 12px;
          color: var(--text-primary);
        }
        
        .hero-content p {
          color: var(--text-secondary);
          font-size: 16px;
        }
        
        .search-bar {
          background: var(--bg-card);
          border-radius: 60px;
          padding: 4px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
          border: 1px solid var(--border-color);
          width: 800px;
          margin: 0 auto 30px;
        }
        
        .search-bar i {
          color: var(--text-secondary);
          font-size: 18px;
        }
        
        .search-bar input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 8px 0;
          font-size: 15px;
          outline: none;
          color: var(--text-primary);
        }
        
        .categoria-tabs {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        
        .categoria-btn {
          background: var(--chat-bg);
          border: 1px solid var(--border-color);
          padding: 10px 24px;
          border-radius: 60px;
          font-weight: 600;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .categoria-btn.active {
          background: #ff1e2d;
          color: white;
          border-color: #ff1e2d;
        }
        
        .clubes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }
        
        .clube-card {
          background: var(--bg-card);
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          transition: transform 0.2s;
          display: flex;
          flex-direction: column;
          height: 100%;
          cursor: pointer;
          position: relative;
        }
        
        .clube-card.user-club {
          border: 2px solid #ff1e2d;
        }
        
        .clube-card:hover {
          transform: translateY(-4px);
        }
        
        .user-club-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .clube-capa {
          position: relative;
          height: 120px;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .clube-capa img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .clube-avatar-wrapper {
          position: absolute;
          bottom: -30px;
          left: 20px;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px;
        }
        
        .clube-avatar-wrapper img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .clube-content {
          padding: 40px 20px 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .clube-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
        }
        
        .clube-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
          flex: 1;
        }
        
        .clube-tipo {
          background: #ff1e2d20;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: #ff1e2d;
          white-space: nowrap;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .clube-descricao {
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 16px;
          flex: 1;
        }
        
        .clube-stats {
          margin-bottom: 16px;
          padding: 12px 0;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        
        .stat i {
          color: #ff1e2d;
        }
        
        .btn-entrar {
          width: 100%;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 10px;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 10px;
          flex-shrink: 0;
        }
        
        .clube-member-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }
        
        .btn-membro {
          flex: 1;
          background: var(--chat-bg);
          border: 1px solid var(--border-color);
          padding: 10px;
          border-radius: 40px;
          color: #10b981;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: 0.2s;
        }
        
        .btn-membro:hover {
          background: #10b98120;
          border-color: #10b981;
        }
        
        .btn-chat {
          flex: 1;
          background: transparent;
          border: 1px solid var(--border-color);
          padding: 10px;
          border-radius: 40px;
          color: var(--text-primary);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: 0.2s;
          flex-shrink: 0;
        }
        
        .btn-chat:hover {
          background: #ff1e2d20;
          border-color: #ff1e2d;
          color: #ff1e2d;
        }
        
        .chat-section {
          margin-top: 40px;
          padding-top: 40px;
          border-top: 1px solid var(--border-color);
        }
        
        .chat-selector {
          margin-top: 40px;
          padding: 20px;
          background: var(--bg-card);
          border-radius: 20px;
          border: 1px solid var(--border-color);
        }
        
        .chat-selector h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .chat-clubes-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .chat-clube-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--chat-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          cursor: pointer;
          transition: 0.2s;
          width: 100%;
          text-align: left;
        }
        
        .chat-clube-btn:hover {
          background: #ff1e2d10;
          border-color: #ff1e2d;
          transform: translateX(4px);
        }
        
        .chat-clube-btn img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .chat-clube-btn div {
          flex: 1;
        }
        
        .chat-clube-btn strong {
          display: block;
          font-size: 16px;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        
        .chat-clube-btn span {
          font-size: 12px;
          color: var(--text-secondary);
        }
        
        .chat-clube-btn i {
          color: var(--text-light);
        }
        
        .btn-criar-clube-fixed {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 14px 28px;
          border-radius: 50px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          transition: all 0.3s ease;
          z-index: 1000;
          box-shadow: 0 4px 15px rgba(255, 30, 45, 0.3);
        }
        
        .btn-criar-clube-fixed:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(255, 30, 45, 0.4);
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 20px;
            padding-bottom: 80px;
          }
          .clubes-grid {
            grid-template-columns: 1fr;
          }
          .search-bar {
            width: 100%;
          }
          .clube-header {
            flex-wrap: wrap;
          }
          .clube-tipo {
            white-space: normal;
          }
          .clube-member-actions {
            flex-direction: column;
          }
          .hero-content h1 {
            font-size: 28px;
          }
          .btn-criar-clube-fixed {
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </>
  )
}

// Componente Modal para Criar Clube (mesmo código anterior, mantido)
const CreateClubeModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    localizacao: '',
    sobre: '',
    categoria: 'corrida',
    tipo: 'publico',
    regiao: '',
    horariosTreino: [
      { dia: 'Terça', horario: '19h30', local: '' },
      { dia: 'Quinta', horario: '19h30', local: '' },
      { dia: 'Sábado', horario: '07h00', local: '' }
    ],
    redesSociais: {
      instagram: '',
      whatsapp: '',
      twitter: ''
    },
    capa: '',
    avatar: ''
  })

  const [capaPreview, setCapaPreview] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const capaInputRef = useRef(null)
  const avatarInputRef = useRef(null)

  const regioes = [
    'Vale do Paraíba',
    'Região Metropolitana de São Paulo',
    'Litoral Norte',
    'Campinas e Região',
    'Sorocaba e Região',
    'Ribeirão Preto',
    'Outra região'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleHorarioChange = (index, field, value) => {
    const novosHorarios = [...formData.horariosTreino]
    novosHorarios[index][field] = value
    setFormData(prev => ({ ...prev, horariosTreino: novosHorarios }))
  }

  const handleRedesSociaisChange = (rede, value) => {
    setFormData(prev => ({
      ...prev,
      redesSociais: { ...prev.redesSociais, [rede]: value }
    }))
  }

  const addHorario = () => {
    setFormData(prev => ({
      ...prev,
      horariosTreino: [...prev.horariosTreino, { dia: '', horario: '', local: '' }]
    }))
  }

  const removeHorario = (index) => {
    setFormData(prev => ({
      ...prev,
      horariosTreino: prev.horariosTreino.filter((_, i) => i !== index)
    }))
  }

  const handleCapaUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCapaPreview(reader.result)
        setFormData(prev => ({ ...prev, capa: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
        setFormData(prev => ({ ...prev, avatar: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.nome.trim()) {
      alert('Por favor, informe o nome do clube')
      return
    }
    if (!formData.descricao.trim()) {
      alert('Por favor, informe uma descrição')
      return
    }
    onCreate(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Criar Novo Clube</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3>Imagens do Clube</h3>
            <div className="image-upload-area">
              <div className="upload-item">
                <label>Foto de Capa (Banner)</label>
                <div className="upload-preview capa-preview" onClick={() => capaInputRef.current?.click()} style={{ backgroundImage: capaPreview ? `url(${capaPreview})` : 'none' }}>
                  {!capaPreview && (
                    <div className="upload-placeholder">
                      <i className="fas fa-image"></i>
                      <span>Clique para adicionar capa</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={capaInputRef} accept="image/*" onChange={handleCapaUpload} style={{ display: 'none' }} />
                <p className="upload-hint">Recomendado: 1200x400px</p>
              </div>

              <div className="upload-item">
                <label>Foto de Perfil (Avatar)</label>
                <div className="upload-preview avatar-preview" onClick={() => avatarInputRef.current?.click()} style={{ backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none' }}>
                  {!avatarPreview && (
                    <div className="upload-placeholder">
                      <i className="fas fa-user-circle"></i>
                      <span>Clique para adicionar avatar</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={avatarInputRef} accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                <p className="upload-hint">Recomendado: 200x200px</p>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Informações Básicas</h3>
            <div className="form-group">
              <label>Nome do Clube *</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Corredores do Vale" required />
            </div>

            <div className="form-group">
              <label>Categoria</label>
              <select name="categoria" value={formData.categoria} onChange={handleChange}>
                <option value="corrida">Corrida</option>
                <option value="ciclismo">Ciclismo</option>
                <option value="fitness">Fitness</option>
                <option value="natacao">Natação</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tipo do Clube</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="tipo" value="publico" checked={formData.tipo === 'publico'} onChange={handleChange} />
                  <span> Público</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="tipo" value="privado" checked={formData.tipo === 'privado'} onChange={handleChange} />
                  <span> Privado</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Região</label>
              <select name="regiao" value={formData.regiao} onChange={handleChange}>
                <option value="">Selecione uma região</option>
                {regioes.map(regiao => (
                  <option key={regiao} value={regiao}>{regiao}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Localização (Cidade/Estado)</label>
              <input type="text" name="localizacao" value={formData.localizacao} onChange={handleChange} placeholder="Ex: São José dos Campos, SP" />
            </div>
          </div>

          <div className="form-section">
            <h3>Sobre o Clube</h3>
            <div className="form-group">
              <label>Descrição Curta *</label>
              <textarea name="descricao" value={formData.descricao} onChange={handleChange} placeholder="Breve descrição do clube..." rows="3" required />
            </div>

            <div className="form-group">
              <label>Sobre (Descrição Detalhada)</label>
              <textarea name="sobre" value={formData.sobre} onChange={handleChange} placeholder="História, valores, objetivos do clube..." rows="5" />
            </div>
          </div>

          <div className="form-section">
            <h3>Horários de Treino</h3>
            <p className="section-hint">Adicione os dias e horários dos treinos regulares</p>
            {formData.horariosTreino.map((horario, index) => (
              <div key={index} className="horario-item">
                <div className="horario-fields">
                  <input type="text" placeholder="Dia" value={horario.dia} onChange={(e) => handleHorarioChange(index, 'dia', e.target.value)} />
                  <input type="text" placeholder="Horário" value={horario.horario} onChange={(e) => handleHorarioChange(index, 'horario', e.target.value)} />
                  <input type="text" placeholder="Local" value={horario.local} onChange={(e) => handleHorarioChange(index, 'local', e.target.value)} />
                </div>
                {formData.horariosTreino.length > 1 && (
                  <button type="button" className="btn-remove" onClick={() => removeHorario(index)}>
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-add-horario" onClick={addHorario}>
              <i className="fas fa-plus"></i> Adicionar Horário
            </button>
          </div>

          <div className="form-section">
            <h3>Redes Sociais</h3>
            <div className="form-group">
              <label><i className="fab fa-instagram"></i> Instagram</label>
              <input type="text" placeholder="@seudominio" value={formData.redesSociais.instagram} onChange={(e) => handleRedesSociaisChange('instagram', e.target.value)} />
            </div>
            <div className="form-group">
              <label><i className="fab fa-whatsapp"></i> WhatsApp / Telegram</label>
              <input type="text" placeholder="Link do grupo" value={formData.redesSociais.whatsapp} onChange={(e) => handleRedesSociaisChange('whatsapp', e.target.value)} />
            </div>
            <div className="form-group">
              <label><i className="fab fa-twitter"></i> Twitter</label>
              <input type="text" placeholder="Link do clube no Twitter" value={formData.redesSociais.twitter} onChange={(e) => handleRedesSociaisChange('twitter', e.target.value)} />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-create">Criar Clube</button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          overflow-y: auto;
          padding: 20px;
        }
        
        .modal-container {
          background: var(--bg-card);
          border-radius: 24px;
          width: 100%;
          max-width: 750px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          background: var(--bg-card);
          z-index: 10;
        }
        
        .modal-header h2 {
          font-size: 22px;
          color: var(--text-primary);
        }
        
        .modal-close {
          background: transparent;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: 0.2s;
        }
        
        .modal-close:hover {
          color: #ff1e2d;
        }
        
        .modal-form {
          padding: 28px;
        }
        
        .form-section {
          margin-bottom: 32px;
        }
        
        .form-section h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        
        .section-hint {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: var(--text-primary);
          font-size: 14px;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          background: var(--chat-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 14px;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #ff1e2d;
        }
        
        .radio-group {
          display: flex;
          gap: 24px;
        }
        
        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .radio-label input {
          width: auto;
        }
        
        .horario-item {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          align-items: center;
        }
        
        .horario-fields {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr 1.5fr;
          gap: 12px;
        }
        
        .horario-fields input {
          padding: 10px 12px;
        }
        
        .btn-remove {
          background: #ff1e2d20;
          border: none;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          color: #ff1e2d;
        }
        
        .btn-remove:hover {
          background: #ff1e2d;
          color: white;
        }
        
        .btn-add-horario {
          background: transparent;
          border: 1px dashed var(--border-color);
          padding: 10px;
          border-radius: 12px;
          cursor: pointer;
          color: var(--text-secondary);
          width: 100%;
          margin-top: 8px;
        }
        
        .btn-add-horario:hover {
          border-color: #ff1e2d;
          color: #ff1e2d;
        }
        
        .modal-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
          margin-top: 20px;
        }
        
        .btn-cancel {
          padding: 12px 28px;
          background: var(--chat-bg);
          border: 1px solid var(--border-color);
          border-radius: 40px;
          cursor: pointer;
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .btn-cancel:hover {
          background: #ff1e2d20;
          border-color: #ff1e2d;
          color: #ff1e2d;
        }
        
        .btn-create {
          padding: 12px 32px;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-create:hover {
          transform: translateY(-2px);
        }
        
        .image-upload-area {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 20px;
        }
        
        .upload-preview {
          background-color: var(--chat-bg);
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          transition: 0.2s;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        
        .capa-preview {
          height: 120px;
        }
        
        .avatar-preview {
          height: 150px;
          border-radius: 50%;
          width: 150px;
          margin: 0 auto;
        }
        
        .upload-preview:hover {
          border-color: #ff1e2d;
        }
        
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 8px;
          color: var(--text-secondary);
        }
        
        .upload-placeholder i {
          font-size: 32px;
        }
        
        .upload-placeholder span {
          font-size: 12px;
        }
        
        .upload-hint {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 6px;
          text-align: center;
        }
        
        @media (max-width: 640px) {
          .modal-container {
            max-width: 95%;
          }
          .horario-fields {
            grid-template-columns: 1fr;
          }
          .horario-item {
            flex-direction: column;
          }
          .radio-group {
            flex-direction: column;
            gap: 12px;
          }
          .image-upload-area {
            grid-template-columns: 1fr;
          }
          .avatar-preview {
            width: 120px;
            height: 120px;
          }
        }
      `}</style>
    </div>
  )
}

export default Clubes