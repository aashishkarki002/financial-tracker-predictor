"use client"

import { Pencil, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Goal } from "@/lib/types"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { GoalDialog } from "./goal-dialog"

interface GoalCardProps {
  goal: Goal
  onUpdate: () => void
  onDelete: (id: string) => void
}

export function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const percentage = (goal.currentAmount / goal.targetAmount) * 100
  const remaining = goal.targetAmount - goal.currentAmount
  const isComplete = percentage >= 100

  // Calculate days until deadline
  const today = new Date()
  const deadlineDate = new Date(goal.deadline)
  const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isPastDeadline = daysRemaining < 0

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{goal.name}</h3>
          <p className="text-sm text-muted-foreground">{goal.category}</p>
        </div>
        <div className="flex gap-2">
          <GoalDialog
            goal={goal}
            onSave={onUpdate}
            trigger={
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <Button variant="ghost" size="icon" onClick={() => onDelete(goal.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-foreground">{formatCurrency(goal.currentAmount)}</span>
          <span className="text-sm text-muted-foreground">of {formatCurrency(goal.targetAmount)}</span>
        </div>
        <Progress
          value={Math.min(percentage, 100)}
          className={cn("h-2", isComplete ? "[&>div]:bg-success" : "[&>div]:bg-primary")}
        />
        <div className="flex items-center justify-between text-sm">
          <span className={cn("font-medium", isComplete ? "text-success" : "text-primary")}>
            {percentage.toFixed(0)}% complete
          </span>
          <span className="text-muted-foreground">{formatCurrency(remaining)} to go</span>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Target: {formatDate(goal.deadline)}</p>
            <p
              className={cn(
                "text-xs",
                isPastDeadline ? "text-destructive" : daysRemaining <= 30 ? "text-warning" : "text-muted-foreground",
              )}
            >
              {isPastDeadline
                ? `${Math.abs(daysRemaining)} days overdue`
                : daysRemaining === 0
                  ? "Due today"
                  : `${daysRemaining} days remaining`}
            </p>
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="mt-4 rounded-md bg-success/10 p-3">
          <p className="text-sm font-medium text-success">Goal achieved! Congratulations!</p>
        </div>
      )}
    </Card>
  )
}
