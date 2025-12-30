"use client"

import { Card } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import type { CategorySpending } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface CategoryPieChartProps {
  data: CategorySpending[]
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
]

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-6 text-lg font-semibold text-foreground">Category Distribution</h3>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No spending data available yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percentage }) => `${category} ${percentage.toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
