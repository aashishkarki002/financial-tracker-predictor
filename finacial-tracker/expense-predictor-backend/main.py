# app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
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
        # Use cursor for proper parameter binding with psycopg2
        cursor = conn.cursor()
        cursor.execute(query, (user_id,))
        columns = [desc[0] for desc in cursor.description]
        data = cursor.fetchall()
        df = pd.DataFrame(data, columns=columns)
        cursor.close()
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

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error in predict_expense: {error_detail}")  # Log to console for debugging
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# Pydantic Models
# ============================================

class BudgetCreate(BaseModel):
    category: str
    limit: float
    period: str  # "weekly", "monthly", or "yearly"

class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    limit: Optional[float] = None
    period: Optional[str] = None
    spent: Optional[float] = None

class BudgetResponse(BaseModel):
    id: str
    category: str
    limit: float
    spent: float
    period: str

class GoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    deadline: date
    category: str

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    deadline: Optional[date] = None
    category: Optional[str] = None

class GoalResponse(BaseModel):
    id: str
    name: str
    target_amount: float
    current_amount: float
    deadline: date
    category: str

# ============================================
# BUDGET ENDPOINTS
# ============================================

@app.get("/budgets/{user_id}", response_model=List[BudgetResponse])
def get_budgets(user_id: str):
    """Get all budgets for a user"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
            SELECT id, category, limit_amount, spent_amount, period
            FROM budgets
            WHERE user_id = %s
            ORDER BY category, period
        """
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        budgets = []
        for row in rows:
            budgets.append({
                "id": str(row[0]),
                "category": row[1],
                "limit": float(row[2]),
                "spent": float(row[3]),
                "period": row[4]
            })

        return budgets
    except Exception as e:
        print(f"Error in get_budgets: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/budgets/{user_id}", response_model=BudgetResponse)
def create_budget(user_id: str, budget: BudgetCreate):
    """Create a new budget"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO budgets (user_id, category, limit_amount, spent_amount, period)
            VALUES (%s, %s, %s, 0, %s)
            RETURNING id, category, limit_amount, spent_amount, period
        """
        cursor.execute(query, (user_id, budget.category, budget.limit, budget.period))
        row = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        return {
            "id": str(row[0]),
            "category": row[1],
            "limit": float(row[2]),
            "spent": float(row[3]),
            "period": row[4]
        }
    except psycopg2.errors.UniqueViolation:
        raise HTTPException(status_code=400, detail="Budget already exists for this category and period")
    except Exception as e:
        print(f"Error in create_budget: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/budgets/{user_id}/{budget_id}", response_model=BudgetResponse)
def update_budget(user_id: str, budget_id: str, budget: BudgetUpdate):
    """Update a budget"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        updates = []
        values = []
        
        if budget.category is not None:
            updates.append("category = %s")
            values.append(budget.category)
        if budget.limit is not None:
            updates.append("limit_amount = %s")
            values.append(budget.limit)
        if budget.spent is not None:
            updates.append("spent_amount = %s")
            values.append(budget.spent)
        if budget.period is not None:
            updates.append("period = %s")
            values.append(budget.period)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        values.extend([user_id, budget_id])
        query = f"""
            UPDATE budgets
            SET {', '.join(updates)}
            WHERE user_id = %s AND id = %s
            RETURNING id, category, limit_amount, spent_amount, period
        """
        cursor.execute(query, values)
        row = cursor.fetchone()
        
        if not row:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Budget not found")

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "id": str(row[0]),
            "category": row[1],
            "limit": float(row[2]),
            "spent": float(row[3]),
            "period": row[4]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_budget: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/budgets/{user_id}/{budget_id}")
def delete_budget(user_id: str, budget_id: str):
    """Delete a budget"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = "DELETE FROM budgets WHERE user_id = %s AND id = %s RETURNING id"
        cursor.execute(query, (user_id, budget_id))
        row = cursor.fetchone()
        
        if not row:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Budget not found")

        conn.commit()
        cursor.close()
        conn.close()

        return {"message": "Budget deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in delete_budget: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# GOAL ENDPOINTS
# ============================================

@app.get("/goals/{user_id}", response_model=List[GoalResponse])
def get_goals(user_id: str):
    """Get all goals for a user"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
            SELECT id, name, target_amount, current_amount, deadline, category
            FROM goals
            WHERE user_id = %s
            ORDER BY deadline, name
        """
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        goals = []
        for row in rows:
            goals.append({
                "id": str(row[0]),
                "name": row[1],
                "target_amount": float(row[2]),
                "current_amount": float(row[3]),
                "deadline": row[4],
                "category": row[5]
            })

        return goals
    except Exception as e:
        print(f"Error in get_goals: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/goals/{user_id}", response_model=GoalResponse)
def create_goal(user_id: str, goal: GoalCreate):
    """Create a new goal"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, category)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, name, target_amount, current_amount, deadline, category
        """
        cursor.execute(query, (
            user_id, goal.name, goal.target_amount, goal.current_amount,
            goal.deadline, goal.category
        ))
        row = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        return {
            "id": str(row[0]),
            "name": row[1],
            "target_amount": float(row[2]),
            "current_amount": float(row[3]),
            "deadline": row[4],
            "category": row[5]
        }
    except Exception as e:
        print(f"Error in create_goal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/goals/{user_id}/{goal_id}", response_model=GoalResponse)
def update_goal(user_id: str, goal_id: str, goal: GoalUpdate):
    """Update a goal"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        updates = []
        values = []
        
        if goal.name is not None:
            updates.append("name = %s")
            values.append(goal.name)
        if goal.target_amount is not None:
            updates.append("target_amount = %s")
            values.append(goal.target_amount)
        if goal.current_amount is not None:
            updates.append("current_amount = %s")
            values.append(goal.current_amount)
        if goal.deadline is not None:
            updates.append("deadline = %s")
            values.append(goal.deadline)
        if goal.category is not None:
            updates.append("category = %s")
            values.append(goal.category)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        values.extend([user_id, goal_id])
        query = f"""
            UPDATE goals
            SET {', '.join(updates)}
            WHERE user_id = %s AND id = %s
            RETURNING id, name, target_amount, current_amount, deadline, category
        """
        cursor.execute(query, values)
        row = cursor.fetchone()
        
        if not row:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Goal not found")

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "id": str(row[0]),
            "name": row[1],
            "target_amount": float(row[2]),
            "current_amount": float(row[3]),
            "deadline": row[4],
            "category": row[5]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_goal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/goals/{user_id}/{goal_id}")
def delete_goal(user_id: str, goal_id: str):
    """Delete a goal"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = "DELETE FROM goals WHERE user_id = %s AND id = %s RETURNING id"
        cursor.execute(query, (user_id, goal_id))
        row = cursor.fetchone()
        
        if not row:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Goal not found")

        conn.commit()
        cursor.close()
        conn.close()

        return {"message": "Goal deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in delete_goal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
