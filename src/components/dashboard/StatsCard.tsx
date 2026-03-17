import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'

export type StatsCardVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'danger'

export interface StatsCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label?: string
    direction: 'up' | 'down' | 'neutral'
  }
  variant?: StatsCardVariant
  className?: string
  onClick?: () => void
}

const variantStyles: Record<StatsCardVariant, { bg: string; icon: string; text: string }> = {
  primary: {
    bg: 'bg-[#1B4F72]/10',
    icon: 'text-[#1B4F72]',
    text: 'text-[#1B4F72]',
  },
  secondary: {
    bg: 'bg-[#148F77]/10',
    icon: 'text-[#148F77]',
    text: 'text-[#148F77]',
  },
  accent: {
    bg: 'bg-[#F39C12]/10',
    icon: 'text-[#F39C12]',
    text: 'text-[#F39C12]',
  },
  success: {
    bg: 'bg-[#27AE60]/10',
    icon: 'text-[#27AE60]',
    text: 'text-[#27AE60]',
  },
  danger: {
    bg: 'bg-[#E74C3C]/10',
    icon: 'text-[#E74C3C]',
    text: 'text-[#E74C3C]',
  },
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'primary',
  className,
  onClick,
}: StatsCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn('rounded-lg p-2', styles.bg)}>
            <Icon className={cn('h-5 w-5', styles.icon)} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              {trend.direction === 'up' && (
                <>
                  <TrendingUp className="h-4 w-4 text-[#27AE60]" />
                  <span className="text-[#27AE60] font-medium">+{trend.value}%</span>
                </>
              )}
              {trend.direction === 'down' && (
                <>
                  <TrendingDown className="h-4 w-4 text-[#E74C3C]" />
                  <span className="text-[#E74C3C] font-medium">-{trend.value}%</span>
                </>
              )}
              {trend.direction === 'neutral' && (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">0%</span>
                </>
              )}
            </div>
          )}
        </div>
        {trend?.label && (
          <p className="mt-1 text-xs text-muted-foreground">{trend.label}</p>
        )}
      </CardContent>
    </Card>
  )
}
