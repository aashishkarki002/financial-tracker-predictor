# app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from sklearn.linear_model import LinearRegression
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# ------------------ Database ------------------
def get_connection():
    return psycopg2.connect(os.environ["DATABASE_URL"])

# ------------------ Prediction ------------------
def predict_next_month(df: pd.DataFrame):
    if len(df) < 2:
        return None  # Not enough data

    # Ensure month column is datetime
    df["month"] = pd.to_datetime(df["month"])
    df = df.sort_values("month").reset_index(drop=True)
    df["month_index"] = range(len(df))

    X = df[["month_index"]]
    y = df["total_amount"]

    model = LinearRegression()
    model.fit(X, y)

    next_month_index = [[df["month_index"].max() + 1]]
    prediction = model.predict(next_month_index)

    return round(float(prediction[0]), 2)

# ------------------ FastAPI App ------------------
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "Expense Predictor API running"}

@app.get("/predict/{user_id}")
def predict_expense(user_id: str):
    try:
        conn = get_connection()
        query = """
            SELECT DATE_TRUNC('month', date) AS month,
                   SUM(amount) AS total_amount
            FROM expenses
            WHERE user_id = %s
            GROUP BY month
            ORDER BY month
        """
        df = pd.read_sql(query, conn, params=[user_id])
        conn.close()

        if df.empty:
            raise HTTPException(status_code=404, detail="No expenses found")

        prediction = predict_next_month(df)

        if prediction is None:
            return {"message": "Not enough data to predict"}

        # Optional: return historical monthly expenses too
        monthly_expenses = df.copy()
        monthly_expenses["month"] = monthly_expenses["month"].dt.strftime("%Y-%m")
        monthly_expenses = monthly_expenses.to_dict(orient="records")

        return {
            "user_id": user_id,
            "predicted_next_month_expense": prediction,
            "monthly_expenses": monthly_expenses
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
