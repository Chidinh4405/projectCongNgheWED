from fastapi import APIRouter, HTTPException
from services.data_service import analyze

router = APIRouter()

@router.post("/")
async def get_analysis(body: dict):
    try:
        file_id   = body["file_id"]
        value_col = body["mapping"]["value"]
        date_col  = body["mapping"].get("date")

        result = analyze(file_id, value_col, date_col)
        return {"success": True, "data": result}

    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Thiếu tham số: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))