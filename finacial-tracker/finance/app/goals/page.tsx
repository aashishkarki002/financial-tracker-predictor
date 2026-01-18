"use client"

import { useEffect, useState } from "react"
import { Trophy, Target } from "lucide-react"
import { GoalCard } from "@/components/goal-card"
import { GoalDialog } from "@/components/goal-dialog"
import { Card } from "@/components/ui/card"
import { getGoals, deleteGoal } from "@/lib/supabase-service"
import type { Goal } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const loadGoals = async () => {
    try {
      const loaded = await getGoals()
      setGoals(loaded)
    } catch (error) {
      console.error("Error loading goals:", error)
      toast.error("Failed to load goals")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGoals()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) {
      return
    }

    try {
      await deleteGoal(id)
      toast.success("Goal deleted successfully")
      await loadGoals()
    } catch (error: any) {
      console.error("Error deleting goal:", error)
      toast.error(error.message || "Failed to delete goal")
    }
  }

  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount)
  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount)
  const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const totalSavedAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Goals</h1>
          <p className="mt-2 text-muted-foreground">Track your savings progress towards important milestones</p>
        </div>
        <GoalDialog onSave={loadGoals} />
      </div>

      {/* Summary Stats */}
      {goals.length > 0 && (
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-semibold text-foreground">{activeGoals.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-3">
                <Trophy className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Goals</p>
                <p className="text-2xl font-semibold text-foreground">{completedGoals.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Progress</p>
              <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalSavedAmount)}</p>
              <p className="text-sm text-muted-foreground">of {formatCurrency(totalTargetAmount)}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Active Goals</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onUpdate={loadGoals} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Completed Goals</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onUpdate={loadGoals} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium text-foreground">No goals yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first financial goal to start tracking your savings progress.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
