"use client";

import { useEffect, useState } from "react";
import { Brain, TrendingUp, AlertCircle } from "lucide-react";
import { InsightCard } from "@/components/insight-card";
import { PredictionChart } from "@/components/prediction-chart";
import { Card } from "@/components/ui/card";
import { storageService } from "@/lib/storage";
import { fetchNextMonthPrediction } from "@/lib/api";
import {
  generateInsights,
  generatePredictions,
  transformBackendPredictions,
  transformNextMonthPrediction,
  generateInsightsFromBackend,
  type Insight,
  type Prediction,
} from "@/lib/ai-insights";
import { fetchCategoryPredictions } from "@/lib/api";

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      const transactions = storageService.getTransactions();
      const budgets = storageService.getBudgets();
      const goals = storageService.getGoals();

      // Local insights
      const localInsights = generateInsights(transactions, budgets, goals);

      // Fetch backend prediction
      const backendPrediction = await fetchNextMonthPrediction(
        "11111111-1111-1111-1111-111111111111"
      ); // Test user ID

      let allInsights = [...localInsights];
      let finalPredictions: Prediction[] = [];

      if (backendPrediction) {
        // Transform backend prediction response to Prediction format
        finalPredictions = transformNextMonthPrediction(backendPrediction);
      } else {
        finalPredictions = generatePredictions(transactions); // fallback
      }

      setInsights(allInsights);
      setPredictions(finalPredictions);
      setLoading(false);
    }

    loadInsights();
  }, []);

  const warningInsights = insights.filter((i) => i.type === "warning");
  const successInsights = insights.filter((i) => i.type === "success");
  const otherInsights = insights.filter(
    (i) => i.type !== "warning" && i.type !== "success"
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">AI Insights</h1>
        <p className="mt-2 text-muted-foreground">
          Personalized financial recommendations based on your spending patterns
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Insights</p>
              <p className="text-2xl font-semibold text-foreground">
                {insights.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning/10 p-3">
              <AlertCircle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alerts</p>
              <p className="text-2xl font-semibold text-foreground">
                {warningInsights.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-3">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Achievements</p>
              <p className="text-2xl font-semibold text-foreground">
                {successInsights.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Insights Column */}
        <div className="space-y-6">
          {/* Warnings */}
          {warningInsights.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Alerts & Warnings
              </h2>
              <div className="space-y-4">
                {warningInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          )}

          {/* Success */}
          {successInsights.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Achievements
              </h2>
              <div className="space-y-4">
                {successInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          )}

          {/* Other Insights */}
          {otherInsights.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Tips & Recommendations
              </h2>
              <div className="space-y-4">
                {otherInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {insights.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <Brain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-lg font-medium text-foreground">
                  No insights yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Add transactions, budgets, and goals to get personalized
                  AI-powered insights.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Predictions Column */}
        <div>
          {predictions.length > 0 ? (
            <PredictionChart predictions={predictions} />
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-lg font-medium text-foreground">
                  No predictions available
                </p>
                <p className="text-sm text-muted-foreground">
                  Add more transaction history to generate spending predictions.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
