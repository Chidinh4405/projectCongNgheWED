from services.file_service import find_file, load_dataframe
from services.data_service import analyze
import os

# Lấy file_id đầu tiên trong uploads
files = os.listdir("uploads")
print("Files trong uploads:", files)

if files:
    file_id = files[0].split("_")[0]
    print("file_id:", file_id)
    
    try:
        df = load_dataframe(file_id)
        print("Columns:", list(df.columns))
        
        result = analyze(file_id, "Doanh thu")
        print("Kết quả:", result)
    except Exception as e:
        print("LỖI:", e)