import { supabase } from '../lib/supabase'

export async function buscarDesafiosCompletados(usuarioId) {
  const { data, error } = await supabase
    .from('desafios_completados')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('completado_em', { ascending: false })

  if (error) {
    console.error('Erro ao buscar desafios completados:', error)
    return []
  }

  return data
}

export async function completarDesafio(usuarioId, desafioId, medalhaImg, tituloDesafio) {
  const { data: existe } = await supabase
    .from('desafios_completados')
    .select('id')
    .eq('usuario_id', usuarioId)
    .eq('desafio_id', desafioId)
    .single()

  if (existe) {
    return { success: false, message: 'Desafio já foi completado anteriormente!' }
  }

  const { data, error } = await supabase
    .from('desafios_completados')
    .insert([
      {
        usuario_id: usuarioId,
        desafio_id: desafioId,
        medalha_img: medalhaImg,
        titulo_desafio: tituloDesafio
      }
    ])
    .select()

  if (error) {
    console.error('Erro ao completar desafio:', error)
    return { success: false, error }
  }

  return { success: true, data: data[0] }
}

export async function removerDesafioCompletado(usuarioId, desafioId) {
  const { error } = await supabase
    .from('desafios_completados')
    .delete()
    .eq('usuario_id', usuarioId)
    .eq('desafio_id', desafioId)

  if (error) {
    console.error('Erro ao remover desafio completado:', error)
    return { success: false, error }
  }

  return { success: true }
}