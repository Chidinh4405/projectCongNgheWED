import { useState } from "react";

const GOLD = "#C9A84C";
const GOLD_DARK = "#8B6914";
const GOLD_LIGHT = "#F5E6C0";
const PAGE_SIZE = 5;

export default function PreviewTable({ columns, preview }) {
  const [page, setPage] = useState(0);

  const pagedPreview = preview.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(preview.length / PAGE_SIZE);

  if (!preview.length) return null;

  return (
    <div style={{
      marginBottom: 28, background: "#fff", borderRadius: 14,
      border: "1.5px solid #E8D5A0", overflow: "hidden",
      boxShadow: "0 2px 8px rgba(180,140,20,0.06)"
    }}>
      <div style={{
        padding: "16px 20px", borderBottom: "1px solid #F0E8CC",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 4, height: 20, background: GOLD, borderRadius: 2 }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#2C1F00", fontFamily: "'Inter', sans-serif" }}>
            Xem trước dữ liệu
          </h3>
        </div>
        <span style={{ fontSize: 11, color: GOLD_DARK, fontWeight: 600 }}>
          {preview.length} dòng · {columns.length} cột
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: GOLD_LIGHT }}>
              {columns.map(c => (
                <th key={c} style={{
                  padding: "10px 14px", textAlign: "left", fontWeight: 700,
                  color: GOLD_DARK, whiteSpace: "nowrap",
                  fontFamily: "'Inter', sans-serif", fontSize: 12
                }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedPreview.map((row, i) => (
              <tr key={i} style={{
                background: i % 2 === 0 ? "#fff" : "#FDFCF5",
                borderBottom: "1px solid #F5EDD5"
              }}>
                {columns.map(c => (
                  <td key={c} style={{ padding: "9px 14px", color: "#2C1F00", whiteSpace: "nowrap" }}>
                    {row[c] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{
          padding: "10px 20px", display: "flex", gap: 6,
          alignItems: "center", borderTop: "1px solid #F0E8CC"
        }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              padding: "4px 12px", borderRadius: 6, border: `1px solid ${GOLD}`,
              background: page === 0 ? "#faf8f0" : GOLD_LIGHT,
              color: GOLD_DARK, cursor: page === 0 ? "default" : "pointer", fontSize: 12
            }}
          >
            ‹ Trước
          </button>
          <span style={{ fontSize: 12, color: GOLD_DARK, fontWeight: 500 }}>
            Trang {page + 1}/{totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{
              padding: "4px 12px", borderRadius: 6, border: `1px solid ${GOLD}`,
              background: page === totalPages - 1 ? "#faf8f0" : GOLD_LIGHT,
              color: GOLD_DARK, cursor: page === totalPages - 1 ? "default" : "pointer", fontSize: 12
            }}
          >
            Sau ›
          </button>
        </div>
      )}
    </div>
  );
}