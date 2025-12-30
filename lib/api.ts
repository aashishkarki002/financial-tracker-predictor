"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type BackendPrediction = {
  predicted_amount: number;
  predicted_for_month: string;
};

export type BackendComparison = {
  predicted: number;
  actual: number;
  difference: number;
  status: "over_spent" | "under_spent" | "on_track";
};

export type MonthlyExpense = {
  month: string;
  total_amount: number;
};

export type NextMonthPredictionResponse = {
  user_id: string;
  predicted_next_month_expense: number;
  monthly_expenses: MonthlyExpense[];
};

export const fetchNextMonthPrediction = async (
  userId: string
): Promise<NextMonthPredictionResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/predict/${userId}`);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Failed to fetch prediction");
    }
    const data = await res.json();
    return data as NextMonthPredictionResponse;
  } catch (err: any) {
    console.error("Failed to fetch prediction:", err);
    return null;
  }
};

export type BackendResponse = {
  user_id: string;
  category_predictions: Record<string, BackendPrediction>;
  comparison: Record<string, BackendComparison>;
};

export async function fetchCategoryPredictions(
  userId: string = "default"
): Promise<BackendResponse | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/predict/category-wise/${userId}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        // No expenses found - not an error, just no data
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch predictions from backend:", error);
    return null;
  }
}
