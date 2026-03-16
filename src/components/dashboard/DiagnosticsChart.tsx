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
import { Activity } from 'lucide-react'

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
    displayName: item.name.length > 25 
      ? item.name.substring(0, 25) + '...' 
      : item.name,
    fill: COLORS[index % COLORS.length],
  }))

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#148F77]" />
              Diagnostics fréquents
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Top 5 ce mois-ci
            </p>
          </div>
          {total > 0 && (
            <div className="text-right">
              <span className="text-lg font-bold text-[#148F77]">{total}</span>
              <p className="text-xs text-muted-foreground">cas</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <Activity className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucun diagnostic ce mois-ci
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart
              layout="vertical"
              data={formattedData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis
                dataKey="displayName"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                width={100}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`${value} cas`, 'Total']}
                  />
                }
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                maxBarSize={30}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
