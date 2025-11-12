'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Navigation } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Machine } from '@/lib/supabase'

export default function MapaPage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMachines()
  }, [])

  async function loadMachines() {
    try {
      const { data } = await supabase
        .from('machines')
        .select('*')
        .order('created_at', { ascending: false })

      setMachines(data || [])
    } catch (error) {
      console.error('Erro ao carregar máquinas:', error)
    } finally {
      setLoading(false)
    }
  }

  function getMarkerColor(status: Machine['status']) {
    switch (status) {
      case 'ativa':
        return 'bg-green-500'
      case 'manutencao':
        return 'bg-red-500'
      case 'estoque_baixo':
        return 'bg-yellow-500'
      case 'inativa':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  function getStatusLabel(status: Machine['status']) {
    switch (status) {
      case 'ativa':
        return 'Operando Normalmente'
      case 'manutencao':
        return 'Em Manutenção'
      case 'estoque_baixo':
        return 'Estoque Baixo'
      case 'inativa':
        return 'Inativa'
      default:
        return status
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mapa de Localização</h1>
        <p className="text-gray-600">Visualize todas as máquinas e seus status</p>
      </div>

      {/* Legenda */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-sm">Operando Normalmente</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-sm">Estoque Baixo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm">Em Manutenção</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-gray-500" />
              <span className="text-sm">Inativa</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapa Placeholder + Lista */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa Placeholder */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg h-[600px] flex items-center justify-center">
              <div className="text-center">
                <Navigation className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-2">Mapa Interativo</p>
                <p className="text-sm text-gray-600 max-w-md">
                  Integração com Google Maps ou Leaflet será implementada aqui.
                  <br />
                  Por enquanto, veja a lista de máquinas ao lado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Máquinas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Máquinas ({machines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : machines.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma máquina cadastrada
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto">
                {machines.map((machine) => {
                  const stockPercentage =
                    (machine.estoque_atual / machine.capacidade) * 100

                  return (
                    <div
                      key={machine.id}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${getMarkerColor(
                            machine.status
                          )}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {machine.nome}
                          </p>
                          <p className="text-sm text-gray-600 truncate">{machine.local}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getStatusLabel(machine.status)}
                          </p>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Estoque</span>
                              <span>{Math.round(stockPercentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  stockPercentage > 50
                                    ? 'bg-green-500'
                                    : stockPercentage > 20
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${stockPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
