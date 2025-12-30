"use client"

import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Budget } from "@/lib/types"
import { formatCurrency, cn } from "@/lib/utils"
import { BudgetDialog } from "./budget-dialog"

interface BudgetCardProps {
  budget: Budget
  onUpdate: () => void
  onDelete: (id: string) => void
}

export function BudgetCard({ budget, onUpdate, onDelete }: BudgetCardProps) {
  const percentage = (budget.spent / budget.limit) * 100
  const isOverBudget = percentage > 100
  const isNearLimit = percentage > 80 && percentage <= 100

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{budget.category}</h3>
          <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
        </div>
        <div className="flex gap-2">
          <BudgetDialog
            budget={budget}
            onSave={onUpdate}
            trigger={
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <Button variant="ghost" size="icon" onClick={() => onDelete(budget.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-foreground">{formatCurrency(budget.spent)}</span>
          <span className="text-sm text-muted-foreground">of {formatCurrency(budget.limit)}</span>
        </div>
        <Progress
          value={Math.min(percentage, 100)}
          className={cn(
            "h-2",
            isOverBudget && "[&>div]:bg-destructive",
            isNearLimit && "[&>div]:bg-warning",
            !isOverBudget && !isNearLimit && "[&>div]:bg-success",
          )}
        />
        <div className="flex items-center justify-between text-sm">
          <span
            className={cn(
              "font-medium",
              isOverBudget && "text-destructive",
              isNearLimit && "text-warning",
              !isOverBudget && !isNearLimit && "text-success",
            )}
          >
            {percentage.toFixed(0)}% used
          </span>
          <span className="text-muted-foreground">{formatCurrency(budget.limit - budget.spent)} remaining</span>
        </div>
      </div>

      {isOverBudget && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3">
          <p className="text-sm font-medium text-destructive">
            Over budget by {formatCurrency(budget.spent - budget.limit)}
          </p>
        </div>
      )}
      {isNearLimit && !isOverBudget && (
        <div className="mt-4 rounded-md bg-warning/10 p-3">
          <p className="text-sm font-medium text-warning">Approaching budget limit</p>
        </div>
      )}
    </Card>
  )
}
