'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { Users, PieChart as PieIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
    <Card className={cn('h-full border-none shadow-md rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300', className)}>
      <CardHeader className="pb-2 border-b border-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
              <PieIcon className="h-4 w-4 text-[#F39C12]" />
              Répartition par âge
            </CardTitle>
            <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
              Démographie patients
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-[#F39C12]">{total}</span>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Patients</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center px-6">
            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <Users className="h-6 w-6 text-slate-200" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Aucune donnée
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={dataWithColors}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {dataWithColors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity outline-none" />
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
              </ResponsiveContainer>
            </ChartContainer>
            
            {/* Legend Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 px-2">
              {dataWithColors.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 group cursor-default">
                  <div
                    className="h-2 w-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate leading-none">
                        {item.name}
                    </span>
                    <span className="text-xs font-black text-slate-900 mt-0.5">
                        {Math.round((item.value / total) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
