"use client"

import { Card } from "@/components/ui/card"
import type { Prediction } from "@/lib/ai-insights"
import { formatCurrency } from "@/lib/utils"

interface PredictionChartProps {
  predictions: Prediction[]
}

export function PredictionChart({ predictions }: PredictionChartProps) {
  const maxValue = Math.max(...predictions.map((p) => p.actual || p.predicted))

  return (
    <Card className="p-6">
      <h3 className="mb-6 text-lg font-semibold text-foreground">Spending Predictions</h3>
      <div className="space-y-4">
        {predictions.map((prediction, index) => {
          const isPrediction = !prediction.actual
          const value = prediction.actual || prediction.predicted
          const height = (value / maxValue) * 100

          return (
            <div key={index}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  {prediction.month}
                  {isPrediction && <span className="ml-2 text-xs text-muted-foreground">(Predicted)</span>}
                </span>
                <span className="text-muted-foreground">{formatCurrency(value)}</span>
              </div>
              <div className="h-8 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={isPrediction ? "h-full bg-chart-3/60" : "h-full bg-primary"}
                  style={{ width: `${height}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-6 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-3/60" />
          <span className="text-muted-foreground">Predicted</span>
        </div>
      </div>
    </Card>
  )
}
