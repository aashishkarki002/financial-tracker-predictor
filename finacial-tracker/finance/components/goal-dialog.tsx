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
import type { Goal } from "@/lib/types"
import { insertGoal, updateGoal } from "@/lib/supabase-service"
import { toast } from "sonner"

interface GoalDialogProps {
  goal?: Goal
  onSave: () => void
  trigger?: React.ReactNode
}

const categories = [
  "Emergency Fund",
  "Vacation",
  "Home Purchase",
  "Car Purchase",
  "Education",
  "Retirement",
  "Investment",
  "Debt Payoff",
  "Other",
]

export function GoalDialog({ goal, onSave, trigger }: GoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Goal>>(
    goal || {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      deadline: "",
      category: "",
    },
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.targetAmount || !formData.deadline || !formData.category) {
      return
    }

    try {
      if (goal) {
        await updateGoal(goal.id, {
          name: formData.name,
          targetAmount: Number(formData.targetAmount),
          currentAmount: Number(formData.currentAmount) || 0,
          deadline: formData.deadline,
          category: formData.category,
        })
        toast.success("Goal updated successfully")
      } else {
        await insertGoal({
          name: formData.name,
          targetAmount: Number(formData.targetAmount),
          currentAmount: Number(formData.currentAmount) || 0,
          deadline: formData.deadline,
          category: formData.category,
        })
        toast.success("Goal created successfully")
      }

      onSave()
      setOpen(false)
      setFormData({
        name: "",
        targetAmount: 0,
        currentAmount: 0,
        deadline: "",
        category: "",
      })
    } catch (error: any) {
      console.error("Error saving goal:", error)
      toast.error(error.message || "Failed to save goal")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit Goal" : "Create Goal"}</DialogTitle>
          <DialogDescription>
            {goal ? "Update your savings goal details below." : "Set a savings target to work towards."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Goal Name</Label>
              <Input
                id="name"
                placeholder="e.g., Emergency Fund"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <Label htmlFor="targetAmount">Target Amount</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.targetAmount || ""}
                onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currentAmount">Current Amount</Label>
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.currentAmount || ""}
                onChange={(e) => setFormData({ ...formData, currentAmount: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline">Target Date</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{goal ? "Update" : "Create"} Goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
