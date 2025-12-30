"use client"

import { Card } from "@/components/ui/card"
import type { Transaction } from "@/lib/types"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 5)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
      <div className="mt-4 space-y-4">
        {recentTransactions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No transactions yet. Add your first transaction to get started.
          </p>
        ) : (
          recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(transaction.date)} • {transaction.category}
                </p>
              </div>
              <p
                className={cn(
                  "text-lg font-semibold",
                  transaction.type === "income" ? "text-success" : "text-destructive",
                )}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(Math.abs(transaction.amount))}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
