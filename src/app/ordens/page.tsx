'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { OrdemServico, Machine } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, 
  Plus, 
  Search, 
  Clock,
  CheckCircle,
  PlayCircle,
  ArrowLeft,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface OrdemServicoExtended extends OrdemServico {
  machines?: Machine
  profiles?: {
    nome: string
    email: string
  }
}

export default function OrdensPage() {
  const router = useRouter()
  const [ordens, setOrdens] = useState<OrdemServicoExtended[]>([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    tipo: 'reabastecimento',
    maquina_id: '',
    descricao: '',
    responsavel_id: ''
  })

  useEffect(() => {
    checkUser()
    loadData()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setCurrentUser(user)
    }
  }

  const loadData = async () => {
    try {
      // Carregar ordens de serviço
      const { data: ordensData, error: ordensError } = await supabase
        .from('ordem_servico')
        .select(`
          *,
          machines (nome, localizacao),
          profiles (nome, email)
        `)
        .order('created_at', { ascending: false })

      if (ordensError) throw ordensError
      setOrdens(ordensData || [])

      // Carregar máquinas
      const { data: machinesData } = await supabase
        .from('machines')
        .select('*')
        .order('nome')

      setMachines(machinesData || [])

      // Carregar usuários
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('nome')

      setUsers(usersData || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('ordem_servico')
        .insert([{
          tipo: formData.tipo,
          maquina_id: formData.maquina_id,
          descricao: formData.descricao,
          responsavel_id: formData.responsavel_id,
          status: 'aberta'
        }])

      if (error) throw error

      setDialogOpen(false)
      setFormData({
        tipo: 'reabastecimento',
        maquina_id: '',
        descricao: '',
        responsavel_id: ''
      })
      loadData()
    } catch (error) {
      console.error('Erro ao criar ordem de serviço:', error)
      alert('Erro ao criar ordem de serviço')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('ordem_servico')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aberta':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'em_execucao':
        return <PlayCircle className="h-5 w-5 text-blue-500" />
      case 'concluida':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberta':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'em_execucao':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'concluida':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return ''
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'reabastecimento':
        return 'Reabastecimento'
      case 'recolhimento':
        return 'Recolhimento'
      case 'manutencao':
        return 'Manutenção'
      default:
        return tipo
    }
  }

  const filteredOrdens = ordens.filter(ordem => {
    const matchesSearch = 
      ordem.machines?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || ordem.status === filterStatus

    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">Ordens de Serviço</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ordens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="aberta">Abertas</SelectItem>
                  <SelectItem value="em_execucao">Em Execução</SelectItem>
                  <SelectItem value="concluida">Concluídas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Nova Ordem
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Ordem de Serviço</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da ordem de serviço
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Serviço *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({...formData, tipo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reabastecimento">Reabastecimento</SelectItem>
                        <SelectItem value="recolhimento">Recolhimento de Dinheiro</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maquina_id">Máquina *</Label>
                    <Select
                      value={formData.maquina_id}
                      onValueChange={(value) => setFormData({...formData, maquina_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma máquina" />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.map((machine) => (
                          <SelectItem key={machine.id} value={machine.id}>
                            {machine.nome} - {machine.localizacao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsavel_id">Responsável *</Label>
                    <Select
                      value={formData.responsavel_id}
                      onValueChange={(value) => setFormData({...formData, responsavel_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.nome} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição / Observações</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      placeholder="Detalhes sobre o serviço..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-purple-600 to-blue-600"
                      disabled={!formData.maquina_id || !formData.responsavel_id}
                    >
                      Criar Ordem
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredOrdens.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma ordem encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando sua primeira ordem de serviço'
                }
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrdens.map((ordem) => (
                <Card key={ordem.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(ordem.status)}
                          <CardTitle className="text-lg">
                            {getTipoLabel(ordem.tipo)}
                          </CardTitle>
                        </div>
                        <CardDescription>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {ordem.machines?.nome}
                            </p>
                            <p className="text-sm">{ordem.machines?.localizacao}</p>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-center ${getStatusColor(ordem.status)}`}>
                          {ordem.status === 'aberta' && 'Aberta'}
                          {ordem.status === 'em_execucao' && 'Em Execução'}
                          {ordem.status === 'concluida' && 'Concluída'}
                        </span>
                        {ordem.status !== 'concluida' && (
                          <Select
                            value={ordem.status}
                            onValueChange={(value) => handleStatusChange(ordem.id, value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aberta">Aberta</SelectItem>
                              <SelectItem value="em_execucao">Em Execução</SelectItem>
                              <SelectItem value="concluida">Concluída</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ordem.descricao && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">{ordem.descricao}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Responsável:</span>
                        <p className="font-medium">{ordem.profiles?.nome}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Criada em:</span>
                        <p className="font-medium">
                          {new Date(ordem.created_at).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(ordem.created_at).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
