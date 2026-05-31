import { useState } from "react";
import UploadZone from "./components/UploadZone";
import PreviewTable from "./components/PreviewTable";
import ChartSection from "./components/ChartSection";

const API_BASE = "https://projectcongnghewed.onrender.com";
const GOLD = "#C9A84C";
const GOLD_DARK = "#8B6914";

function Spinner() {
  const GOLD_LIGHT = "#F5E6C0";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
      <div style={{
        width: 36, height: 36,
        border: `3px solid ${GOLD_LIGHT}`,
        borderTop: `3px solid ${GOLD}`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const [fileId, setFileId] = useState(null);
  const [columns, setColumns] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleUploadSuccess(data) {
    setFileId(data.file_id);
    setColumns(data.columns);
    setPreview(data.preview);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF7", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "#fff", borderBottom: `3px solid ${GOLD}`, padding: "0 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, height: 64 }}>
          <div style={{ width: 36, height: 36, background: GOLD, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1A1200", fontFamily: "'Inter', sans-serif", letterSpacing: 0.3 }}>Data Dashboard</div>
            <div style={{ fontSize: 11, color: GOLD_DARK, letterSpacing: 0.5, fontWeight: 500 }}>PHÂN TÍCH DỮ LIỆU TRỰC QUAN</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 4, height: 20, background: GOLD, borderRadius: 2 }} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#2C1F00", fontFamily: "'Inter', sans-serif" }}>Upload dữ liệu</h3>
          </div>
          <UploadZone
            apiBase={API_BASE}
            onUploadSuccess={handleUploadSuccess}
            onError={setError}
            onLoadingChange={setLoading}
          />
        </div>

        {loading && <Spinner />}

        {error && (
          <div style={{ background: "#FFF0F0", border: "1px solid #FFBABA", borderRadius: 10, padding: "12px 16px", color: "#C0392B", fontSize: 13, marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        <PreviewTable columns={columns} preview={preview} />

        {columns.length > 0 && (
          <ChartSection apiBase={API_BASE} fileId={fileId} columns={columns} />
        )}

        {!fileId && !loading && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#B8A060" }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>📊</div>
            <div style={{ fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>Upload file CSV hoặc Excel để bắt đầu phân tích</div>
            <div style={{ fontSize: 12, marginTop: 6, color: "#C8B080" }}>Hỗ trợ kéo & thả trực tiếp vào ô trên</div>
          </div>
        )}
      </div>
    </div>
  );
}