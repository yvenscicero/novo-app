'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Machine } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Package, 
  Plus, 
  Search, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ArrowLeft
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

export default function MaquinasPage() {
  const router = useRouter()
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    localizacao: '',
    latitude: '',
    longitude: '',
    status: 'ativa',
    tipo_brinquedo: '',
    capacidade_total: '',
    estoque_atual: ''
  })

  useEffect(() => {
    checkUser()
    loadMachines()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    }
  }

  const loadMachines = async () => {
    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMachines(data || [])
    } catch (error) {
      console.error('Erro ao carregar máquinas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('machines')
        .insert([{
          nome: formData.nome,
          localizacao: formData.localizacao,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          status: formData.status,
          tipo_brinquedo: formData.tipo_brinquedo,
          capacidade_total: parseInt(formData.capacidade_total),
          estoque_atual: parseInt(formData.estoque_atual)
        }])

      if (error) throw error

      setDialogOpen(false)
      setFormData({
        nome: '',
        localizacao: '',
        latitude: '',
        longitude: '',
        status: 'ativa',
        tipo_brinquedo: '',
        capacidade_total: '',
        estoque_atual: ''
      })
      loadMachines()
    } catch (error) {
      console.error('Erro ao cadastrar máquina:', error)
      alert('Erro ao cadastrar máquina')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta máquina?')) return

    try {
      const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadMachines()
    } catch (error) {
      console.error('Erro ao excluir máquina:', error)
      alert('Erro ao excluir máquina')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativa':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'manutencao':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'reabastecer':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'inativa':
        return <XCircle className="h-5 w-5 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'manutencao':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'reabastecer':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'inativa':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      default:
        return ''
    }
  }

  const filteredMachines = machines.filter(machine =>
    machine.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">Gestão de Máquinas</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar máquinas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2">
                  <Plus className="h-4 w-4" />
                  Cadastrar Máquina
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Cadastrar Nova Máquina</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da máquina de pelúcia
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome da Máquina *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipo_brinquedo">Tipo de Brinquedo *</Label>
                      <Input
                        id="tipo_brinquedo"
                        value={formData.tipo_brinquedo}
                        onChange={(e) => setFormData({...formData, tipo_brinquedo: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="localizacao">Localização *</Label>
                      <Input
                        id="localizacao"
                        value={formData.localizacao}
                        onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                        placeholder="Endereço completo"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                        placeholder="-23.5505"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                        placeholder="-46.6333"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({...formData, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativa">Ativa</SelectItem>
                          <SelectItem value="manutencao">Em Manutenção</SelectItem>
                          <SelectItem value="reabastecer">Precisa Reabastecer</SelectItem>
                          <SelectItem value="inativa">Inativa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacidade_total">Capacidade Total *</Label>
                      <Input
                        id="capacidade_total"
                        type="number"
                        value={formData.capacidade_total}
                        onChange={(e) => setFormData({...formData, capacidade_total: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estoque_atual">Estoque Atual *</Label>
                      <Input
                        id="estoque_atual"
                        type="number"
                        value={formData.estoque_atual}
                        onChange={(e) => setFormData({...formData, estoque_atual: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600">
                      Cadastrar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Machines Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredMachines.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma máquina cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece cadastrando sua primeira máquina
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMachines.map((machine) => (
                <Card key={machine.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{machine.nome}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {machine.localizacao}
                        </CardDescription>
                      </div>
                      {getStatusIcon(machine.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(machine.status)}`}>
                        {machine.status === 'ativa' && 'Ativa'}
                        {machine.status === 'manutencao' && 'Em Manutenção'}
                        {machine.status === 'reabastecer' && 'Reabastecer'}
                        {machine.status === 'inativa' && 'Inativa'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tipo:</span>
                      <span className="text-sm font-medium">{machine.tipo_brinquedo}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estoque:</span>
                        <span className="font-medium">
                          {machine.estoque_atual} / {machine.capacidade_total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            (machine.estoque_atual / machine.capacidade_total) > 0.5
                              ? 'bg-green-500'
                              : (machine.estoque_atual / machine.capacidade_total) > 0.2
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${(machine.estoque_atual / machine.capacidade_total) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-2">
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(machine.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
