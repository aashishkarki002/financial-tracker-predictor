import { AlertTriangle, CheckCircle, Info, Lightbulb } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Insight } from "@/lib/ai-insights"
import { cn } from "@/lib/utils"

interface InsightCardProps {
  insight: Insight
}

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
  tip: Lightbulb,
}

const colorMap = {
  warning: "text-warning",
  success: "text-success",
  info: "text-primary",
  tip: "text-chart-3",
}

const bgMap = {
  warning: "bg-warning/10",
  success: "bg-success/10",
  info: "bg-primary/10",
  tip: "bg-chart-3/10",
}

export function InsightCard({ insight }: InsightCardProps) {
  const Icon = iconMap[insight.type]

  return (
    <Card className="p-6">
      <div className="flex gap-4">
        <div className={cn("rounded-lg p-3", bgMap[insight.type])}>
          <Icon className={cn("h-6 w-6", colorMap[insight.type])} />
        </div>
        <div className="flex-1">
          <h3 className="mb-2 font-semibold text-foreground">{insight.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{insight.description}</p>
        </div>
      </div>
    </Card>
  )
}
