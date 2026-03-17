'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'

export type StatsCardVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'danger'

export interface StatsCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number
    label?: string
    direction: 'up' | 'down' | 'neutral'
  }
  variant?: StatsCardVariant
  className?: string
  onClick?: () => void
}

const variantStyles: Record<StatsCardVariant, { bg: string; icon: string; text: string; gradient: string }> = {
  primary: {
    bg: 'bg-[#1B4F72]/10',
    icon: 'text-[#1B4F72]',
    text: 'text-[#1B4F72]',
    gradient: 'from-[#1B4F72]/5 to-transparent'
  },
  secondary: {
    bg: 'bg-[#148F77]/10',
    icon: 'text-[#148F77]',
    text: 'text-[#148F77]',
    gradient: 'from-[#148F77]/5 to-transparent'
  },
  accent: {
    bg: 'bg-[#F39C12]/10',
    icon: 'text-[#F39C12]',
    text: 'text-[#F39C12]',
    gradient: 'from-[#F39C12]/5 to-transparent'
  },
  success: {
    bg: 'bg-[#27AE60]/10',
    icon: 'text-[#27AE60]',
    text: 'text-[#27AE60]',
    gradient: 'from-[#27AE60]/5 to-transparent'
  },
  danger: {
    bg: 'bg-[#E74C3C]/10',
    icon: 'text-[#E74C3C]',
    text: 'text-[#E74C3C]',
    gradient: 'from-[#E74C3C]/5 to-transparent'
  },
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  variant = 'primary',
  className,
  onClick,
}: StatsCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 group',
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", styles.gradient)} />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {title}
            </p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {value}
            </h3>
          </div>
          {icon && (
            <div className={cn(
              'rounded-xl p-3 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3', 
              styles.bg, 
              styles.icon
            )}>
              {icon}
            </div>
          )}
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            {trend && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-tighter",
                trend.direction === 'up' ? "bg-green-100 text-green-700" : 
                trend.direction === 'down' ? "bg-red-100 text-red-700" : 
                "bg-slate-100 text-slate-700"
              )}>
                {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
                {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
                {trend.direction === 'neutral' && <Minus className="h-3 w-3" />}
                {trend.value}%
              </div>
            )}
            {trend?.label && (
              <p className="text-[10px] font-medium text-slate-400">
                {trend.label}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
