'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { cn } from '@/lib/utils'
import { BarChart3 } from 'lucide-react'

export interface ConsultationsChartData {
  month: string
  count: number
}

export interface ConsultationsChartProps {
  data?: ConsultationsChartData[]
  className?: string
}

const chartConfig = {
  count: {
    label: 'Consultations',
    color: '#1B4F72',
  },
}

export function ConsultationsChart({
  data = [],
  className,
}: ConsultationsChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const average = data.length > 0 ? Math.round(total / data.length) : 0

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#1B4F72]" />
              Consultations par mois
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Moyenne: {average} consultations/mois
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-[#1B4F72]">{total}</span>
            <p className="text-xs text-muted-foreground">6 derniers mois</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 || data.every(d => d.count === 0) ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucune donnée disponible
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
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
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`${value} consultations`, 'Total']}
                  />
                }
              />
              <Bar
                dataKey="count"
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
