"use client"

import { Card } from "@/components/ui/card"
import type { CategorySpending } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface SpendingChartProps {
  data: CategorySpending[]
}

export function SpendingChart({ data }: SpendingChartProps) {
  const colors = ["bg-primary", "bg-success", "bg-warning", "bg-destructive", "bg-muted-foreground"]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground">Spending by Category</h3>
      <div className="mt-6 space-y-4">
        {data.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No spending data available yet.</p>
        ) : (
          data.map((item, index) => (
            <div key={item.category}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{item.category}</span>
                <span className="text-muted-foreground">
                  {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className={`h-full ${colors[index % colors.length]}`} style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
