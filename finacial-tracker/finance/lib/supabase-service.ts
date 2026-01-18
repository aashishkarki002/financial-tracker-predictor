"use client";

import { supabase } from "./supabase";
import type { Transaction, Budget, Goal } from "./types";

// ============================================
// TRANSACTION FUNCTIONS
// ============================================

export interface TransactionInsert {
  date: string;
  amount: number;
  description?: string;
  category: string;
  type: "income" | "expense";
}

export interface TransactionUpdate extends Partial<TransactionInsert> {}

/**
 * Insert a new transaction
 */
export async function insertTransaction(
  transaction: TransactionInsert
): Promise<Transaction | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        date: transaction.date,
        amount: transaction.amount,
        description: transaction.description || null,
        category: transaction.category,
        type: transaction.type,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Convert to frontend Transaction type
    // Frontend expects negative amounts for expenses
    const amount = parseFloat(data.amount.toString());
    return {
      id: data.id,
      date: data.date,
      description: data.description || "",
      amount: data.type === "expense" ? -amount : amount,
      category: data.category,
      type: data.type as "income" | "expense",
    };
  } catch (error: any) {
    console.error("Error inserting transaction:", error);
    throw error;
  }
}

/**
 * Retrieve all transactions for the current user
 */
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (
      data?.map((item) => {
        // Frontend expects negative amounts for expenses
        const amount = parseFloat(item.amount.toString());
        return {
          id: item.id,
          date: item.date,
          description: item.description || "",
          amount: item.type === "expense" ? -amount : amount,
          category: item.category,
          type: item.type as "income" | "expense",
        };
      }) || []
    );
  } catch (error: any) {
    console.error("Error retrieving transactions:", error);
    return [];
  }
}

/**
 * Get transactions filtered by date range
 */
export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) {
      throw error;
    }

    return (
      data?.map((item) => {
        // Frontend expects negative amounts for expenses
        const amount = parseFloat(item.amount.toString());
        return {
          id: item.id,
          date: item.date,
          description: item.description || "",
          amount: item.type === "expense" ? -amount : amount,
          category: item.category,
          type: item.type as "income" | "expense",
        };
      }) || []
    );
  } catch (error: any) {
    console.error("Error retrieving transactions by date range:", error);
    return [];
  }
}

/**
 * Update a transaction
 */
export async function updateTransaction(
  id: string,
  updates: TransactionUpdate
): Promise<Transaction | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Frontend expects negative amounts for expenses
    const amount = parseFloat(data.amount.toString());
    return {
      id: data.id,
      date: data.date,
      description: data.description || "",
      amount: data.type === "expense" ? -amount : amount,
      category: data.category,
      type: data.type as "income" | "expense",
    };
  } catch (error: any) {
    console.error("Error updating transaction:", error);
    throw error;
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
}

// ============================================
// BUDGET FUNCTIONS
// ============================================

export interface BudgetInsert {
  category: string;
  limit: number;
  period: "weekly" | "monthly" | "yearly";
}

export interface BudgetUpdate extends Partial<BudgetInsert> {
  limit?: number;
  spent?: number;
}

/**
 * Insert a new budget
 */
export async function insertBudget(budget: BudgetInsert): Promise<Budget | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        category: budget.category,
        limit_amount: budget.limit,
        spent_amount: 0,
        period: budget.period,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      category: data.category,
      limit: parseFloat(data.limit_amount.toString()),
      spent: parseFloat(data.spent_amount.toString()),
      period: data.period as "monthly" | "weekly" | "yearly",
    };
  } catch (error: any) {
    console.error("Error inserting budget:", error);
    throw error;
  }
}

/**
 * Retrieve all budgets for the current user
 */
export async function getBudgets(): Promise<Budget[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .order("category", { ascending: true });

    if (error) {
      throw error;
    }

    return (
      data?.map((item) => ({
        id: item.id,
        category: item.category,
        limit: parseFloat(item.limit_amount.toString()),
        spent: parseFloat(item.spent_amount.toString()),
        period: item.period as "monthly" | "weekly" | "yearly",
      })) || []
    );
  } catch (error: any) {
    console.error("Error retrieving budgets:", error);
    return [];
  }
}

/**
 * Update a budget
 */
export async function updateBudget(
  id: string,
  updates: BudgetUpdate
): Promise<Budget | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const updateData: any = {};
    if (updates.limit !== undefined) {
      updateData.limit_amount = updates.limit;
    }
    if (updates.spent !== undefined) {
      updateData.spent_amount = updates.spent;
    }
    if (updates.category) {
      updateData.category = updates.category;
    }
    if (updates.period) {
      updateData.period = updates.period;
    }

    const { data, error } = await supabase
      .from("budgets")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      category: data.category,
      limit: parseFloat(data.limit_amount.toString()),
      spent: parseFloat(data.spent_amount.toString()),
      period: data.period as "monthly" | "weekly" | "yearly",
    };
  } catch (error: any) {
    console.error("Error updating budget:", error);
    throw error;
  }
}

/**
 * Delete a budget
 */
export async function deleteBudget(id: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error deleting budget:", error);
    throw error;
  }
}

// ============================================
// GOAL FUNCTIONS
// ============================================

export interface GoalInsert {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline: string;
  category: string;
}

export interface GoalUpdate extends Partial<GoalInsert> {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string;
  category?: string;
}

/**
 * Insert a new goal
 */
export async function insertGoal(goal: GoalInsert): Promise<Goal | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount || 0,
        deadline: goal.deadline,
        category: goal.category,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      targetAmount: parseFloat(data.target_amount.toString()),
      currentAmount: parseFloat(data.current_amount.toString()),
      deadline: data.deadline,
      category: data.category,
    };
  } catch (error: any) {
    console.error("Error inserting goal:", error);
    throw error;
  }
}

/**
 * Retrieve all goals for the current user
 */
export async function getGoals(): Promise<Goal[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("deadline", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return (
      data?.map((item) => ({
        id: item.id,
        name: item.name,
        targetAmount: parseFloat(item.target_amount.toString()),
        currentAmount: parseFloat(item.current_amount.toString()),
        deadline: item.deadline,
        category: item.category,
      })) || []
    );
  } catch (error: any) {
    console.error("Error retrieving goals:", error);
    return [];
  }
}

/**
 * Update a goal
 */
export async function updateGoal(
  id: string,
  updates: GoalUpdate
): Promise<Goal | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const updateData: any = {};
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.targetAmount !== undefined) {
      updateData.target_amount = updates.targetAmount;
    }
    if (updates.currentAmount !== undefined) {
      updateData.current_amount = updates.currentAmount;
    }
    if (updates.deadline !== undefined) {
      updateData.deadline = updates.deadline;
    }
    if (updates.category !== undefined) {
      updateData.category = updates.category;
    }

    const { data, error } = await supabase
      .from("goals")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      targetAmount: parseFloat(data.target_amount.toString()),
      currentAmount: parseFloat(data.current_amount.toString()),
      deadline: data.deadline,
      category: data.category,
    };
  } catch (error: any) {
    console.error("Error updating goal:", error);
    throw error;
  }
}

/**
 * Delete a goal
 */
export async function deleteGoal(id: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error deleting goal:", error);
    throw error;
  }
}

// ============================================
// USER PROFILE FUNCTIONS
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  full_name?: string;
  avatar_url?: string | null;
  phone?: string | null;
  currency?: string;
  timezone?: string;
}

/**
 * Get current user's profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      // Profile might not exist yet (for older users), create it
      if (error.code === "PGRST116") {
        return await createUserProfile(user.id, user.email || "");
      }
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      phone: data.phone,
      currency: data.currency || "USD",
      timezone: data.timezone || "UTC",
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error: any) {
    console.error("Error retrieving user profile:", error);
    return null;
  }
}

/**
 * Create a user profile (usually called automatically by trigger)
 */
export async function createUserProfile(
  userId: string,
  email: string,
  fullName?: string
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        id: userId,
        email: email,
        full_name: fullName || null,
        currency: "USD",
        timezone: "UTC",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      phone: data.phone,
      currency: data.currency || "USD",
      timezone: data.timezone || "UTC",
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error: any) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

/**
 * Update current user's profile
 */
export async function updateUserProfile(
  updates: UserProfileUpdate
): Promise<UserProfile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      phone: data.phone,
      currency: data.currency || "USD",
      timezone: data.timezone || "UTC",
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * Get user by ID (for admin or public profile viewing)
 */
export async function getUserProfileById(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      phone: data.phone,
      currency: data.currency || "USD",
      timezone: data.timezone || "UTC",
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error: any) {
    console.error("Error retrieving user profile by ID:", error);
    return null;
  }
}
