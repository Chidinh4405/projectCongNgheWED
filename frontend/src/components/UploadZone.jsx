import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#F5E6C0";

export default function UploadZone({ apiBase, onUploadSuccess, onError, onLoadingChange }) {
  const onDrop = useCallback(async (accepted) => {
    const file = accepted[0];
    if (!file) return;
    onError("");
    onLoadingChange(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post(`${apiBase}/upload/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploadSuccess(res.data, file.name);
    } catch (e) {
      onError(e?.response?.data?.detail || "Upload thất bại. Kiểm tra lại server.");
    } finally {
      onLoadingChange(false);
    }
  }, [apiBase, onUploadSuccess, onError, onLoadingChange]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
    },
    multiple: false,
  });

  const fileName = acceptedFiles[0]?.name;

  return (
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
      <div style={{ fontSize: 12, color: "#A08030" }}>
        hoặc click để chọn từ máy tính · Hỗ trợ .csv, .xlsx
      </div>
      {fileName && (
        <div style={{
          marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6,
          background: GOLD_LIGHT, border: `1px solid ${GOLD}`, borderRadius: 20,
          padding: "4px 14px", fontSize: 12, color: "#8B6914", fontWeight: 600,
        }}>
          ✓ {fileName}
        </div>
      )}
    </div>
  );
}