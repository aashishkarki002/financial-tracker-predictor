"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { BudgetCard } from "@/components/budget-card"
import { BudgetDialog } from "@/components/budget-dialog"
import { Card } from "@/components/ui/card"
import { storageService } from "@/lib/storage"
import type { Budget, Transaction } from "@/lib/types"

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  const loadBudgets = () => {
    const loadedBudgets = storageService.getBudgets()
    const transactions = storageService.getTransactions()

    // Calculate spent amount for each budget
    const updatedBudgets = loadedBudgets.map((budget) => {
      const categoryTransactions = transactions.filter(
        (t: Transaction) => t.category === budget.category && t.type === "expense",
      )

      const spent = categoryTransactions.reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0)

      return { ...budget, spent }
    })

    // Update budgets with calculated spent amounts
    updatedBudgets.forEach((budget) => {
      storageService.updateBudget(budget.id, budget)
    })

    setBudgets(updatedBudgets)
    setLoading(false)
  }

  useEffect(() => {
    loadBudgets()
  }, [])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      storageService.deleteBudget(id)
      loadBudgets()
    }
  }

  const overBudgetCount = budgets.filter((b) => (b.spent / b.limit) * 100 > 100).length

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
          <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
          <p className="mt-2 text-muted-foreground">Set and track spending limits for different categories</p>
        </div>
        <BudgetDialog onSave={loadBudgets} />
      </div>

      {overBudgetCount > 0 && (
        <Card className="mb-6 border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                {overBudgetCount} {overBudgetCount === 1 ? "budget is" : "budgets are"} over the limit
              </p>
              <p className="text-sm text-destructive/80">
                Consider adjusting your spending or increasing your budget limits.
              </p>
            </div>
          </div>
        </Card>
      )}

      {budgets.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-muted-foreground">
              No budgets yet. Create your first budget to start tracking spending limits.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onUpdate={loadBudgets} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
