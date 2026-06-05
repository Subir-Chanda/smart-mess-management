import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { showSuccess, showError } from "../../utils/toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function PdfReports() {
  const [folders, setFolders] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchFolders();
  }, []);

  // ======================================
  // FETCH FOLDERS
  // ======================================

  const fetchFolders = async () => {
    try {
      const res = await axios.get(`${API}/api/pdf/folders`, { headers });
      setFolders(res.data.folders || []);
    } catch (error) {
      console.log(error);
    }
  };

  // ======================================
  // OPEN FOLDER
  // ======================================

  const openFolder = async (folderName) => {
    try {
      setLoading(true);
      setSelectedFolder(folderName);
      setReports([]);
      const res = await axios.get(`${API}/api/pdf/folder/${folderName}`, {
        headers,
      });
      setReports(res.data.reports || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // DOWNLOAD PDF — opens ImageKit URL directly
  // ======================================

  const downloadPdf = (report) => {
    if (!report.fileUrl) {
      showError("File URL not available.");
      return;
    }
    // Open the ImageKit URL in a new tab — browser handles download
    window.open(report.fileUrl, "_blank", "noopener,noreferrer");
  };

  // ======================================
  // DELETE PDF
  // ======================================

  const deletePdf = async (id) => {
    if (!window.confirm("Delete this PDF permanently?")) return;
    try {
      setDeleting(id);
      await axios.delete(`${API}/api/pdf/${id}`, { headers });
      showSuccess("PDF deleted successfully.");
      await openFolder(selectedFolder);
    } catch (error) {
      console.log(error);
      showError("Delete failed. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  // ======================================
  // STYLES
  // ======================================

  const cardStyle = {
    background: "white",
    padding: "16px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "16px",
    fontWeight: "600",
    transition: "0.2s",
    border: "2px solid transparent",
  };

  const selectedCardStyle = {
    ...cardStyle,
    border: "2px solid #02112b",
    background: "#f0f4ff",
  };

  const thStyle = {
    background: "#02112b",
    color: "white",
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "600",
  };

  const tdStyle = {
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px",
  };

  const btnDownload = {
    background: "#02112b",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  };

  const btnDelete = {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  };

  const btnDeleteDisabled = {
    ...btnDelete,
    background: "#fca5a5",
    cursor: "not-allowed",
  };

  return (
    <DashboardLayout>
      <div style={{ padding: "20px" }}>
        {/* PAGE TITLE */}
        <h1 style={{ marginBottom: "8px" }}>PDF Reports</h1>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>
          Click a folder to view its reports
        </p>

        {/* FOLDERS */}
        {folders.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "16px",
            }}
          >
            No PDF reports generated yet. Go to Monthly Calculation and click
            Generate All PDFs.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "15px",
              marginBottom: "40px",
            }}
          >
            {folders.map((folder) => (
              <div
                key={folder.folderName}
                onClick={() => openFolder(folder.folderName)}
                style={
                  selectedFolder === folder.folderName
                    ? selectedCardStyle
                    : cardStyle
                }
              >
                <span style={{ fontSize: "22px" }}>📁</span>
                {folder.folderName}
              </div>
            ))}
          </div>
        )}

        {/* REPORTS TABLE */}
        {selectedFolder && (
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            {/* TABLE HEADER */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "18px" }}>
                📁 {selectedFolder}
              </h2>
              <span
                style={{
                  background: "#f1f5f9",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                {reports.length} report{reports.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* LOADING */}
            {loading ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#94a3b8",
                }}
              >
                Loading...
              </div>
            ) : reports.length === 0 ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "15px",
                }}
              >
                No Reports Available in this folder
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Title</th>
                    <th style={thStyle}>Month</th>
                    <th style={thStyle}>Year</th>
                    <th style={thStyle}>Download</th>
                    {user.role === "admin" && <th style={thStyle}>Delete</th>}
                  </tr>
                </thead>

                <tbody>
                  {reports.map((report, index) => (
                    <tr
                      key={report._id}
                      style={{
                        background: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                      }}
                    >
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: "600" }}>
                        {report.title}
                      </td>
                      <td style={tdStyle}>{report.month}</td>
                      <td style={tdStyle}>{report.year}</td>

                      {/* DOWNLOAD */}
                      <td style={tdStyle}>
                        <button
                          style={btnDownload}
                          onClick={() => downloadPdf(report)}
                        >
                          ⬇ Download
                        </button>
                      </td>

                      {/* DELETE — ADMIN ONLY */}
                      {user.role === "admin" && (
                        <td style={tdStyle}>
                          <button
                            style={
                              deleting === report._id
                                ? btnDeleteDisabled
                                : btnDelete
                            }
                            disabled={deleting === report._id}
                            onClick={() => deletePdf(report._id)}
                          >
                            {deleting === report._id
                              ? "Deleting..."
                              : "🗑 Delete"}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default PdfReports;
