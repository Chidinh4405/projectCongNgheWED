from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, analysis, chart

app = FastAPI(title="Data Dashboard API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://project-cong-nghe-wed.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký router
app.include_router(upload.router,   prefix="/upload")
app.include_router(analysis.router, prefix="/analysis")
app.include_router(chart.router,    prefix="/chart")

@app.get("/")
def root():
    return {"message": "Backend đang chạy!"}