import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import CalculationTable from "../../components/khata/CalculationTable";
import "../../styles/khata.css";
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
} from "../../utils/toast";

function MonthlyCalculation() {
  const [data, setData] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCalculation();
  }, []);

  const fetchCalculation = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/monthly-calculation/current",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) setData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ======================================
  // GENERATE SINGLE PDF HELPER
  // ======================================

  const generateOne = async (url, label, token) => {
    try {
      await axios.post(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return { label, status: "success" };
    } catch (err) {
      const resData = err.response?.data;

      if (resData?.exists) {
        // Ask user before replacing
        const confirmReplace = window.confirm(
          `${resData.message}\n\nReplace existing PDF?`,
        );

        if (!confirmReplace) {
          return { label, status: "skipped" };
        }

        try {
          await axios.post(
            `${url}?replace=true`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          );
          return { label, status: "replaced" };
        } catch {
          return { label, status: "failed" };
        }
      }

      return { label, status: "failed" };
    }
  };

  // ======================================
  // GENERATE ALL PDFs
  // ======================================

  const generateAllPdfs = async () => {
    const token = localStorage.getItem("token");
    setGenerating(true);

    const tasks = [
      {
        url: "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/pdf/generate/monthly",
        label: "Monthly Calculation",
      },
      {
        url: "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/pdf/generate/deposit",
        label: "Deposit Ledger",
      },
      {
        url: "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/pdf/generate/meal-khata",
        label: "Daily Meal Khata",
      },
      {
        url: "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/pdf/generate/meal-grid",
        label: "Meal Grid",
      },
      {
        url: "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/pdf/generate/bazaar-ledger",
        label: "Bazaar Ledger",
      },
    ];

    const results = [];

    for (const task of tasks) {
      const result = await generateOne(task.url, task.label, token);
      results.push(result);
    }

    setGenerating(false);

    // SUMMARY MESSAGE
    const succeeded = results.filter(
      (r) => r.status === "success" || r.status === "replaced",
    );
    const skipped = results.filter((r) => r.status === "skipped");
    const failed = results.filter((r) => r.status === "failed");

    let msg = "";

    if (succeeded.length > 0) {
      msg += `✅ Generated: ${succeeded.map((r) => r.label).join(", ")}\n`;
      showSuccess(msg.trim());
    }
    if (skipped.length > 0) {
      msg += `⏭ Skipped: ${skipped.map((r) => r.label).join(", ")}\n`;
      showWarning(msg.trim());
    }
    if (failed.length > 0) {
      msg += `❌ Failed: ${failed.map((r) => r.label).join(", ")}`;
      showError(msg.trim());
    }
  };

  if (!data) {
    return (
      <DashboardLayout>
        <h2>Loading...</h2>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="khata-container">
        {/* HEADER ROW */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1 className="khata-title" style={{ margin: 0 }}>
            Monthly Calculation
          </h1>

          <button
            onClick={generateAllPdfs}
            disabled={generating}
            style={{
              background: generating ? "#94a3b8" : "#02112b",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: generating ? "not-allowed" : "pointer",
            }}
          >
            {generating ? "Generating..." : "📄 Generate All PDFs"}
          </button>
        </div>

        {/* TOP INFO */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          <div>
            Month : {data.month} {data.year}
          </div>
          <div>Meal Rate : ₹{data.mealRate}</div>
        </div>

        {/* TABLE */}
        <CalculationTable rows={data.rows} />

        {/* SUMMARY */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3>Summary</h3>
            <p>Total Bazaar Cost : ₹{data.totalBazaarCost}</p>
            <p>Total Guest Cost : ₹{data.totalGuestRecovery}</p>
            <p>Total Fixed Cost : ₹{data.totalFixedCost}</p>
          </div>

          <div>
            <h3>Additional Costs</h3>
            <p>Total Mashi Cost : ₹{data.totalMashiCost}</p>
            <p>Total Rice Cost : ₹{data.totalRiceCost}</p>
            <p>Total Gas Cost : ₹{data.totalGasCost}</p>
            <hr />
            <p>TOTAL : ₹{data.dueToPaid}</p>
          </div>
        </div>

        {/* DIFFERENCE */}
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#f8fafc",
            borderRadius: "12px",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          Total Due : ₹{Number(data.totalDueAmount).toFixed(2)}
          <br />
          Current Mess Balance : ₹
          {Number(data.currentMessFundBalance).toFixed(2)}
          <br />
          Difference : ₹{Number(data.difference).toFixed(2)}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MonthlyCalculation;
