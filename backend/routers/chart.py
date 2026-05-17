from fastapi import APIRouter, HTTPException
from services.data_service import get_chart_data

router = APIRouter()

@router.post("/{chart_type}")
def get_chart(chart_type: str, body: dict):
    if chart_type not in ["bar", "line", "pie"]:
        raise HTTPException(status_code=400, detail="chart_type phải là bar, line hoặc pie")

    try:
        file_id = body["file_id"]
        x_col   = body["x"]
        y_col   = body["y"]

        data = get_chart_data(file_id, chart_type, x_col, y_col)
        return {"success": True, "data": data}

    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Thiếu tham số: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))