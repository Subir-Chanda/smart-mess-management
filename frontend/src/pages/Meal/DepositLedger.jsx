import { useEffect, useState } from "react";

import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";

import DepositTable from "../../components/khata/DepositTable";

import "../../styles/khata.css";

function DepositLedger() {
  const [deposits, setDeposits] = useState([]);

  // ======================================
  // FETCH DEPOSITS
  // ======================================

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/meal/deposits",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDeposits(res.data.deposits);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="khata-container">
        {/* TITLE */}

        <h1 className="khata-title">Deposit Ledger</h1>

        {/* TABLE */}

        <div className="table-wrapper">
          <DepositTable deposits={deposits} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DepositLedger;
