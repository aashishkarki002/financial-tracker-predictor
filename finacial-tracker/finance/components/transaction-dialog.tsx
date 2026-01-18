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
import { insertTransaction, updateTransaction } from "@/lib/supabase-service"
import { toast } from "sonner"

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
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Transaction>>(
    transaction
      ? {
          ...transaction,
          amount: Math.abs(transaction.amount), // Display absolute value in form
        }
      : {
          type: "expense",
          category: "",
          description: "",
          amount: 0,
          date: new Date().toISOString().split("T")[0],
        },
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.description?.trim() || !formData.amount || !formData.category || !formData.date) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate amount is positive
    if (Number(formData.amount) <= 0) {
      toast.error("Amount must be greater than 0")
      return
    }

    setIsLoading(true)

    try {
      // Database stores positive amounts, type field indicates income/expense
      const amount = Math.abs(Number(formData.amount))
      
      const transactionData = {
        description: formData.description.trim(),
        amount: amount,
        category: formData.category,
        type: formData.type as "income" | "expense",
        date: formData.date,
      }

      if (transaction) {
        // Update existing transaction
        await updateTransaction(transaction.id, transactionData)
        toast.success("Transaction updated successfully")
      } else {
        // Insert new transaction
        const result = await insertTransaction(transactionData)
        if (!result) {
          throw new Error("Failed to insert transaction - no data returned")
        }
        toast.success("Transaction added successfully")
      }

      // Reset form and close dialog
      setFormData({
        type: "expense",
        category: "",
        description: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
      })
      setOpen(false)
      
      // Call onSave callback to refresh the list
      onSave()
    } catch (error: any) {
      console.error("Error saving transaction:", error)
      
      // Better error message extraction for Supabase errors
      let errorMessage = "Failed to save transaction"
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.error?.message) {
        errorMessage = error.error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : transaction ? "Update" : "Add"} Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
