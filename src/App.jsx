import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import ScrollToTop from './components/ScrollToTop'

// Pages
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import SobreNos from './pages/SobreNos'
import Sobre from './pages/Sobre'
import Painel from './pages/Painel'
import Planos from './pages/Planos'
import Perfil from './pages/Perfil'
import Clubes from './pages/Clubes'
import Desafios from './pages/Desafios'
import CoachIA from './pages/CoachIA'
import Analise from './pages/Analise'
import Resumo from './pages/Resumo'
import ClubeDetalhes from './pages/ClubeDetalhes'
import MembrosLista from './pages/MembrosLista'
import DesafioDetalhes from './pages/DesafioDetalhes';
import Privacidade from './pages/Privacidade';


// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro capturado:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          background: '#f5f5f5',
          fontFamily: 'monospace'
        }}>
          <h1 style={{ color: '#ff1e2d' }}>⚠️ Erro na aplicação</h1>
          <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '800px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Clique para ver o erro</summary>
            <pre style={{
              background: '#1a1a1a',
              color: '#fff',
              padding: '15px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
              marginTop: '10px'
            }}>
              {this.state.error && this.state.error.toString()}
              {'\n\n'}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#ff1e2d',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '40px',
              cursor: 'pointer',
              marginTop: '20px',
              fontSize: '16px'
            }}
          >
            Recarregar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<SobreNos />} />
        <Route path="/sobre-nos" element={<SobreNos />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas Protegidas */}
        <Route path="/painel" element={<ProtectedRoute><Painel /></ProtectedRoute>} />
        <Route path="/planos" element={<ProtectedRoute><Planos /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/clubes" element={<ProtectedRoute><Clubes /></ProtectedRoute>} />
        <Route path="/desafios" element={<ProtectedRoute><Desafios /></ProtectedRoute>} />
        <Route path="/coach" element={<ProtectedRoute><CoachIA /></ProtectedRoute>} />
        <Route path="/analise" element={<ProtectedRoute><Analise /></ProtectedRoute>} />
        <Route path="/resumo" element={<ProtectedRoute><Resumo /></ProtectedRoute>} />
        <Route path="/clube/:clubeId" element={<ProtectedRoute><ClubeDetalhes /></ProtectedRoute>} />
        <Route path="/clube/:clubeId/membros" element={<ProtectedRoute><MembrosLista /></ProtectedRoute>} />
        <Route path="/desafio/:id" element={<ProtectedRoute><DesafioDetalhes /></ProtectedRoute>} />
        <Route path="/privacidade" element={<ProtectedRoute><Privacidade /></ProtectedRoute>} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App