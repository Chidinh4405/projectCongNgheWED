import axios from "axios";
import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const GOLD = "#C9A84C";
const GOLD_DARK = "#8B6914";
const GOLD_LIGHT = "#F5E6C0";
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
      borderRadius: 12, padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: 6,
      boxShadow: "0 2px 8px rgba(180,140,20,0.07)", minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: GOLD_DARK }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 1,
          textTransform: "uppercase", color: "#8B6914", fontFamily: "'Inter', sans-serif"
        }}>{label}</span>
      </div>
      <div style={{
        fontSize: 26, fontWeight: 700, color: "#2C1F00",
        fontFamily: "'Inter', sans-serif", letterSpacing: -0.5
      }}>{formatNum(value)}</div>
    </div>
  );
}

export default function ChartSection({ apiBase, fileId, columns }) {
  const [xCol, setXCol] = useState(columns[0] || "");
  const [yCol, setYCol] = useState(columns[columns.length - 1] || "");
  const [chartType, setChartType] = useState("bar");
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!fileId || !xCol || !yCol) return;
    setLoading(true);
    setError("");
    try {
      const [statsRes, chartRes] = await Promise.all([
        axios.post(`${apiBase}/analysis/`, {
          file_id: fileId,
          mapping: { value: yCol, date: xCol },
        }),
        axios.post(`${apiBase}/chart/${chartType}`, {
          file_id: fileId, x: xCol, y: yCol,
        }),
      ]);
      setStats(statsRes.data.data);
      const cd = chartRes.data.data;
      setChartData(cd.labels.map((l, i) => ({ name: l, value: cd.values[i] ?? 0 })));
    } catch (e) {
      setError(e?.response?.data?.detail || "Phân tích thất bại.");
    } finally {
      setLoading(false);
    }
  }

  const tip = {
    contentStyle: { background: "#fff", border: `1px solid ${GOLD_LIGHT}`, borderRadius: 8, fontSize: 12 },
    labelStyle: { color: GOLD_DARK, fontWeight: 600 },
  };

  const renderChart = () => {
    if (!chartData) return null;
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
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%"
            outerRadius={100} innerRadius={50} animationDuration={600}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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
    <div>
      {/* Chọn cột */}
      <div style={{
        marginBottom: 28, background: "#fff", borderRadius: 14,
        border: "1.5px solid #E8D5A0", padding: "20px 24px",
        boxShadow: "0 2px 8px rgba(180,140,20,0.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 4, height: 20, background: GOLD, borderRadius: 2 }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#2C1F00", fontFamily: "'Inter', sans-serif" }}>
            Chọn cột & vẽ biểu đồ
          </h3>
        </div>
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
                    flex: 1, padding: "9px 4px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                    border: `1.5px solid ${chartType === t ? GOLD : "#D4B872"}`,
                    background: chartType === t ? GOLD : "#FFFEF8",
                    color: chartType === t ? "#fff" : GOLD_DARK,
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleAnalyze} disabled={loading || !fileId}
            style={{
              padding: "10px 22px", borderRadius: 8, background: GOLD, color: "#fff", border: "none",
              fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif",
              opacity: loading ? 0.7 : 1, whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(180,140,20,0.25)",
            }}>
            {loading ? "⏳ Đang xử lý..." : "🔍 Phân tích"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FFF0F0", border: "1px solid #FFBABA", borderRadius: 10, padding: "12px 16px", color: "#C0392B", fontSize: 13, marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 4, height: 20, background: GOLD, borderRadius: 2 }} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#2C1F00", fontFamily: "'Inter', sans-serif" }}>Thống kê tổng quan</h3>
          </div>
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
        <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #E8D5A0", padding: "20px 24px", boxShadow: "0 2px 8px rgba(180,140,20,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 4, height: 20, background: GOLD, borderRadius: 2 }} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#2C1F00", fontFamily: "'Inter', sans-serif" }}>
                {yCol} theo {xCol}
              </h3>
            </div>
            <div style={{ background: GOLD_LIGHT, border: `1px solid ${GOLD}`, borderRadius: 20, padding: "3px 12px", fontSize: 11, color: GOLD_DARK, fontWeight: 700 }}>
              {chartType === "bar" ? "▦ Biểu đồ cột" : chartType === "line" ? "↗ Biểu đồ đường" : "◕ Biểu đồ tròn"}
            </div>
          </div>
          {renderChart()}
        </div>
      )}
    </div>
  );
}