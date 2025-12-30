"use client"

import type { Transaction, Budget, Goal } from "./types"

const STORAGE_KEYS = {
  TRANSACTIONS: "finance-tracker-transactions",
  BUDGETS: "finance-tracker-budgets",
  GOALS: "finance-tracker-goals",
}

export const storageService = {
  // Transactions
  getTransactions: (): Transaction[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
    return data ? JSON.parse(data) : []
  },

  saveTransactions: (transactions: Transaction[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
  },

  addTransaction: (transaction: Transaction) => {
    const transactions = storageService.getTransactions()
    transactions.unshift(transaction)
    storageService.saveTransactions(transactions)
  },

  deleteTransaction: (id: string) => {
    const transactions = storageService.getTransactions()
    storageService.saveTransactions(transactions.filter((t) => t.id !== id))
  },

  updateTransaction: (id: string, updated: Transaction) => {
    const transactions = storageService.getTransactions()
    const index = transactions.findIndex((t) => t.id === id)
    if (index !== -1) {
      transactions[index] = updated
      storageService.saveTransactions(transactions)
    }
  },

  // Budgets
  getBudgets: (): Budget[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS)
    return data ? JSON.parse(data) : []
  },

  saveBudgets: (budgets: Budget[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets))
  },

  addBudget: (budget: Budget) => {
    const budgets = storageService.getBudgets()
    budgets.push(budget)
    storageService.saveBudgets(budgets)
  },

  deleteBudget: (id: string) => {
    const budgets = storageService.getBudgets()
    storageService.saveBudgets(budgets.filter((b) => b.id !== id))
  },

  updateBudget: (id: string, updated: Budget) => {
    const budgets = storageService.getBudgets()
    const index = budgets.findIndex((b) => b.id === id)
    if (index !== -1) {
      budgets[index] = updated
      storageService.saveBudgets(budgets)
    }
  },

  // Goals
  getGoals: (): Goal[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.GOALS)
    return data ? JSON.parse(data) : []
  },

  saveGoals: (goals: Goal[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals))
  },

  addGoal: (goal: Goal) => {
    const goals = storageService.getGoals()
    goals.push(goal)
    storageService.saveGoals(goals)
  },

  deleteGoal: (id: string) => {
    const goals = storageService.getGoals()
    storageService.saveGoals(goals.filter((g) => g.id !== id))
  },

  updateGoal: (id: string, updated: Goal) => {
    const goals = storageService.getGoals()
    const index = goals.findIndex((g) => g.id === id)
    if (index !== -1) {
      goals[index] = updated
      storageService.saveGoals(goals)
    }
  },
}
