export type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  category: string
  type: "income" | "expense"
}

export type Budget = {
  id: string
  category: string
  limit: number
  spent: number
  period: "monthly" | "weekly" | "yearly"
}

export type Goal = {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: string
}

export type CategorySpending = {
  category: string
  amount: number
  percentage: number
}
