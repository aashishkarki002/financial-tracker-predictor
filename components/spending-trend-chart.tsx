"use client"

import { Card } from "@/components/ui/card"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface SpendingTrendChartProps {
  transactions: Transaction[]
}

export function SpendingTrendChart({ transactions }: SpendingTrendChartProps) {
  // Group expenses by month
  const monthlyExpenses = new Map<string, number>()

  transactions
    .filter((t) => t.type === "expense")
    .forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyExpenses.has(monthKey)) {
        monthlyExpenses.set(monthKey, 0)
      }

      const current = monthlyExpenses.get(monthKey)!
      monthlyExpenses.set(monthKey, current + Math.abs(transaction.amount))
    })

  // Convert to array and sort by date
  const chartData = Array.from(monthlyExpenses.entries())
    .map(([month, amount]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      amount,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12) // Last 12 months

  return (
    <Card className="p-6">
      <h3 className="mb-6 text-lg font-semibold text-foreground">Spending Trend</h3>
      {chartData.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No spending data available yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
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
            <Line
              type="monotone"
              dataKey="amount"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
