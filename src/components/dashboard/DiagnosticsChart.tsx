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
import { Activity, LayoutGrid } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface DiagnosticsChartData {
  name: string
  count: number
}

export interface DiagnosticsChartProps {
  data?: DiagnosticsChartData[]
  className?: string
}

const chartConfig = {
  count: {
    label: 'Cas',
    color: '#148F77',
  },
}

const COLORS = ['#148F77', '#1B4F72', '#F39C12', '#27AE60', '#3498DB']

export function DiagnosticsChart({
  data = [],
  className,
}: DiagnosticsChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  // Truncate long diagnosis names
  const formattedData = data.map((item, index) => ({
    ...item,
    displayName: item.name.length > 20 
      ? item.name.substring(0, 20) + '...' 
      : item.name,
    fill: COLORS[index % COLORS.length],
  }))

  return (
    <Card className={cn('h-full border-none shadow-md rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300', className)}>
      <CardHeader className="pb-2 border-b border-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
              <LayoutGrid className="h-4 w-4 text-[#148F77]" />
              Diagnostics fréquents
            </CardTitle>
            <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
              Top 5 ce mois-ci
            </p>
          </div>
          {total > 0 && (
            <div className="text-right">
              <span className="text-xl font-black text-[#148F77]">{total}</span>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Total cas</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center px-6">
            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <Activity className="h-6 w-6 text-slate-200" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Aucune donnée
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart
              layout="vertical"
              data={formattedData}
              margin={{ top: 0, right: 30, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
              />
              <YAxis
                dataKey="displayName"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                width={120}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(20, 143, 119, 0.05)' }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`${value} cas`, 'Consultations']}
                  />
                }
              />
              <Bar
                dataKey="count"
                radius={[0, 8, 8, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
