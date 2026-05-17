import pandas as pd
from services.file_service import load_dataframe

# Thống kê tự động
def analyze(file_id: str, value_col: str, date_col: str = None):
    df = load_dataframe(file_id)

    if value_col not in df.columns:
        raise ValueError(f"Không tìm thấy cột: {value_col}")

    series = pd.to_numeric(df[value_col], errors="coerce")
    series = series.fillna(0)
    return {
        "total_rows": int(len(df)),
        "mean":       round(float(series.mean()), 2),
        "max":        round(float(series.max()), 2),
        "min":        round(float(series.min()), 2),
        "sum":        round(float(series.sum()), 2),
        "null_count": int(series.isnull().sum()),
    }

# Trả data cho chart
def get_chart_data(file_id: str, chart_type: str, x_col: str, y_col: str):
    df = load_dataframe(file_id)

    for col in [x_col, y_col]:
        if col not in df.columns:
            raise ValueError(f"Không tìm thấy cột: {col}")

    if chart_type in ["bar", "pie"]:
        df[y_col] = pd.to_numeric(df[y_col], errors="coerce").fillna(0)
        grouped = df.groupby(x_col)[y_col].sum()
        return {
            "labels": list(grouped.index.astype(str)),
            "values": [float(v) for v in grouped.values]
        }

    return {
        "labels": list(df[x_col].astype(str)),
        "values": [float(v) for v in pd.to_numeric(df[y_col], errors="coerce").fillna(0)]
    }