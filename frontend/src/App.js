import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const API_BASE = "https://projectcongnghewed.onrender.com";

const GOLD = "#C9A84C";
const GOLD_DARK = "#8B6914";
const GOLD_LIGHT = "#F5E6C0";
const GOLD_MID = "#E8C97A";

const CHART_COLORS = [GOLD, GOLD_DARK, "#D4B06A", "#A07830", "#F0D898", "#7A5510"];

function formatNum(n) {
  if (n === null || n === undefined || n !== n) return "—";
  if (!isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return Number(n).toLocaleString("vi-VN");
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div style={{
      background: "#fff",
      border: `1.5px solid ${accent || "#E8D5A0"}`,
      borderRadius: 12,
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      boxShadow: "0 2px 8px rgba(180,140,20,0.07)",
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: GOLD_DARK }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#8B6914", fontFamily: "Georgia, serif" }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#2C1F00", fontFamily: "Georgia, serif", letterSpacing: -0.5 }}>{formatNum(value)}</div>
    </div>
  );
}

function Spinner() {
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

function SectionTitle({ children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
    }}>
      <div style={{ width: 4, height: 20, background: GOLD, borderRadius: 2 }} />
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#2C1F00", fontFamily: "Georgia, serif", letterSpacing: 0.2 }}>
        {children}
      </h3>
    </div>
  );
}

export default function App() {
  const [fileId, setFileId] = useState(null);
  const [columns, setColumns] = useState([]);
  const [preview, setPreview] = useState([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [chartType, setChartType] = useState("bar");

  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  const onDrop = useCallback(async (accepted) => {
    const file = accepted[0];
    if (!file) return;
    setError("");
    setLoading(true);
    setStats(null);
    setChartData(null);
    setFileId(null);
    setPreview([]);
    setColumns([]);
    setFileName(file.name);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post(`${API_BASE}/upload/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const d = res.data;
      setFileId(d.file_id);
      setColumns(d.columns);
      setPreview(d.preview);
      setXCol(d.columns[0] || "");
      setYCol(d.columns[d.columns.length - 1] || "");
      setPage(0);
    } catch (e) {
      setError(e?.response?.data?.detail || "Upload thất bại. Kiểm tra lại server.");
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
    multiple: false,
  });

  async function handleAnalyze() {
    if (!fileId || !xCol || !yCol) return;
    setChartLoading(true);
    setError("");
    try {
      const [statsRes, chartRes] = await Promise.all([
        axios.post(`${API_BASE}/analysis/`, {
          file_id: fileId,
          mapping: { value: yCol, date: xCol },
        }),
        axios.post(`${API_BASE}/chart/${chartType}`, {
          file_id: fileId,
          x: xCol,
          y: yCol,
        }),
      ]);
      setStats(statsRes.data.data);
      const cd = chartRes.data.data;
      setChartData(cd.labels.map((l, i) => ({ name: l, value: cd.values[i] ?? 0 })));
    } catch (e) {
      setError(e?.response?.data?.detail || "Phân tích thất bại.");
    } finally {
      setChartLoading(false);
    }
  }

  const pagedPreview = preview.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(preview.length / PAGE_SIZE);

  const renderChart = () => {
    if (!chartData) return null;
    const tip = {
      contentStyle: { background: "#fff", border: `1px solid ${GOLD_LIGHT}`, borderRadius: 8, fontSize: 12 },
      labelStyle: { color: GOLD_DARK, fontWeight: 600 },
    };
    if (chartType === "bar") return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0E8CC" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8B6914" }} angle={-30} textAnchor="end" />
          <YAxis tick={{ fontSize: 11, fill: "#8B6914" }} tickFormatter={formatNum} />
          <Tooltip {...tip} formatter={(v) => formatNum(v)} />
          <Bar dataKey="value" fill={GOLD} radius={[4, 4, 0, 0]} animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    );
    if (chartType === "line") return (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0E8CC" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8B6914" }} angle={-30} textAnchor="end" />
          <YAxis tick={{ fontSize: 11, fill: "#8B6914" }} tickFormatter={formatNum} />
          <Tooltip {...tip} formatter={(v) => formatNum(v)} />
          <Line type="monotone" dataKey="value" stroke={GOLD} strokeWidth={2.5} dot={{ fill: GOLD_DARK, r: 4 }} animationDuration={600} />
        </LineChart>
      </ResponsiveContainer>
    );
    if (chartType === "pie") return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
            innerRadius={50} animationDuration={600} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={{ stroke: GOLD_DARK }}>
            {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip {...tip} formatter={(v) => formatNum(v)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF7", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `3px solid ${GOLD}`, padding: "0 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, height: 64 }}>
          <div style={{
            width: 36, height: 36, background: GOLD, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1A1200", fontFamily: "Georgia, serif", letterSpacing: 0.3 }}>Data Dashboard</div>
            <div style={{ fontSize: 11, color: GOLD_DARK, letterSpacing: 0.5, fontWeight: 500 }}>PHÂN TÍCH DỮ LIỆU TRỰC QUAN</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {/* Upload Zone */}
        <div style={{ marginBottom: 24 }}>
          <SectionTitle>Upload dữ liệu</SectionTitle>
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? GOLD : "#D4B872"}`,
              borderRadius: 14,
              background: isDragActive ? GOLD_LIGHT : "#FFFEF8",
              padding: "36px 24px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              transform: isDragActive ? "scale(1.01)" : "scale(1)",
            }}
          >
            <input {...getInputProps()} />
            <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#2C1F00", marginBottom: 6 }}>
              {isDragActive ? "Thả file vào đây..." : "Kéo thả file CSV hoặc Excel vào đây"}
            </div>
            <div style={{ fontSize: 12, color: "#A08030" }}>hoặc click để chọn từ máy tính · Hỗ trợ .csv, .xlsx</div>
            {fileName && (
              <div style={{
                marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6,
                background: GOLD_LIGHT, border: `1px solid ${GOLD}`, borderRadius: 20,
                padding: "4px 14px", fontSize: 12, color: GOLD_DARK, fontWeight: 600,
              }}>
                ✓ {fileName}
              </div>
            )}
          </div>
        </div>

        {loading && <Spinner />}

        {error && (
          <div style={{
            background: "#FFF0F0", border: "1px solid #FFBABA", borderRadius: 10,
            padding: "12px 16px", color: "#C0392B", fontSize: 13, marginBottom: 20,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Preview Table */}
        {preview.length > 0 && (
          <div style={{ marginBottom: 28, background: "#fff", borderRadius: 14, border: `1.5px solid #E8D5A0`, overflow: "hidden", boxShadow: "0 2px 8px rgba(180,140,20,0.06)" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid #F0E8CC`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <SectionTitle>Xem trước dữ liệu</SectionTitle>
              <span style={{ fontSize: 11, color: GOLD_DARK, fontWeight: 600 }}>{preview.length} dòng · {columns.length} cột</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: GOLD_LIGHT }}>
                    {columns.map(c => (
                      <th key={c} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: GOLD_DARK, whiteSpace: "nowrap", fontFamily: "Georgia, serif", fontSize: 12 }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedPreview.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#FDFCF5", borderBottom: `1px solid #F5EDD5` }}>
                      {columns.map(c => (
                        <td key={c} style={{ padding: "9px 14px", color: "#2C1F00", whiteSpace: "nowrap" }}>{row[c] ?? ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ padding: "10px 20px", display: "flex", gap: 6, alignItems: "center", borderTop: `1px solid #F0E8CC` }}>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${GOLD}`, background: page === 0 ? "#faf8f0" : GOLD_LIGHT, color: GOLD_DARK, cursor: page === 0 ? "default" : "pointer", fontSize: 12 }}>
                  ‹ Trước
                </button>
                <span style={{ fontSize: 12, color: GOLD_DARK, fontWeight: 500 }}>Trang {page + 1}/{totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                  style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${GOLD}`, background: page === totalPages - 1 ? "#faf8f0" : GOLD_LIGHT, color: GOLD_DARK, cursor: page === totalPages - 1 ? "default" : "pointer", fontSize: 12 }}>
                  Sau ›
                </button>
              </div>
            )}
          </div>
        )}

        {/* Column Selection + Analyze */}
        {columns.length > 0 && (
          <div style={{ marginBottom: 28, background: "#fff", borderRadius: 14, border: `1.5px solid #E8D5A0`, padding: "20px 24px", boxShadow: "0 2px 8px rgba(180,140,20,0.06)" }}>
            <SectionTitle>Chọn cột & vẽ biểu đồ</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: GOLD_DARK, letterSpacing: 0.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Trục X (nhãn)</label>
                <select value={xCol} onChange={e => setXCol(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${GOLD}`, background: "#FFFEF8", fontSize: 13, color: "#2C1F00", outline: "none" }}>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: GOLD_DARK, letterSpacing: 0.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Trục Y (giá trị)</label>
                <select value={yCol} onChange={e => setYCol(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${GOLD}`, background: "#FFFEF8", fontSize: 13, color: "#2C1F00", outline: "none" }}>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: GOLD_DARK, letterSpacing: 0.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Loại biểu đồ</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["bar", "▦ Cột"], ["line", "↗ Đường"], ["pie", "◕ Tròn"]].map(([t, label]) => (
                    <button key={t} onClick={() => setChartType(t)}
                      style={{
                        flex: 1, padding: "9px 4px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                        border: `1.5px solid ${chartType === t ? GOLD : "#D4B872"}`,
                        background: chartType === t ? GOLD : "#FFFEF8",
                        color: chartType === t ? "#fff" : GOLD_DARK,
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleAnalyze} disabled={chartLoading || !fileId}
                style={{
                  padding: "10px 22px", borderRadius: 8, background: GOLD, color: "#fff", border: "none",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif",
                  opacity: chartLoading ? 0.7 : 1, transition: "opacity 0.2s", whiteSpace: "nowrap",
                  boxShadow: `0 2px 8px rgba(180,140,20,0.25)`,
                }}>
                {chartLoading ? "⏳ Đang xử lý..." : "🔍 Phân tích"}
              </button>
            </div>
          </div>
        )}

        {chartLoading && <Spinner />}

        {/* Stats Cards */}
        {stats && (
          <div style={{ marginBottom: 28 }}>
            <SectionTitle>Thống kê tổng quan</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              <StatCard label="Tổng dòng" value={stats.total_rows} icon="📋" />
              <StatCard label="Tổng cộng" value={stats.sum} icon="∑" accent={GOLD} />
              <StatCard label="Trung bình" value={stats.mean} icon="≈" />
              <StatCard label="Lớn nhất" value={stats.max} icon="▲" accent="#C9A84C" />
              <StatCard label="Nhỏ nhất" value={stats.min} icon="▼" />
              <StatCard label="Ô trống" value={stats.null_count} icon="○" accent={stats.null_count > 0 ? "#D4A017" : "#E8D5A0"} />
            </div>
          </div>
        )}

        {/* Chart */}
        {chartData && (
          <div style={{ background: "#fff", borderRadius: 14, border: `1.5px solid #E8D5A0`, padding: "20px 24px", boxShadow: "0 2px 8px rgba(180,140,20,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <SectionTitle>{yCol} theo {xCol}</SectionTitle>
              <div style={{
                background: GOLD_LIGHT, border: `1px solid ${GOLD}`, borderRadius: 20,
                padding: "3px 12px", fontSize: 11, color: GOLD_DARK, fontWeight: 700,
              }}>
                {chartType === "bar" ? "▦ Biểu đồ cột" : chartType === "line" ? "↗ Biểu đồ đường" : "◕ Biểu đồ tròn"}
              </div>
            </div>
            {renderChart()}
          </div>
        )}

        {/* Empty state */}
        {!fileId && !loading && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#B8A060" }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>📊</div>
            <div style={{ fontSize: 14, fontWeight: 500, fontFamily: "Georgia, serif" }}>Upload file CSV hoặc Excel để bắt đầu phân tích</div>
            <div style={{ fontSize: 12, marginTop: 6, color: "#C8B080" }}>Hỗ trợ kéo & thả trực tiếp vào ô trên</div>
          </div>
        )}
      </div>
    </div>
  );
}