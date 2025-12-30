"use client"

import { useEffect, useState } from "react"
import { Pencil, Trash2, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TransactionDialog } from "@/components/transaction-dialog"
import { storageService } from "@/lib/storage"
import type { Transaction } from "@/lib/types"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  const loadTransactions = () => {
    const loaded = storageService.getTransactions()
    setTransactions(loaded)
    setFilteredTransactions(loaded)
    setLoading(false)
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = transactions

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType)
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter((t) => t.category === filterCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredTransactions(filtered)
  }, [transactions, filterType, filterCategory, searchQuery])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      storageService.deleteTransaction(id)
      loadTransactions()
    }
  }

  const categories = Array.from(new Set(transactions.map((t) => t.category))).sort()

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
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="mt-2 text-muted-foreground">Track and manage all your transactions</p>
        </div>
        <TransactionDialog onSave={loadTransactions} />
      </div>

      {/* Filters */}
      <Card className="mb-6 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="p-6">
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery || filterType !== "all" || filterCategory !== "all"
                  ? "No transactions found matching your filters."
                  : "No transactions yet. Add your first transaction to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">Description</th>
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">Category</th>
                    <th className="pb-3 text-right text-sm font-semibold text-muted-foreground">Amount</th>
                    <th className="pb-3 text-right text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-border last:border-0">
                      <td className="py-4 text-sm text-foreground">{formatDate(transaction.date)}</td>
                      <td className="py-4 font-medium text-foreground">{transaction.description}</td>
                      <td className="py-4 text-sm text-muted-foreground">{transaction.category}</td>
                      <td
                        className={cn(
                          "py-4 text-right text-lg font-semibold",
                          transaction.type === "income" ? "text-success" : "text-destructive",
                        )}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <TransactionDialog
                            transaction={transaction}
                            onSave={loadTransactions}
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
