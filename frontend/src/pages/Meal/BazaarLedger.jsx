import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import BazaarTable from "../../components/khata/BazaarTable";
import AddBazaarForm from "../../components/khata/AddBazaarForm";
import "../../styles/khata.css";

function BazaarLedger() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
  const [bazaar, setBazaar] = useState([]);

  useEffect(() => {
    fetchBazaar();
  }, []);

  const fetchBazaar = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        (import.meta.env.VITE_API_URL || "http://localhost:5000") +
          "/api/meal/daily-bazaar",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) setBazaar(res.data.bazaar);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="khata-container">
        <h1 className="khata-title">Daily Bazaar Ledger</h1>
        <div className="table-wrapper">
          <BazaarTable
            bazaar={bazaar}
            isAdmin={isAdmin}
            onRefresh={fetchBazaar}
          />
        </div>
        {isAdmin && (
          <div style={{ marginTop: "40px" }}>
            <AddBazaarForm fetchBazaar={fetchBazaar} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default BazaarLedger;
