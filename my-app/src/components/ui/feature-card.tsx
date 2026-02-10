import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

interface FeatureCardProps {
    title: string
    description: string
    icon?: LucideIcon
    iconColor?: string
    onClick?: () => void
    href?: string
    gradient?: boolean
    className?: string
    children?: React.ReactNode
}

export function FeatureCard({
    title,
    description,
    icon: Icon,
    iconColor = 'text-primary',
    onClick,
    href,
    gradient = false,
    className,
    children,
}: FeatureCardProps) {
    const isInteractive = onClick || href

    const CardContent = (
        <div
            className={cn(
                'group relative overflow-hidden rounded-xl p-6 transition-all duration-300',
                gradient ? 'gradient-border glass-card' : 'bg-card border border-border',
                isInteractive && 'cursor-pointer hover-lift hover-glow',
                className
            )}
            onClick={onClick}
        >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Animated background pattern */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
                {Icon && (
                    <div className={cn(
                        'inline-flex items-center justify-center rounded-lg p-3 mb-4 transition-all duration-300',
                        gradient ? 'bg-primary/10' : 'bg-primary/5',
                        'group-hover:scale-110 group-hover:rotate-3'
                    )}>
                        <Icon className={cn('h-6 w-6', iconColor)} />
                    </div>
                )}

                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                    {title}
                </h3>

                <p className="text-muted-foreground mb-4">
                    {description}
                </p>

                {children}

                {isInteractive && (
                    <div className="flex items-center text-sm font-medium text-primary mt-4 group-hover:gap-2 transition-all duration-300">
                        <span>Learn more</span>
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                )}
            </div>

            {/* Glow effect on hover */}
            {gradient && (
                <div className="absolute -bottom-2 -right-2 h-32 w-32 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}
        </div>
    )

    if (href) {
        return (
            <a href={href} className="block">
                {CardContent}
            </a>
        )
    }

    return CardContent
}
