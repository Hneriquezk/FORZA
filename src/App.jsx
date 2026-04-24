import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Pages - remova Header e Footer das importações das páginas
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Painel from './pages/Painel'
import Planos from './pages/Planos'
import Perfil from './pages/Perfil'
import Clubes from './pages/Clubes'
import Desafios from './pages/Desafios'
import CoachIA from './pages/CoachIA'
import Analise from './pages/Analise'
import Resumo from './pages/Resumo'
import Sobre from './pages/Sobre'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro:', error, errorInfo)
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
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#ff1e2d' }}>⚠️ Erro na aplicação</h1>
          <pre style={{ background: '#1a1a1a', color: '#fff', padding: '15px', borderRadius: '8px', fontSize: '12px' }}>
            {this.state.error?.message}
          </pre>
          <button onClick={() => window.location.reload()} style={{
            background: '#ff1e2d',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '40px',
            cursor: 'pointer',
            marginTop: '20px'
          }}>
            Recarregar
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
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/" element={<ProtectedRoute><Painel /></ProtectedRoute>} />
        <Route path="/painel" element={<ProtectedRoute><Painel /></ProtectedRoute>} />
        <Route path="/planos" element={<ProtectedRoute><Planos /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/clubes" element={<ProtectedRoute><Clubes /></ProtectedRoute>} />
        <Route path="/desafios" element={<ProtectedRoute><Desafios /></ProtectedRoute>} />
        <Route path="/coach" element={<ProtectedRoute><CoachIA /></ProtectedRoute>} />
        <Route path="/analise" element={<ProtectedRoute><Analise /></ProtectedRoute>} />
        <Route path="/resumo" element={<ProtectedRoute><Resumo /></ProtectedRoute>} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App