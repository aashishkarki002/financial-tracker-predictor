"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Wallet, TrendingUp, TrendingDown, Target, Calendar, ArrowRight } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { RecentTransactions } from "@/components/recent-transactions"
import { IncomeExpenseChart } from "@/components/income-expense-chart"
import { CategoryPieChart } from "@/components/category-pie-chart"
import { SpendingTrendChart } from "@/components/spending-trend-chart"
import { getTransactions, getGoals } from "@/lib/supabase-service"
import type { Transaction, CategorySpending, Goal } from "@/lib/types"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load transactions and goals from Supabase
    const loadData = async () => {
      try {
        const [loadedTransactions, loadedGoals] = await Promise.all([
          getTransactions(),
          getGoals(),
        ])
        setTransactions(loadedTransactions)
        setGoals(loadedGoals)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Calculate statistics
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const balance = totalIncome - totalExpenses

  // Calculate spending by category
  const categoryMap = new Map<string, number>()
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const current = categoryMap.get(t.category) || 0
      categoryMap.set(t.category, current + Math.abs(t.amount))
    })

  const categorySpending: CategorySpending[] = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  // Filter active goals (not completed)
  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount).slice(0, 3) // Show top 3 active goals

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Overview of your financial health</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Current Balance" value={formatCurrency(balance)} icon={Wallet} iconColor="text-primary" />
        <StatCard title="Total Income" value={formatCurrency(totalIncome)} icon={TrendingUp} iconColor="text-success" />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          iconColor="text-destructive"
        />
        <StatCard
          title="Active Goals"
          value={activeGoals.length.toString()}
          icon={Target}
          iconColor="text-warning"
        />
      </div>

      {/* Comprehensive Charts Section */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <IncomeExpenseChart transactions={transactions} />
        <SpendingTrendChart transactions={transactions} />
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <CategoryPieChart data={categorySpending} />
        <RecentTransactions transactions={transactions} />
      </div>

      {/* Active Goals Section */}
      {activeGoals.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Active Goals</h2>
              <p className="mt-1 text-sm text-muted-foreground">Track your progress towards your financial goals</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/goals">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => {
              const percentage = (goal.currentAmount / goal.targetAmount) * 100
              const remaining = goal.targetAmount - goal.currentAmount
              const today = new Date()
              const deadlineDate = new Date(goal.deadline)
              const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              const isPastDeadline = daysRemaining < 0

              return (
                <Card key={goal.id} className="p-5">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-foreground">{goal.name}</h3>
                    <p className="text-sm text-muted-foreground">{goal.category}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold text-foreground">{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-xs text-muted-foreground">of {formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-primary">{percentage.toFixed(0)}% complete</span>
                      <span className="text-muted-foreground">{formatCurrency(remaining)} to go</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">Target: {formatDate(goal.deadline)}</p>
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
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
