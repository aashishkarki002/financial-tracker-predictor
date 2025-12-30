"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Transaction } from "@/lib/types"
import { storageService } from "@/lib/storage"

interface TransactionDialogProps {
  transaction?: Transaction
  onSave: () => void
  trigger?: React.ReactNode
}

const categories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Income",
  "Other",
]

export function TransactionDialog({ transaction, onSave, trigger }: TransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Transaction>>(
    transaction || {
      type: "expense",
      category: "",
      description: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description || !formData.amount || !formData.category || !formData.date) {
      return
    }

    const transactionData: Transaction = {
      id: transaction?.id || crypto.randomUUID(),
      description: formData.description,
      amount: formData.type === "expense" ? -Math.abs(Number(formData.amount)) : Math.abs(Number(formData.amount)),
      category: formData.category,
      type: formData.type as "income" | "expense",
      date: formData.date,
    }

    if (transaction) {
      storageService.updateTransaction(transaction.id, transactionData)
    } else {
      storageService.addTransaction(transactionData)
    }

    onSave()
    setOpen(false)
    setFormData({
      type: "expense",
      category: "",
      description: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>
            {transaction ? "Update the transaction details below." : "Enter the details of your transaction below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as "income" | "expense" })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Grocery shopping"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{transaction ? "Update" : "Add"} Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
