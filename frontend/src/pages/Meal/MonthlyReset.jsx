import { useEffect, useState } from "react";
import axios from "axios";

const API = "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/monthly-reset";

export default function MonthlyReset() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [status, setStatus] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [pdfCheck, setPdfCheck] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showPdfBlockModal, setShowPdfBlockModal] = useState(false);
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [showConfirm2, setShowConfirm2] = useState(false);

  useEffect(() => {
    fetchStatus();
    fetchHistory();
  }, []);

  async function fetchStatus() {
    try {
      const res = await axios.get(`${API}/status`, { headers });
      setStatus(res.data);
      setSelectedMonth(res.data.nextMonth);
      setSelectedYear(res.data.nextYear);
      setPdfCheck(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchHistory() {
    try {
      const res = await axios.get(`${API}/history`, { headers });
      setHistory(res.data.logs || []);
    } catch (err) {}
  }

  async function handleSelectMonth(month, year) {
    setSelectedMonth(month);
    setSelectedYear(year);
    setResult(null);

    if (month === status?.currentMonth && year === status?.currentYear) {
      setPdfLoading(true);
      try {
        const res = await axios.get(`${API}/pdf-check`, {
          headers,
          params: { month, year },
        });
        setPdfCheck(res.data);
      } catch (err) {}
      setPdfLoading(false);
    } else {
      setPdfCheck(null);
    }
  }

  function handleResetClick() {
    if (
      selectedMonth === status?.currentMonth &&
      selectedYear === status?.currentYear &&
      pdfCheck &&
      !pdfCheck.allGenerated
    ) {
      setShowPdfBlockModal(true);
      return;
    }
    setShowConfirm1(true);
  }

  async function performReset() {
    setShowConfirm2(false);
    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/reset`,
        { month: selectedMonth, year: selectedYear },
        { headers },
      );
      setResult({ success: true, data: res.data });
      fetchHistory();
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.pdfBlocked) {
        setPdfCheck({ allGenerated: false, missingPdfs: errData.missingPdfs });
        setShowPdfBlockModal(true);
      } else {
        setResult({
          success: false,
          message: errData?.message || "Reset failed.",
        });
      }
    }
    setLoading(false);
  }

  if (!status) {
    return <div style={s.loading}>Loading...</div>;
  }

  const isCurrentSelected =
    selectedMonth === status.currentMonth &&
    selectedYear === status.currentYear;
  const hasMissingPdfs =
    isCurrentSelected && pdfCheck && !pdfCheck.allGenerated;

  return (
    <div style={s.page}>
      <h2 style={s.heading}>🔄 Monthly Reset</h2>
      <p style={s.sub}>
        Select the month you want to reset. All mess data for that month will be
        permanently deleted. Members, meal status, mashi rates, and guest meal
        rates are never affected.
      </p>

      {/* MONTH SELECTOR */}
      <div style={s.selectorRow}>
        <button
          style={{
            ...s.monthBtn,
            ...(isCurrentSelected ? s.monthBtnActive : {}),
          }}
          onClick={() =>
            handleSelectMonth(status.currentMonth, status.currentYear)
          }
        >
          <span style={s.btnLabel}>CURRENT MONTH</span>
          <span style={s.btnMonth}>
            {status.currentMonth} {status.currentYear}
          </span>
        </button>

        <button
          style={{
            ...s.monthBtn,
            ...(!isCurrentSelected ? s.monthBtnActive : {}),
          }}
          onClick={() => handleSelectMonth(status.nextMonth, status.nextYear)}
        >
          <span style={s.btnLabel}>NEXT MONTH</span>
          <span style={s.btnMonth}>
            {status.nextMonth} {status.nextYear}
          </span>
        </button>
      </div>

      {/* PDF STATUS CARD — current month only */}
      {isCurrentSelected && (
        <div
          style={{
            ...s.infoCard,
            borderColor: hasMissingPdfs ? "#f97316" : "#22c55e",
          }}
        >
          {pdfLoading ? (
            <p style={s.infoText}>Checking PDF status...</p>
          ) : pdfCheck ? (
            <>
              <p
                style={{
                  ...s.infoTitle,
                  color: hasMissingPdfs ? "#9a3412" : "#166534",
                }}
              >
                {hasMissingPdfs
                  ? "⚠️ PDFs Not Generated Yet"
                  : "✅ All PDFs Generated"}
              </p>
              {hasMissingPdfs ? (
                <>
                  <p style={s.infoText}>
                    The following PDFs must be generated before you can reset{" "}
                    <strong>
                      {selectedMonth} {selectedYear}
                    </strong>
                    :
                  </p>
                  <ul style={s.missingList}>
                    {pdfCheck.missingPdfs.map((name) => (
                      <li key={name} style={s.missingItem}>
                        ❌ {name}
                      </li>
                    ))}
                  </ul>
                  <p style={s.infoHint}>
                    Go to <strong>PDF Reports</strong> page, generate the
                    missing PDFs, then come back here to reset.
                  </p>
                </>
              ) : (
                <p style={s.infoText}>
                  All 5 PDFs for {selectedMonth} {selectedYear} have been
                  generated. Safe to reset.
                </p>
              )}
            </>
          ) : (
            <p style={s.infoText}>Select current month to check PDF status.</p>
          )}
        </div>
      )}

      {/* INFO CARD — next month */}
      {!isCurrentSelected && (
        <div style={{ ...s.infoCard, borderColor: "#3b82f6" }}>
          <p style={{ ...s.infoTitle, color: "#1e40af" }}>
            ℹ️ Setting Up {selectedMonth} {selectedYear}
          </p>
          <p style={s.infoText}>
            This will clear any accidental data entered for{" "}
            <strong>
              {selectedMonth} {selectedYear}
            </strong>{" "}
            and prepare a fresh start. No PDF check needed for a future month.
          </p>
        </div>
      )}

      {/* RESET BUTTON */}
      <button
        style={{
          ...s.resetBtn,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
        onClick={handleResetClick}
        disabled={loading}
      >
        {loading ? "Resetting..." : `🔄 Reset ${selectedMonth} ${selectedYear}`}
      </button>

      {/* RESULT CARD */}
      {result && (
        <div
          style={{
            ...s.resultCard,
            borderColor: result.success ? "#22c55e" : "#ef4444",
            backgroundColor: result.success ? "#f0fdf4" : "#fef2f2",
          }}
        >
          {result.success ? (
            <>
              <p style={{ ...s.resultTitle, color: "#166534" }}>
                ✅ {result.data.message}
              </p>
              <table style={s.resultTable}>
                <tbody>
                  {Object.entries(result.data.deletedCounts).map(
                    ([key, val]) => (
                      <tr key={key}>
                        <td style={s.rtd}>{key}</td>
                        <td style={{ ...s.rtd, fontWeight: 700 }}>{val}</td>
                      </tr>
                    ),
                  )}
                  <tr>
                    <td style={{ ...s.rtd, fontWeight: 700 }}>TOTAL</td>
                    <td style={{ ...s.rtd, fontWeight: 700 }}>
                      {result.data.totalRecords}
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <p style={{ color: "#991b1b" }}>❌ {result.message}</p>
          )}
        </div>
      )}

      {/* HISTORY */}
      {history.length > 0 && (
        <div style={s.historySection}>
          <h3 style={s.historyTitle}>Reset History</h3>
          <table style={s.table}>
            <thead>
              <tr>
                {["Month", "Year", "Reset By", "Total Deleted", "Date"].map(
                  (h) => (
                    <th key={h} style={s.th}>
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {history.map((log) => (
                <tr key={log._id}>
                  <td style={s.td}>{log.month}</td>
                  <td style={s.td}>{log.year}</td>
                  <td style={s.td}>
                    {log.resetBy ? log.resetBy.name : "Auto System"}
                  </td>
                  <td style={s.td}>
                    {Object.values(log.deletedCounts || {}).reduce(
                      (a, b) => a + b,
                      0,
                    )}
                  </td>
                  <td style={s.td}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: PDF NOT GENERATED */}
      {showPdfBlockModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalIcon}>🚫</div>
            <h3 style={{ ...s.modalTitle, color: "#9a3412" }}>
              PDFs Not Generated
            </h3>
            <p style={s.modalMsg}>
              You cannot reset{" "}
              <strong>
                {selectedMonth} {selectedYear}
              </strong>{" "}
              until all PDF reports are generated. Missing:
            </p>
            <ul style={s.missingList}>
              {(pdfCheck?.missingPdfs || []).map((name) => (
                <li key={name} style={s.missingItem}>
                  ❌ {name}
                </li>
              ))}
            </ul>
            <p style={s.modalHint}>
              Go to <strong>PDF Reports</strong> → generate the missing PDFs →
              come back and reset.
            </p>
            <button
              style={s.modalOkBtn}
              onClick={() => setShowPdfBlockModal(false)}
            >
              OK, I'll Generate Them First
            </button>
          </div>
        </div>
      )}

      {/* MODAL: FIRST CONFIRM */}
      {showConfirm1 && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalIcon}>⚠️</div>
            <h3 style={s.modalTitle}>Start Reset?</h3>
            <p style={s.modalMsg}>
              Start new month reset for{" "}
              <strong>
                {selectedMonth} {selectedYear}
              </strong>
              ?<br />
              This will permanently delete all mess data for this month.
            </p>
            <div style={s.modalBtns}>
              <button
                style={s.modalCancelBtn}
                onClick={() => setShowConfirm1(false)}
              >
                Cancel
              </button>
              <button
                style={s.modalDangerBtn}
                onClick={() => {
                  setShowConfirm1(false);
                  setShowConfirm2(true);
                }}
              >
                Yes, Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FINAL CONFIRM */}
      {showConfirm2 && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalIcon}>🔴</div>
            <h3 style={{ ...s.modalTitle, color: "#991b1b" }}>
              Final Confirmation
            </h3>
            <p style={s.modalMsg}>
              All meal logs, deposits, bazaar entries, and expense data for{" "}
              <strong>
                {selectedMonth} {selectedYear}
              </strong>{" "}
              will be <strong>permanently deleted</strong>.<br />
              <br />
              Historical data and PDF reports are safe.
              <br />
              <br />
              Are you absolutely sure?
            </p>
            <div style={s.modalBtns}>
              <button
                style={s.modalCancelBtn}
                onClick={() => setShowConfirm2(false)}
              >
                Cancel
              </button>
              <button style={s.modalDangerBtn} onClick={performReset}>
                Yes, Delete & Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: 700, margin: "0 auto", padding: "24px 16px" },
  heading: { fontSize: 24, fontWeight: 700, marginBottom: 6 },
  sub: { color: "#6b7280", fontSize: 14, marginBottom: 24 },
  loading: { padding: 40, textAlign: "center", color: "#6b7280" },
  selectorRow: { display: "flex", gap: 16, marginBottom: 20 },
  monthBtn: {
    flex: 1,
    padding: "16px 12px",
    borderRadius: 10,
    border: "2px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  monthBtnActive: { borderColor: "#3b82f6", background: "#eff6ff" },
  btnLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#6b7280",
    letterSpacing: 1,
  },
  btnMonth: { fontSize: 16, fontWeight: 700, color: "#1e293b" },
  infoCard: {
    border: "2px solid",
    borderRadius: 10,
    padding: "16px 20px",
    marginBottom: 20,
    background: "#fff",
  },
  infoTitle: { fontWeight: 700, fontSize: 15, marginBottom: 8 },
  infoText: { fontSize: 13, color: "#374151", margin: "0 0 6px 0" },
  infoHint: { fontSize: 12, color: "#6b7280", marginTop: 8 },
  missingList: { paddingLeft: 20, margin: "8px 0" },
  missingItem: { fontSize: 13, color: "#9a3412", marginBottom: 4 },
  resetBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 20,
  },
  resultCard: {
    border: "2px solid",
    borderRadius: 10,
    padding: "16px 20px",
    marginBottom: 24,
  },
  resultTitle: { fontWeight: 700, fontSize: 15, marginBottom: 12 },
  resultTable: { width: "100%", borderCollapse: "collapse" },
  rtd: { padding: "4px 8px", fontSize: 13, borderBottom: "1px solid #e5e7eb" },
  historySection: { marginTop: 16 },
  historyTitle: { fontSize: 17, fontWeight: 700, marginBottom: 12 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "8px 10px",
    background: "#f9fafb",
    borderBottom: "2px solid #e5e7eb",
    textAlign: "left",
    fontWeight: 600,
  },
  td: { padding: "8px 10px", borderBottom: "1px solid #e5e7eb" },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    padding: "32px 28px",
    maxWidth: 420,
    width: "90%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  modalIcon: { fontSize: 42, marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: 700, marginBottom: 12 },
  modalMsg: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.6,
    marginBottom: 16,
  },
  modalHint: { fontSize: 12, color: "#6b7280", marginBottom: 20 },
  modalBtns: { display: "flex", gap: 12, justifyContent: "center" },
  modalCancelBtn: {
    padding: "10px 24px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  modalDangerBtn: {
    padding: "10px 24px",
    borderRadius: 8,
    border: "none",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  modalOkBtn: {
    padding: "12px 28px",
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    marginTop: 8,
  },
};
