from fastapi import APIRouter, UploadFile, File, HTTPException
from services.file_service import save_file, get_preview

router = APIRouter()

ALLOWED_TYPES = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
 
    if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file CSV hoặc Excel!")

    file_id = await save_file(file)
    columns, preview = get_preview(file_id)

    return {
        "success":  True,
        "file_id":  file_id,
        "columns":  columns,
        "preview":  preview
    }