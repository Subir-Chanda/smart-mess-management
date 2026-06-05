import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";
import BazaarTable from "../../components/khata/BazaarTable";
import AddBazaarForm from "../../components/khata/AddBazaarForm";

import "../../styles/khata.css";

function BazaarLedger() {
  // ======================================
  // USER
  // ======================================

  const user = JSON.parse(localStorage.getItem("user"));

  // ======================================
  // STATE
  // ======================================

  const [bazaar, setBazaar] = useState([]);

  // ======================================
  // FETCH BAZAAR
  // ======================================

  useEffect(() => {
    fetchBazaar();
  }, []);

  const fetchBazaar = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/meal/daily-bazaar",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        setBazaar(res.data.bazaar);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="khata-container">
        {/* TITLE */}

        <h1 className="khata-title">Daily Bazaar Ledger</h1>

        {/* TABLE */}

        <div className="table-wrapper">
          <BazaarTable bazaar={bazaar} />
        </div>

        {/* ADMIN ONLY FORM */}

        {user?.role === "admin" && (
          <div
            style={{
              marginTop: "40px",
            }}
          >
            <AddBazaarForm fetchBazaar={fetchBazaar} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default BazaarLedger;
