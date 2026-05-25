import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  // ==================== CARREGAR USUÁRIO DO LOCALSTORAGE ====================
  useEffect(() => {
    const carregarUsuarioStorage = () => {
      console.log('🔍 [Auth] Iniciando carregamento do localStorage...')
      
      try {
        const storedUser = localStorage.getItem('forza_user')
        console.log('🔍 [Auth] localStorage tem usuário?', storedUser ? 'SIM' : 'NÃO')
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          console.log('✅ [Auth] Usuário carregado com sucesso:', parsedUser.nome)
          console.log('✅ [Auth] ID do usuário:', parsedUser.id)
          console.log('✅ [Auth] Email do usuário:', parsedUser.email)
          setUser(parsedUser)
        } else {
          console.log('⚠️ [Auth] Nenhum usuário encontrado no localStorage')
        }
      } catch (e) {
        console.error('❌ [Auth] Erro ao parsear usuário do localStorage', e)
        localStorage.removeItem('forza_user')
      } finally {
        setLoading(false)
        console.log('🔍 [Auth] Loading finalizado, loading = false')
      }
    }
    
    carregarUsuarioStorage()
  }, [])

  // ==================== LOGIN ====================
  const login = async (email, password) => {
    try {
      console.log('🔍 [Auth] Tentando login:', email)
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', password)
        .single()

      if (error) {
        console.error('❌ [Auth] Erro na busca:', error)
        return { success: false, error: 'Email ou senha incorretos!' }
      }

      if (!data) {
        console.error('❌ [Auth] Usuário não encontrado')
        return { success: false, error: 'Email ou senha incorretos!' }
      }

      console.log('✅ [Auth] Login realizado com sucesso:', data.nome)
      console.log('✅ [Auth] Salvando no localStorage...')
      
      setUser(data)
      localStorage.setItem('forza_user', JSON.stringify(data))
      
      // Verificar se salvou corretamente
      const verificarStorage = localStorage.getItem('forza_user')
      console.log('🔍 [Auth] Verificação localStorage após salvar:', verificarStorage ? 'OK' : 'FALHOU')
      
      return { success: true, user: data }
      
    } catch (error) {
      console.error('❌ [Auth] Erro no login:', error)
      return { success: false, error: 'Email ou senha incorretos!' }
    }
  }

  // ==================== CADASTRO ====================
  const cadastrar = async (userData) => {
    try {
      console.log('🔍 [Auth] Cadastrando:', userData.email)
      
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('email')
        .eq('email', userData.email)
        .single()

      if (existingUser) {
        console.error('❌ [Auth] E-mail já cadastrado:', userData.email)
        return { success: false, error: 'Este e-mail já está cadastrado!' }
      }

      const { error } = await supabase
        .from('usuarios')
        .insert({
          nome: userData.nome,
          email: userData.email,
          senha: userData.senha,
          avatar: userData.avatar || '/img/usuarios/default.jpg',
          capa: '/img/banner_perfil.png',
          bio: userData.bio || '👋 Amante de esportes e vida saudável!',
          localizacao: userData.localizacao || 'Brasil'
        })

      if (error) throw error

      console.log('✅ [Auth] Usuário cadastrado com sucesso!')
      return { success: true }
      
    } catch (error) {
      console.error('❌ [Auth] Erro no cadastro:', error)
      return { success: false, error: 'Erro ao realizar cadastro. Tente novamente.' }
    }
  }

  // ==================== LOGOUT ====================
  const logout = async () => {
    console.log('🔴 [Auth] Fazendo logout...')
    console.log('🔴 [Auth] Removendo usuário do estado e localStorage')
    setUser(null)
    localStorage.removeItem('forza_user')
    console.log('✅ [Auth] Logout realizado com sucesso')
    return { success: true }
  }

  // ==================== ATUALIZAR USUÁRIO ====================
  const updateUser = async (updates) => {
    try {
      if (!user) throw new Error('Usuário não autenticado')

      console.log('🟡 [Auth] Atualizando usuário no banco:', updates)

      const { error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('forza_user', JSON.stringify(updatedUser))

      console.log('✅ [Auth] Usuário atualizado com sucesso!')
      return { success: true }
      
    } catch (error) {
      console.error('❌ [Auth] Erro ao atualizar usuário:', error)
      return { success: false, error: error.message }
    }
  }

  // ==================== VERIFICAR SESSÃO ATUAL ====================
  const verificarSessao = () => {
    console.log('🔍 [Auth] Verificando sessão atual')
    console.log('🔍 [Auth] user:', user ? user.nome : 'null')
    console.log('🔍 [Auth] loading:', loading)
    console.log('🔍 [Auth] isAuthenticated:', isAuthenticated)
    
    const storedUser = localStorage.getItem('forza_user')
    console.log('🔍 [Auth] localStorage atual:', storedUser ? 'tem usuário' : 'vazio')
    
    return { user, isAuthenticated, hasStorage: !!storedUser }
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      cadastrar,
      logout,
      updateUser,
      loading,
      isAuthenticated,
      verificarSessao  // Função de debug
    }}>
      {children}
    </AuthContext.Provider>
  )
}