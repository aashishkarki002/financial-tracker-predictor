"use client";

import type { Transaction, Budget, Goal } from "./types";
import type {
  BackendResponse,
  BackendComparison,
  NextMonthPredictionResponse,
} from "./api";

export type Insight = {
  id: string;
  type: "warning" | "success" | "info" | "tip";
  title: string;
  description: string;
  category?: string;
};

export type Prediction = {
  month: string;
  predicted: number;
  actual?: number;
};

/**
 * Transform backend predictions to frontend Prediction format
 */
export function transformBackendPredictions(
  backendData: BackendResponse,
  transactions: Transaction[]
): Prediction[] {
  const predictions: Prediction[] = [];

  // Get historical monthly data from transactions
  const monthlyData = new Map<string, number>();
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const current = monthlyData.get(monthKey) || 0;
      monthlyData.set(monthKey, current + Math.abs(t.amount));
    });

  // Add historical data (last 6 months)
  const sortedMonths = Array.from(monthlyData.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);

  sortedMonths.forEach(([month, amount]) => {
    const [year, monthNum] = month.split("-");
    const monthName = new Date(
      Number(year),
      Number(monthNum) - 1
    ).toLocaleDateString("en-US", { month: "short" });
    predictions.push({
      month: monthName,
      actual: amount,
      predicted: amount,
    });
  });

  // Add backend predictions for next month
  const categoryPredictions = backendData.category_predictions;
  const totalPredicted = Object.values(categoryPredictions).reduce(
    (sum, pred) => sum + pred.predicted_amount,
    0
  );

  if (totalPredicted > 0) {
    // Get the predicted month from the first category (they should all be the same)
    const firstPred = Object.values(categoryPredictions)[0];
    if (firstPred) {
      const predictedDate = new Date(firstPred.predicted_for_month);
      const monthName = predictedDate.toLocaleDateString("en-US", {
        month: "short",
      });

      // Check if we have actual data for this month
      const predictedMonthKey = `${predictedDate.getFullYear()}-${String(
        predictedDate.getMonth() + 1
      ).padStart(2, "0")}`;
      const actual = monthlyData.get(predictedMonthKey);

      predictions.push({
        month: monthName,
        predicted: totalPredicted,
        actual: actual,
      });
    }
  }

  return predictions;
}

/**
 * Transform next month prediction response to frontend Prediction format
 */
export function transformNextMonthPrediction(
  backendData: NextMonthPredictionResponse
): Prediction[] {
  const predictions: Prediction[] = [];

  // Add historical monthly expenses
  backendData.monthly_expenses.forEach((expense) => {
    const [year, monthNum] = expense.month.split("-");
    const monthName = new Date(
      Number(year),
      Number(monthNum) - 1
    ).toLocaleDateString("en-US", { month: "short" });

    predictions.push({
      month: monthName,
      actual: expense.total_amount,
      predicted: expense.total_amount,
    });
  });

  // Add prediction for next month
  if (backendData.monthly_expenses.length > 0) {
    // Calculate next month from the last month in the data
    const lastMonth =
      backendData.monthly_expenses[backendData.monthly_expenses.length - 1]
        .month;
    const [year, monthNum] = lastMonth.split("-");
    const nextMonthDate = new Date(Number(year), Number(monthNum) - 1, 1);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const nextMonthName = nextMonthDate.toLocaleDateString("en-US", {
      month: "short",
    });

    predictions.push({
      month: nextMonthName,
      predicted: backendData.predicted_next_month_expense,
    });
  }

  return predictions;
}

/**
 * Generate insights from backend comparison data
 */
export function generateInsightsFromBackend(
  backendData: BackendResponse
): Insight[] {
  const insights: Insight[] = [];
  const comparisons = backendData.comparison;

  Object.entries(comparisons).forEach(([category, comp]) => {
    if (comp.status === "over_spent") {
      insights.push({
        id: `backend-over-${category}`,
        type: "warning",
        title: "Prediction Alert: Overspending",
        description: `You've overspent in ${category} by $${Math.abs(
          comp.difference
        ).toFixed(
          2
        )} compared to the prediction. Predicted: $${comp.predicted.toFixed(
          2
        )}, Actual: $${comp.actual.toFixed(2)}.`,
        category: category,
      });
    } else if (comp.status === "under_spent") {
      insights.push({
        id: `backend-under-${category}`,
        type: "success",
        title: "Great Savings!",
        description: `You've spent $${Math.abs(comp.difference).toFixed(
          2
        )} less than predicted in ${category}. Keep up the good work!`,
        category: category,
      });
    } else if (comp.status === "on_track") {
      insights.push({
        id: `backend-track-${category}`,
        type: "success",
        title: "On Track",
        description: `Your spending in ${category} is exactly on track with predictions. Well done!`,
        category: category,
      });
    }
  });

  return insights;
}

export function generateInsights(
  transactions: Transaction[],
  budgets: Budget[],
  goals: Goal[]
): Insight[] {
  const insights: Insight[] = [];

  // Calculate monthly spending
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = transactions
    .filter((t) => {
      const date = new Date(t.date);
      return (
        t.type === "expense" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Analyze spending by category
  const categorySpending = new Map<string, number>();
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const current = categorySpending.get(t.category) || 0;
      categorySpending.set(t.category, current + Math.abs(t.amount));
    });

  // Insight 1: Highest spending category
  if (categorySpending.size > 0) {
    const topCategory = Array.from(categorySpending.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];
    insights.push({
      id: "top-spending",
      type: "info",
      title: "Top Spending Category",
      description: `You've spent the most on ${
        topCategory[0]
      } with a total of $${topCategory[1].toFixed(
        2
      )}. Consider setting a budget for this category.`,
      category: topCategory[0],
    });
  }

  // Insight 2: Budget warnings
  budgets.forEach((budget) => {
    const percentage = (budget.spent / budget.limit) * 100;
    if (percentage > 100) {
      insights.push({
        id: `budget-over-${budget.id}`,
        type: "warning",
        title: "Budget Exceeded",
        description: `Your ${budget.category} budget is ${percentage.toFixed(
          0
        )}% over the limit. You've overspent by $${(
          budget.spent - budget.limit
        ).toFixed(2)}.`,
        category: budget.category,
      });
    } else if (percentage > 80) {
      insights.push({
        id: `budget-near-${budget.id}`,
        type: "warning",
        title: "Budget Alert",
        description: `You're approaching your ${
          budget.category
        } budget limit at ${percentage.toFixed(
          0
        )}%. Consider reducing spending in this category.`,
        category: budget.category,
      });
    }
  });

  // Insight 3: Goal progress
  goals.forEach((goal) => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    const deadline = new Date(goal.deadline);
    const today = new Date();
    const daysRemaining = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (percentage >= 100) {
      insights.push({
        id: `goal-complete-${goal.id}`,
        type: "success",
        title: "Goal Achieved!",
        description: `Congratulations! You've reached your ${
          goal.name
        } goal of $${goal.targetAmount.toFixed(2)}.`,
      });
    } else if (daysRemaining < 0) {
      insights.push({
        id: `goal-overdue-${goal.id}`,
        type: "warning",
        title: "Goal Overdue",
        description: `Your ${
          goal.name
        } goal deadline has passed. You're ${percentage.toFixed(
          0
        )}% complete. Consider adjusting the deadline or increasing contributions.`,
      });
    } else if (daysRemaining <= 30 && percentage < 50) {
      insights.push({
        id: `goal-behind-${goal.id}`,
        type: "info",
        title: "Goal Progress Alert",
        description: `Your ${
          goal.name
        } goal has ${daysRemaining} days remaining but is only ${percentage.toFixed(
          0
        )}% complete. Consider increasing your savings rate.`,
      });
    }
  });

  // Insight 4: Spending trends
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthExpenses = transactions
    .filter((t) => {
      const date = new Date(t.date);
      return (
        t.type === "expense" &&
        date.getMonth() === lastMonth.getMonth() &&
        date.getFullYear() === lastMonth.getFullYear()
      );
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (lastMonthExpenses > 0 && monthlyExpenses > 0) {
    const percentageChange =
      ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    if (percentageChange > 20) {
      insights.push({
        id: "spending-increase",
        type: "warning",
        title: "Spending Increase Detected",
        description: `Your spending this month is ${percentageChange.toFixed(
          0
        )}% higher than last month. Review your recent transactions to identify opportunities to save.`,
      });
    } else if (percentageChange < -20) {
      insights.push({
        id: "spending-decrease",
        type: "success",
        title: "Great Job Saving!",
        description: `You've reduced your spending by ${Math.abs(
          percentageChange
        ).toFixed(0)}% compared to last month. Keep up the excellent work!`,
      });
    }
  }

  // Insight 5: Savings tips
  const monthlyIncome = transactions
    .filter((t) => {
      const date = new Date(t.date);
      return (
        t.type === "income" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  if (monthlyIncome > 0 && monthlyExpenses > 0) {
    const savingsRate =
      ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
    if (savingsRate < 10) {
      insights.push({
        id: "low-savings",
        type: "tip",
        title: "Improve Your Savings Rate",
        description: `You're saving only ${savingsRate.toFixed(
          1
        )}% of your income. Financial experts recommend saving at least 20% for financial security.`,
      });
    } else if (savingsRate >= 20) {
      insights.push({
        id: "good-savings",
        type: "success",
        title: "Excellent Savings Rate",
        description: `You're saving ${savingsRate.toFixed(
          1
        )}% of your income. This is above the recommended 20% savings rate. Keep it up!`,
      });
    }
  }

  return insights;
}

export function generatePredictions(transactions: Transaction[]): Prediction[] {
  const predictions: Prediction[] = [];
  const monthlyData = new Map<string, number>();

  // Group expenses by month
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const current = monthlyData.get(monthKey) || 0;
      monthlyData.set(monthKey, current + Math.abs(t.amount));
    });

  // Convert to array and sort
  const sortedMonths = Array.from(monthlyData.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  // Add actual data for past months
  sortedMonths.slice(-6).forEach(([month, amount]) => {
    const [year, monthNum] = month.split("-");
    const monthName = new Date(
      Number(year),
      Number(monthNum) - 1
    ).toLocaleDateString("en-US", { month: "short" });
    predictions.push({
      month: monthName,
      actual: amount,
      predicted: amount,
    });
  });

  // Calculate average for predictions
  const recentMonths = sortedMonths.slice(-3);
  const average =
    recentMonths.reduce((sum, [, amount]) => sum + amount, 0) /
    recentMonths.length;

  // Add predictions for next 3 months
  const today = new Date();
  for (let i = 1; i <= 3; i++) {
    const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthName = futureDate.toLocaleDateString("en-US", {
      month: "short",
    });
    predictions.push({
      month: monthName,
      predicted: average * (0.95 + Math.random() * 0.1), // Add slight variation
    });
  }

  return predictions.slice(-9); // Return last 6 months + next 3 predictions
}
