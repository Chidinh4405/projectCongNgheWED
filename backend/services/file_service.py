import os
import uuid
import pandas as pd
from dotenv import load_dotenv

load_dotenv()
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/")

async def save_file(file) -> str:
    file_id = str(uuid.uuid4())
    filename = f"{file_id}_{file.filename}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        content = await file.read()
        f.write(content)

    return file_id

def find_file(file_id: str) -> str:
    for filename in os.listdir(UPLOAD_DIR):
        if filename.startswith(file_id):
            return os.path.join(UPLOAD_DIR, filename)
    raise FileNotFoundError(f"Không tìm thấy file: {file_id}")

def load_dataframe(file_id: str) -> pd.DataFrame:
    path = find_file(file_id)
    if path.endswith(".csv"):
        try:
            return pd.read_csv(path, encoding="utf-8")
        except UnicodeDecodeError:
            return pd.read_csv(path, encoding="latin1")
    elif path.endswith((".xlsx", ".xls")):
        return pd.read_excel(path)
    else:
        raise ValueError("Chỉ hỗ trợ CSV và Excel!")

def get_preview(file_id: str):
    df = load_dataframe(file_id)
    columns = list(df.columns)
    preview = df.head(10).fillna("").to_dict(orient="records")
    return columns, preview