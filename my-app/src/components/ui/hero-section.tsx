import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
    title: string
    subtitle?: string
    description?: string
    primaryAction?: {
        label: string
        onClick: () => void
    }
    secondaryAction?: {
        label: string
        onClick: () => void
    }
    gradient?: boolean
    className?: string
    children?: React.ReactNode
}

export function HeroSection({
    title,
    subtitle,
    description,
    primaryAction,
    secondaryAction,
    gradient = true,
    className,
    children,
}: HeroSectionProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl p-8 md:p-12 lg:p-16',
                gradient && 'gradient-primary animate-gradient',
                !gradient && 'bg-card',
                className
            )}
        >
            {/* Background pattern overlay */}
            {gradient && (
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            )}

            <div className="relative z-10 max-w-4xl">
                {subtitle && (
                    <p className="text-sm font-medium uppercase tracking-wider text-primary-foreground/80 mb-2 animate-fade-in">
                        {subtitle}
                    </p>
                )}

                <h1 className={cn(
                    'text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up',
                    gradient ? 'text-primary-foreground' : 'gradient-text'
                )}>
                    {title}
                </h1>

                {description && (
                    <p className={cn(
                        'text-lg md:text-xl mb-8 max-w-2xl animate-slide-up',
                        gradient ? 'text-primary-foreground/90' : 'text-muted-foreground'
                    )}>
                        {description}
                    </p>
                )}

                {(primaryAction || secondaryAction) && (
                    <div className="flex flex-wrap gap-4 animate-slide-up">
                        {primaryAction && (
                            <Button
                                size="lg"
                                onClick={primaryAction.onClick}
                                className={cn(
                                    'font-semibold',
                                    gradient && 'bg-white text-purple-600 hover:bg-white/90'
                                )}
                            >
                                {primaryAction.label}
                            </Button>
                        )}
                        {secondaryAction && (
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={secondaryAction.onClick}
                                className={cn(
                                    gradient && 'border-white/30 text-white hover:bg-white/10'
                                )}
                            >
                                {secondaryAction.label}
                            </Button>
                        )}
                    </div>
                )}

                {children && (
                    <div className="mt-8 animate-fade-in">
                        {children}
                    </div>
                )}
            </div>
        </div>
    )
}
