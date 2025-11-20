'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'

interface MicroserviceStatus {
  name: string
  type: 'core' | 'external'
  url: string
  status: 'healthy' | 'unhealthy'
  version: string
  capabilities: string[]
  lastChecked: string
  error?: string
}

interface ServiceResponse {
  services: MicroserviceStatus[]
  totalServices: number
  healthyServices: number
  timestamp: string
}

export default function MicroservicesPage() {
  const [services, setServices] = useState<MicroserviceStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServiceStatus()
    const interval = setInterval(fetchServiceStatus, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchServiceStatus = async () => {
    try {
      setError(null)
      const response = await fetch('/api/microservices/services')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data: ServiceResponse = await response.json()
      setServices(data.services)
    } catch (error) {
      console.error('Failed to fetch service status:', error)
      setError(error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const openService = (url: string) => {
    window.open(url, '_blank')
  }

  const getStatusColor = (status: string): 'green' | 'red' | 'yellow' => {
    switch (status) {
      case 'healthy': return 'green'
      case 'unhealthy': return 'red'
      default: return 'yellow'
    }
  }

  const getTypeColor = (type: string): 'secondary' | 'outline' => {
    return type === 'core' ? 'secondary' : 'outline'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-600">Loading microservices...</div>
      </div>
    )
  }

  const healthyCount = services.filter(s => s.status === 'healthy').length
  const totalCount = services.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Microservices Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage your integrated microservices
          </p>
        </div>
        <Button onClick={fetchServiceStatus} variant="outline">
          🔄 Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="text-2xl font-bold text-blue-900">{totalCount}</div>
          <div className="text-blue-700">Total Services</div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100">
          <div className="text-2xl font-bold text-green-900">{healthyCount}</div>
          <div className="text-green-700">Healthy Services</div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="text-2xl font-bold text-purple-900">
            {Math.round((healthyCount / totalCount) * 100) || 0}%
          </div>
          <div className="text-purple-700">System Health</div>
        </Card>
      </div>

      {/* Service List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.name} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{service.url}</p>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                  <Badge variant={getTypeColor(service.type)}>
                    {service.type}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Service Info */}
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Version</h4>
                <p className="text-sm text-gray-600">{service.version}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Capabilities</h4>
                <div className="flex flex-wrap gap-1">
                  {service.capabilities.map((capability) => (
                    <Badge key={capability} variant="outline" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>

              {service.error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  <strong>Error:</strong> {service.error}
                </div>
              )}

              <div className="text-xs text-gray-500">
                Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              <Button 
                size="sm" 
                onClick={() => openService(service.url)}
                className="flex-1"
                disabled={service.status !== 'healthy'}
              >
                🌐 Open Service
              </Button>
              {service.name === 'data-anonymization-backend' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openService('http://localhost:3002')}
                >
                  🎨 Frontend
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {services.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Microservices Detected</h3>
          <p className="text-gray-600 mb-4">
            Start your microservices using Docker Compose to see them here.
          </p>
          <Button onClick={() => window.open('http://localhost:3001/docs', '_blank')}>
            📖 View Integration Guide
          </Button>
        </Card>
      )}
    </div>
  )
}
