import pandas as pd
from sklearn.linear_model import LinearRegression

def predict_next_month(df: pd.DataFrame):
    if len(df) < 2:
        return None  # not enough data

    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.to_period("M")

    monthly = df.groupby("month")["amount"].sum().reset_index()
    monthly["month_index"] = range(len(monthly))

    X = monthly[["month_index"]]
    y = monthly["amount"]

    model = LinearRegression()
    model.fit(X, y)

    next_month_index = [[monthly["month_index"].max() + 1]]
    prediction = model.predict(next_month_index)

    return round(float(prediction[0]), 2)
