'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from 'recharts'
import { cn } from '@/lib/utils'
import { Users } from 'lucide-react'

export interface AgeDistributionData {
  name: string
  value: number
}

export interface AgeDistributionChartProps {
  data?: AgeDistributionData[]
  className?: string
}

const COLORS = ['#1B4F72', '#148F77', '#F39C12', '#E74C3C']

const chartConfig = {
  '0-18 ans': {
    label: '0-18 ans',
    color: '#1B4F72',
  },
  '19-40 ans': {
    label: '19-40 ans',
    color: '#148F77',
  },
  '41-60 ans': {
    label: '41-60 ans',
    color: '#F39C12',
  },
  '60+ ans': {
    label: '60+ ans',
    color: '#E74C3C',
  },
}

export function AgeDistributionChart({
  data = [],
  className,
}: AgeDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  const dataWithColors = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }))

  const hasData = data.some(d => d.value > 0)

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-[#F39C12]" />
              Répartition par âge
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Patients par tranche d'âge
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-[#F39C12]">{total}</span>
            <p className="text-xs text-muted-foreground">patients</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucun patient enregistré
            </p>
          </div>
        ) : (
          <div className="h-[200px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <PieChart>
                <Pie
                  data={dataWithColors}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {dataWithColors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        const percent = total > 0 ? ((Number(value) / total) * 100).toFixed(1) : 0
                        return [`${value} patients (${percent}%)`, name]
                      }}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {dataWithColors.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
