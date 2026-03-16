'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'

export interface RevenueData {
  date: string
  dayName: string
  revenue: number
  consultations: number
}

export interface RevenueChartProps {
  data?: RevenueData[]
  totalRevenue?: number
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
  className?: string
}

const chartConfig = {
  revenue: {
    label: 'Revenus',
    color: '#1B4F72',
  },
  consultations: {
    label: 'Consultations',
    color: '#148F77',
  },
}

const periodLabels: Record<string, string> = {
  week: '7 derniers jours',
  month: '30 derniers jours',
}

export function RevenueChart({
  data = [],
  totalRevenue = 0,
  trend,
  className,
}: RevenueChartProps) {
  const [period, setPeriod] = React.useState<'week' | 'month'>('week')

  // Format currency for display
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`
    }
    return value.toString()
  }

  // Calculate total and average for display
  const total = data.reduce((sum, item) => sum + item.revenue, 0)
  const average = data.length > 0 ? Math.round(total / data.length) : 0

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Revenus
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">
                {formatCurrency(totalRevenue || total)}
              </span>
              {trend && (
                <span
                  className={cn(
                    'flex items-center text-sm font-medium',
                    trend.direction === 'up' ? 'text-[#27AE60]' : 'text-[#E74C3C]'
                  )}
                >
                  {trend.direction === 'up' ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {trend.value}%
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Moyenne: {formatCurrency(average)}/jour
            </p>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as 'week' | 'month')}>
            <TabsList className="grid grid-cols-2 h-8">
              <TabsTrigger value="week" className="text-xs px-3">
                Semaine
              </TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3">
                Mois
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[250px] text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucune donnée de revenus disponible
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="dayName"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={formatYAxis}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      if (name === 'revenue') {
                        return formatCurrency(Number(value))
                      }
                      return value
                    }}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="#1B4F72"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
