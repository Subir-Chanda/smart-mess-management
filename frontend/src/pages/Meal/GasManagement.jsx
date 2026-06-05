import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";

import GasTable from "../../components/khata/GasTable";

import AddGasForm from "../../components/khata/AddGasForm";

import "../../styles/khata.css";

function GasManagement() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [gas, setGas] = useState([]);

  useEffect(() => {
    fetchGas();
  }, []);

  const fetchGas = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/rice-gas/gas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGas(res.data.gas);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="khata-container">
        <h1 className="khata-title">Gas Management</h1>

        <div className="table-wrapper">
          <GasTable gas={gas} />
        </div>

        {user?.role === "admin" && <AddGasForm fetchGas={fetchGas} />}
      </div>
    </DashboardLayout>
  );
}

export default GasManagement;
