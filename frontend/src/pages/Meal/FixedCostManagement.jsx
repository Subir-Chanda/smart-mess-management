import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";

import FixedExpenseTable from "../../components/khata/FixedExpenseTable";

import AddFixedExpenseForm from "../../components/khata/AddFixedExpenseForm";

import "../../styles/khata.css";

function FixedCostManagement() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/fixed-cost/expenses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        setExpenses(res.data.expenses);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="khata-container">
        <h1 className="khata-title">Fixed Cost Management</h1>

        <div className="table-wrapper">
          <FixedExpenseTable expenses={expenses} />
        </div>

        {user?.role === "admin" && (
          <AddFixedExpenseForm fetchExpenses={fetchExpenses} />
        )}
      </div>
    </DashboardLayout>
  );
}

export default FixedCostManagement;
