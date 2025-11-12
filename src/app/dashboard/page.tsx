'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  AlertTriangle, 
  TrendingUp,
  MapPin,
  FileText,
  Users,
  LogOut,
  Menu
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalMaquinas: 0,
    estoquesBaixos: 0,
    emManutencao: 0,
    ordensAbertas: 0
  })
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    checkUser()
    loadStats()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
    }
  }

  const loadStats = async () => {
    try {
      // Carregar estatísticas do banco
      const { data: machines } = await supabase
        .from('machines')
        .select('*')
      
      const { data: orders } = await supabase
        .from('ordem_servico')
        .select('*')
        .eq('status', 'aberta')

      setStats({
        totalMaquinas: machines?.length || 0,
        estoquesBaixos: machines?.filter(m => m.estoque_atual < m.capacidade_total * 0.2).length || 0,
        emManutencao: machines?.filter(m => m.status === 'manutencao').length || 0,
        ordensAbertas: orders?.length || 0
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Package, label: 'Máquinas', href: '/maquinas' },
    { icon: MapPin, label: 'Mapa', href: '/mapa' },
    { icon: FileText, label: 'Ordens de Serviço', href: '/ordens' },
    { icon: TrendingUp, label: 'Estoque', href: '/estoque' },
    { icon: Users, label: 'Usuários', href: '/usuarios' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-2 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Gestão de Máquinas
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
          mt-16 lg:mt-0
        `}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.href === '/dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Bem-vindo ao Dashboard
              </h2>
              <p className="text-muted-foreground">
                Visão geral das suas operações
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription className="text-blue-100">
                    Total de Máquinas
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold">
                    {stats.totalMaquinas}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    <span className="text-sm">Cadastradas</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription className="text-yellow-100">
                    Estoque Baixo
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold">
                    {stats.estoquesBaixos}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm">Requer atenção</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription className="text-red-100">
                    Em Manutenção
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold">
                    {stats.emManutencao}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    <span className="text-sm">Máquinas</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription className="text-purple-100">
                    Ordens Abertas
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold">
                    {stats.ordensAbertas}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Pendentes</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesse rapidamente as principais funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link href="/maquinas">
                    <Button className="w-full h-24 flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <Package className="h-8 w-8" />
                      <span>Gerenciar Máquinas</span>
                    </Button>
                  </Link>
                  <Link href="/ordens">
                    <Button className="w-full h-24 flex-col gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                      <FileText className="h-8 w-8" />
                      <span>Nova Ordem de Serviço</span>
                    </Button>
                  </Link>
                  <Link href="/mapa">
                    <Button className="w-full h-24 flex-col gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                      <MapPin className="h-8 w-8" />
                      <span>Ver no Mapa</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>
                  Últimas movimentações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Sistema iniciado</p>
                      <p className="text-sm text-muted-foreground">Configure suas máquinas para começar</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
