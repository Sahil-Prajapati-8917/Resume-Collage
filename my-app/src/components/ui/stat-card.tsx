import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    title: string
    value: string | number
    icon?: LucideIcon
    change?: string
    changeType?: 'positive' | 'negative' | 'neutral'
    description?: string
    gradient?: boolean
    animate?: boolean
    className?: string
}

export function StatCard({
    title,
    value,
    icon: Icon,
    change,
    changeType = 'neutral',
    description,
    gradient = false,
    animate = true,
    className,
}: StatCardProps) {
    const [displayValue, setDisplayValue] = useState(animate ? 0 : value)

    useEffect(() => {
        if (!animate || typeof value !== 'number') {
            setDisplayValue(value)
            return
        }

        const duration = 2000 // 2 seconds
        const steps = 60
        const increment = value / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setDisplayValue(value)
                clearInterval(timer)
            } else {
                setDisplayValue(Math.floor(current))
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [value, animate])

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-xl p-6 transition-all duration-300',
                gradient ? 'gradient-border glass-card' : 'bg-card border border-border',
                'hover-lift',
                className
            )}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                            {title}
                        </p>
                        <p className="text-3xl font-bold tracking-tight">
                            {displayValue}
                        </p>
                    </div>

                    {Icon && (
                        <div className={cn(
                            'rounded-lg p-3 transition-all duration-300',
                            gradient ? 'bg-primary/10' : 'bg-primary/5',
                            'group-hover:scale-110 group-hover:rotate-3'
                        )}>
                            <Icon className="h-6 w-6 text-primary" />
                        </div>
                    )}
                </div>

                {(change || description) && (
                    <div className="flex items-center gap-2">
                        {change && (
                            <span
                                className={cn(
                                    'text-sm font-medium',
                                    changeType === 'positive' && 'text-green-600 dark:text-green-400',
                                    changeType === 'negative' && 'text-red-600 dark:text-red-400',
                                    changeType === 'neutral' && 'text-muted-foreground'
                                )}
                            >
                                {change}
                            </span>
                        )}
                        {description && (
                            <span className="text-sm text-muted-foreground">
                                {description}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Subtle glow effect */}
            {gradient && (
                <div className="absolute -bottom-1 -right-1 h-24 w-24 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}
        </div>
    )
}
