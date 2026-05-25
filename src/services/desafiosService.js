import { supabase } from '../lib/supabase'

export async function buscarDesafios() {
  const { data, error } = await supabase
    .from('desafios')
    .select('*')

  if (error) {
    console.error('Erro ao buscar desafios:', error)
    return []
  }

  console.log('📊 Desafios vindos do banco:', data)

  // Converter para o formato que seu componente usa
  return data.map(desafio => ({
    id: desafio.id,
    titulo: desafio.nome,
    descricao: desafio.meta,
    data: "1 a 31 de março",
    medalhaImg: desafio.medalha_img || '/img/default-medal.png',
    bgImage: desafio.bg_image || '/img/default-bg.jpg',
    categoria: desafio.categoria || 'tempo'
  }))
}