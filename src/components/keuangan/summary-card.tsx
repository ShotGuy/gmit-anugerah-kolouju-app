import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface SummaryCardProps {
    title: string;
    value: string | number;
    subtext?: string;
    icon: LucideIcon;
    iconColor?: string;
    bgColor?: string;
    textColor?: string;
    className?: string;
}

export function SummaryCard({
    title,
    value,
    subtext,
    icon: Icon,
    iconColor,
    bgColor,
    textColor,
    className
}: SummaryCardProps) {
    return (
        <Card className={cn("overflow-hidden relative", className)}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1.5 relative z-10 max-w-[85%]">
                        <p className="text-sm font-medium text-muted-foreground tracking-tight">{title}</p>
                        <p className={cn("text-2xl font-bold tracking-tight truncate", textColor)} title={String(value)}>
                            {value}
                        </p>
                        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
                    </div>
                    <div className={cn("p-2.5 rounded-xl shrink-0", iconColor ? `bg-opacity-10 ${iconColor.replace('text-', 'bg-')}` : "bg-muted/50")}>
                        <Icon className={cn("h-5 w-5", iconColor)} />
                    </div>
                </div>
                {bgColor && (
                    <div className={cn("absolute right-0 top-0 h-full w-24 opacity-20 -skew-x-12 translate-x-10", bgColor)} />
                )}
            </CardContent>
        </Card>
    )
}
