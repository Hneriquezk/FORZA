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

  useEffect(() => {
    const storedUser = localStorage.getItem('forza_user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (e) {
        console.error('Erro ao parsear usuário do localStorage', e)
        localStorage.removeItem('forza_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      console.log('Tentando login:', email)
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', password)
        .single()

      if (error) {
        console.error('Erro na busca:', error)
        return { success: false, error: 'Email ou senha incorretos!' }
      }

      if (!data) {
        return { success: false, error: 'Email ou senha incorretos!' }
      }

      setUser(data)
      localStorage.setItem('forza_user', JSON.stringify(data))
      
      console.log('Login realizado com sucesso:', data.nome)
      return { success: true, user: data }
      
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: 'Email ou senha incorretos!' }
    }
  }

  const cadastrar = async (userData) => {
    try {
      console.log('Cadastrando:', userData.email)
      
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('email')
        .eq('email', userData.email)
        .single()

      if (existingUser) {
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

      console.log('Usuário cadastrado com sucesso!')
      return { success: true }
      
    } catch (error) {
      console.error('Erro no cadastro:', error)
      return { success: false, error: 'Erro ao realizar cadastro. Tente novamente.' }
    }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('forza_user')
    return { success: true }
  }

  const updateUser = async (updates) => {
    try {
      if (!user) throw new Error('Usuário não autenticado')

      console.log('🟡 Atualizando usuário no banco:', updates)

      const { error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('forza_user', JSON.stringify(updatedUser))

      console.log('✅ Usuário atualizado com sucesso!')
      return { success: true }
      
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error)
      return { success: false, error: error.message }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      cadastrar,
      logout,
      updateUser,
      loading,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  )
}