"use client"

import { useEffect, useState } from "react"
import { Wallet, TrendingUp, TrendingDown, Target } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { RecentTransactions } from "@/components/recent-transactions"
import { IncomeExpenseChart } from "@/components/income-expense-chart"
import { CategoryPieChart } from "@/components/category-pie-chart"
import { SpendingTrendChart } from "@/components/spending-trend-chart"
import { storageService } from "@/lib/storage"
import { seedDummyData } from "@/lib/seed-data"
import type { Transaction, CategorySpending } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Seed dummy data on first load if no data exists
    seedDummyData()

    // Load transactions from localStorage
    const loadedTransactions = storageService.getTransactions()
    setTransactions(loadedTransactions)
    setLoading(false)
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
          value={storageService.getGoals().length.toString()}
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
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryPieChart data={categorySpending} />
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  )
}
