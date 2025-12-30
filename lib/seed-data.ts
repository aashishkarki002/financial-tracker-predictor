"use client"

import type { Transaction, Budget, Goal } from "./types"

export const dummyTransactions: Transaction[] = [
  // Income transactions
  {
    id: "t1",
    date: "2025-01-15",
    description: "Monthly Salary",
    amount: 5000,
    category: "Salary",
    type: "income",
  },
  {
    id: "t2",
    date: "2025-01-10",
    description: "Freelance Project",
    amount: 1200,
    category: "Freelance",
    type: "income",
  },
  {
    id: "t3",
    date: "2024-12-15",
    description: "Monthly Salary",
    amount: 5000,
    category: "Salary",
    type: "income",
  },

  // Expense transactions - Housing
  {
    id: "t4",
    date: "2025-01-01",
    description: "Monthly Rent",
    amount: 1500,
    category: "Housing",
    type: "expense",
  },
  {
    id: "t5",
    date: "2025-01-05",
    description: "Electric Bill",
    amount: 120,
    category: "Utilities",
    type: "expense",
  },
  {
    id: "t6",
    date: "2025-01-05",
    description: "Internet Bill",
    amount: 60,
    category: "Utilities",
    type: "expense",
  },

  // Groceries
  {
    id: "t7",
    date: "2025-01-18",
    description: "Whole Foods",
    amount: 145,
    category: "Groceries",
    type: "expense",
  },
  {
    id: "t8",
    date: "2025-01-12",
    description: "Target Groceries",
    amount: 89,
    category: "Groceries",
    type: "expense",
  },
  {
    id: "t9",
    date: "2025-01-06",
    description: "Trader Joe's",
    amount: 67,
    category: "Groceries",
    type: "expense",
  },

  // Dining
  {
    id: "t10",
    date: "2025-01-19",
    description: "Dinner at Italian Restaurant",
    amount: 85,
    category: "Dining",
    type: "expense",
  },
  {
    id: "t11",
    date: "2025-01-17",
    description: "Coffee Shop",
    amount: 12,
    category: "Dining",
    type: "expense",
  },
  {
    id: "t12",
    date: "2025-01-14",
    description: "Lunch Meeting",
    amount: 45,
    category: "Dining",
    type: "expense",
  },
  {
    id: "t13",
    date: "2025-01-11",
    description: "Pizza Delivery",
    amount: 28,
    category: "Dining",
    type: "expense",
  },
  {
    id: "t14",
    date: "2025-01-08",
    description: "Brunch with Friends",
    amount: 52,
    category: "Dining",
    type: "expense",
  },

  // Transportation
  {
    id: "t15",
    date: "2025-01-16",
    description: "Gas Station",
    amount: 55,
    category: "Transportation",
    type: "expense",
  },
  {
    id: "t16",
    date: "2025-01-09",
    description: "Uber Rides",
    amount: 38,
    category: "Transportation",
    type: "expense",
  },
  {
    id: "t17",
    date: "2025-01-03",
    description: "Car Insurance",
    amount: 150,
    category: "Transportation",
    type: "expense",
  },

  // Entertainment
  {
    id: "t18",
    date: "2025-01-13",
    description: "Movie Tickets",
    amount: 32,
    category: "Entertainment",
    type: "expense",
  },
  {
    id: "t19",
    date: "2025-01-07",
    description: "Spotify Subscription",
    amount: 10,
    category: "Entertainment",
    type: "expense",
  },
  {
    id: "t20",
    date: "2025-01-04",
    description: "Netflix Subscription",
    amount: 15,
    category: "Entertainment",
    type: "expense",
  },

  // Shopping
  {
    id: "t21",
    date: "2025-01-15",
    description: "New Shoes",
    amount: 89,
    category: "Shopping",
    type: "expense",
  },
  {
    id: "t22",
    date: "2025-01-10",
    description: "Amazon Order",
    amount: 67,
    category: "Shopping",
    type: "expense",
  },

  // Healthcare
  {
    id: "t23",
    date: "2025-01-08",
    description: "Pharmacy - Prescription",
    amount: 25,
    category: "Healthcare",
    type: "expense",
  },
  {
    id: "t24",
    date: "2025-01-02",
    description: "Gym Membership",
    amount: 50,
    category: "Healthcare",
    type: "expense",
  },
]

export const dummyBudgets: Budget[] = [
  {
    id: "b1",
    category: "Groceries",
    limit: 400,
    spent: 301,
    period: "monthly",
  },
  {
    id: "b2",
    category: "Dining",
    limit: 300,
    spent: 222,
    period: "monthly",
  },
  {
    id: "b3",
    category: "Transportation",
    limit: 250,
    spent: 243,
    period: "monthly",
  },
  {
    id: "b4",
    category: "Entertainment",
    limit: 100,
    spent: 57,
    period: "monthly",
  },
  {
    id: "b5",
    category: "Shopping",
    limit: 200,
    spent: 156,
    period: "monthly",
  },
  {
    id: "b6",
    category: "Utilities",
    limit: 200,
    spent: 180,
    period: "monthly",
  },
]

export const dummyGoals: Goal[] = [
  {
    id: "g1",
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 6500,
    deadline: "2025-12-31",
    category: "Savings",
  },
  {
    id: "g2",
    name: "New Laptop",
    targetAmount: 2000,
    currentAmount: 1400,
    deadline: "2025-03-31",
    category: "Technology",
  },
  {
    id: "g3",
    name: "Summer Vacation",
    targetAmount: 3500,
    currentAmount: 800,
    deadline: "2025-06-30",
    category: "Travel",
  },
  {
    id: "g4",
    name: "Car Down Payment",
    targetAmount: 5000,
    currentAmount: 2200,
    deadline: "2025-09-30",
    category: "Transportation",
  },
  {
    id: "g5",
    name: "Home Office Setup",
    targetAmount: 1500,
    currentAmount: 1550,
    deadline: "2025-01-31",
    category: "Home",
  },
]

export function seedDummyData() {
  if (typeof window === "undefined") return

  const STORAGE_KEYS = {
    TRANSACTIONS: "finance-tracker-transactions",
    BUDGETS: "finance-tracker-budgets",
    GOALS: "finance-tracker-goals",
  }

  // Only seed if no data exists
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(dummyTransactions))
  }

  if (!localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(dummyBudgets))
  }

  if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(dummyGoals))
  }
}
