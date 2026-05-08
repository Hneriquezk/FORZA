import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import './MembrosLista.css';

function MembrosLista() {
  const navigate = useNavigate();
  const { clubeId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCargo, setFilterCargo] = useState('todos');
  const [clube, setClube] = useState(null);
  const [membros, setMembros] = useState([]);

  const clubesData = {
    1: {
      id: 1,
      nome: "Corredores de São José e Região",
      avatar: "/img/clubes/corredores_sjc_avatar.jpg",
      membrosCount: 547
    },
    2: {
      id: 2,
      nome: "Ciclotech",
      avatar: "/img/clubes/ciclotech.png",
      membrosCount: 328
    },
    3: {
      id: 3,
      nome: "Parkrun UK",
      avatar: "/img/clubes/parkrun.png",
      membrosCount: 12500
    },
    4: {
      id: 4,
      nome: "Red Bull UK",
      avatar: "/img/clubes/red_bull.png",
      membrosCount: 89
    }
  };

  const membrosData = {
    1: [
      { id: 1, nome: "Gabriel Bastos", avatar: "/img/usuarios/gabriel.png", cargo: "Administrador", atividades: 128, localizacao: "São José dos Campos, SP" },
      { id: 2, nome: "Giovanni Morette", avatar: "/img/usuarios/giovanni_borsoi.jpg", cargo: "Moderador", atividades: 95, localizacao: "Caçapava, SP" },
      { id: 3, nome: "Henrique Lima", avatar: "/img/usuarios/henrique_santosz.jpg", cargo: "Membro", atividades: 34, localizacao: "São José dos Campos, SP" },
      { id: 4, nome: "Vitor Vaz", avatar: "/img/usuarios/vitor_vaz.jpg", cargo: "Membro", atividades: 21, localizacao: "São José dos Campos, SP" },
      { id: 5, nome: "Caio Figueira", avatar: "/img/usuarios/caio.png", cargo: "Membro", atividades: 67, localizacao: "Caçapava, SP" },
      { id: 6, nome: "Ana Costa", avatar: "https://img.magnific.com/fotos-gratis/feliz-bonito-mulher-jovem-posar-camera-em-parque-cidade_1262-19158.jpg", cargo: "Membro", atividades: 45, localizacao: "São José dos Campos, SP" },
      { id: 7, nome: "Pedro Oliveira", avatar: "https://dgtzuqphqg23d.cloudfront.net/N91108auwK0YySdlMCoPXFUS-LTleaTDFvBdYUxNZJY-1536x2048.jpg", cargo: "Membro", atividades: 32, localizacao: "Jacareí, SP" },
      { id: 8, nome: "Carlos Lima", avatar: "https://dgtzuqphqg23d.cloudfront.net/fMFl9s-OMkVe-wJ-SnpVnrzocU2MZAXLe6qsr1lbuBw-1536x2048.jpg", cargo: "Membro", atividades: 28, localizacao: "São José dos Campos, SP" },
      { id: 9, nome: "Mariana Santos", avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIvQoUyoj9HZPzWoiCEh6HETkAViZdomsZvg&s", cargo: "Membro", atividades: 56, localizacao: "Taubaté, SP" },
      { id: 10, nome: "Ricardo Alves", avatar: "https://dgtzuqphqg23d.cloudfront.net/f26WtZqf32oH-80tKSKg3IudLOONd4sxX3zoGR_zQtg-1591x2048.jpg", cargo: "Membro", atividades: 42, localizacao: "São José dos Campos, SP" }
    ],
    2: [
      { id: 1, nome: "André Bike", avatar: "/img/usuarios/avatar_andre.png", cargo: "Administrador", atividades: 245, localizacao: "São José dos Campos, SP" },
      { id: 2, nome: "Carla Pedal", avatar: "/img/usuarios/avatar_carla.png", cargo: "Moderador", atividades: 187, localizacao: "São José dos Campos, SP" },
      { id: 3, nome: "Ricardo Speed", avatar: "/img/usuarios/avatar_ricardo.png", cargo: "Membro", atividades: 98, localizacao: "Caçapava, SP" }
    ],
    3: [
      { id: 1, nome: "John Runner", avatar: "/img/usuarios/avatar_john.png", cargo: "Administrador", atividades: 512, localizacao: "Londres, UK" },
      { id: 2, nome: "Sarah Park", avatar: "/img/usuarios/avatar_sarah.png", cargo: "Moderador", atividades: 345, localizacao: "Manchester, UK" }
    ],
    4: [
      { id: 1, nome: "Max Power", avatar: "/img/usuarios/avatar_max.png", cargo: "Administrador", atividades: 890, localizacao: "Londres, UK" }
    ]
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (clubeId && clubesData[clubeId]) {
      setClube(clubesData[clubeId]);
      setMembros(membrosData[clubeId] || []);
    } else {
      navigate('/clubes');
    }
    
    setLoading(false);
  }, [isAuthenticated, navigate, clubeId]);

  const filteredMembros = membros.filter(membro => {
    const matchesSearch = membro.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCargo = filterCargo === 'todos' || membro.cargo.toLowerCase() === filterCargo.toLowerCase();
    return matchesSearch && matchesCargo;
  });

  const cargos = ['todos', 'Administrador', 'Moderador', 'Membro'];

  if (loading) {
    return (
      <>
        <Header />
        <div className="membros-loading">
          <div className="membros-loading-spinner"></div>
          <p>Carregando membros...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!clube) return null;

  return (
    <>
      <Header />
      
      <div className="membros-container">
        <div className="membros-header">
          <button className="membros-voltar" onClick={() => navigate(`/clube/${clubeId}`)}>
            <i className="fas fa-arrow-left"></i> Voltar
          </button>
          <div className="membros-header-info">
            <img src={clube.avatar} alt={clube.nome} className="membros-clube-avatar" />
            <div>
              <h1>{clube.nome}</h1>
              <p>{clube.membrosCount} membros</p>
            </div>
          </div>
        </div>

        <div className="membros-search">
          <div className="membros-search-bar">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Buscar membro por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="membros-filtros">
            {cargos.map(cargo => (
              <button 
                key={cargo}
                className={`membros-filtro-btn ${filterCargo === cargo ? 'active' : ''}`}
                onClick={() => setFilterCargo(cargo)}
              >
                {cargo === 'todos' ? 'Todos' : cargo}
              </button>
            ))}
          </div>
        </div>

        <div className="membros-grid">
          {filteredMembros.length === 0 ? (
            <div className="membros-empty">
              <i className="fas fa-users-slash"></i>
              <p>Nenhum membro encontrado</p>
            </div>
          ) : (
            filteredMembros.map(membro => (
              <div key={membro.id} className="membro-card">
                <img src={membro.avatar} alt={membro.nome} className="membro-avatar" />
                <div className="membro-info">
                  <div className="membro-nome">
                    {membro.nome}
                    {membro.cargo === 'Administrador' && <span className="membro-badge admin">Admin</span>}
                    {membro.cargo === 'Moderador' && <span className="membro-badge mod">Mod</span>}
                  </div>
                  <div className="membro-local">
                    <i className="fas fa-map-marker-alt"></i> {membro.localizacao}
                  </div>
                  <div className="membro-atividades">
                    <i className="fas fa-running"></i> {membro.atividades} atividades
                  </div>
                </div>
                <button className="membro-btn-visitar" onClick={() => alert(`Perfil de ${membro.nome} em breve!`)}>
                  Ver perfil
                </button>
              </div>
            ))
          )}
        </div>

        <div className="membros-footer">
          <p>Mostrando {filteredMembros.length} de {membros.length} membros</p>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default MembrosLista;