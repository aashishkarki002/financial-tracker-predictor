"use client"

import { Card } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface IncomeExpenseChartProps {
  transactions: Transaction[]
}

export function IncomeExpenseChart({ transactions }: IncomeExpenseChartProps) {
  // Group transactions by month
  const monthlyData = new Map<string, { income: number; expenses: number }>()

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { income: 0, expenses: 0 })
    }

    const data = monthlyData.get(monthKey)!
    if (transaction.type === "income") {
      data.income += transaction.amount
    } else {
      data.expenses += Math.abs(transaction.amount)
    }
  })

  // Convert to array and sort by date
  const chartData = Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      income: data.income,
      expenses: data.expenses,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6) // Last 6 months

  const chartConfig = {
    income: {
      color: "hsl(var(--success))",
    },
    expenses: {
      color: "hsl(var(--destructive))",
    },
  }

  return (
    <Card className="p-6">
      <h3 className="mb-6 text-lg font-semibold text-foreground">Income vs Expenses</h3>
      {chartData.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No data available yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Bar dataKey="income" fill={chartConfig.income.color} name="Income" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill={chartConfig.expenses.color} name="Expenses" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
