'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package } from 'lucide-react'

export default function EstoquePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Controle de Estoque</h1>
        <p className="text-gray-600">Gerencie o estoque de brinquedos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Funcionalidade de controle de estoque será implementada em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
