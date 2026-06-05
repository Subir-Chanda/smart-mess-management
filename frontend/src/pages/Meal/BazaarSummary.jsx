import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";

function BazaarSummary() {
  const [summary, setSummary] = useState({
    totalCost: 0,
    totalDays: 0,
    highest: 0,
    lowest: 0,
    average: 0,
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("token");

      const currentDate = new Date();

      const month = currentDate.toLocaleString("default", {
        month: "long",
      });

      const year = currentDate.getFullYear();

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/meal/bazaar-summary?month=${month}&year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSummary(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const cardStyle = {
    background: "#fff",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  };

  return (
    <DashboardLayout>
      <div
        style={{
          padding: "20px",
        }}
      >
        <h1
          style={{
            marginBottom: "30px",
          }}
        >
          Bazaar Summary
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: "20px",
          }}
        >
          <div style={cardStyle}>
            <h3>Total Bazaar Cost</h3>
            <h1>₹{summary.totalCost}</h1>
          </div>

          <div style={cardStyle}>
            <h3>Total Bazaar Days</h3>
            <h1>{summary.totalDays}</h1>
          </div>

          <div style={cardStyle}>
            <h3>Highest Bazaar</h3>
            <h1>₹{summary.highest}</h1>
          </div>

          <div style={cardStyle}>
            <h3>Lowest Bazaar</h3>
            <h1>₹{summary.lowest}</h1>
          </div>

          <div style={cardStyle}>
            <h3>Average Daily Bazaar</h3>
            <h1>₹{summary.average}</h1>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default BazaarSummary;
