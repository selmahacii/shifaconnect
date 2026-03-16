'use client'

import * as React from 'react'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Shield, User, Clock } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  createdAt: string
  user: {
    name: string
    email: string
  } | null
}

export default function AuditPage() {
  const [logs, setLogs] = React.useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/audit')
        if (response.ok) {
          const data = await response.json()
          setLogs(data.logs || [])
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Badge className="bg-green-500">Création</Badge>
      case 'UPDATE':
        return <Badge className="bg-blue-500">Modification</Badge>
      case 'DELETE':
        return <Badge className="bg-red-500">Suppression</Badge>
      default:
        return <Badge variant="secondary">{action}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Journal d&apos;audit
        </h1>
        <p className="text-muted-foreground">
          Historique des actions critiques effectuées sur la plateforme
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dernières activités</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entité</TableHead>
                <TableHead>ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Aucun log trouvé
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{log.user?.name || 'Système'}</span>
                        <span className="text-xs text-muted-foreground">{log.user?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.entityType}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.entityId}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
