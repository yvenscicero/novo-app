import { createClient } from '@supabase/supabase-js'

// Valores padrão para desenvolvimento
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'admin' | 'tecnico' | 'operador'

export interface UserProfile {
  id: string
  email: string
  nome: string
  role: UserRole
  created_at: string
}

export interface Machine {
  id: string
  nome: string
  localizacao: string
  latitude?: number
  longitude?: number
  status: 'ativa' | 'manutencao' | 'reabastecer' | 'inativa'
  tipo_brinquedo: string
  capacidade_total: number
  estoque_atual: number
  ultimo_recolhimento?: string
  ultima_manutencao?: string
  created_at: string
}

export interface OrdemServico {
  id: string
  tipo: 'reabastecimento' | 'recolhimento' | 'manutencao'
  maquina_id: string
  descricao: string
  responsavel_id: string
  status: 'aberta' | 'em_execucao' | 'concluida'
  created_at: string
  updated_at: string
}

export interface MovimentacaoEstoque {
  id: string
  maquina_id: string
  quantidade: number
  tipo: 'entrada' | 'saida'
  responsavel_id: string
  created_at: string
}

export interface RecolhimentoFinanceiro {
  id: string
  maquina_id: string
  valor: number
  responsavel_id: string
  created_at: string
}
