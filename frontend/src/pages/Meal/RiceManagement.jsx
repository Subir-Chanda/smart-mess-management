import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";

import RiceTable from "../../components/khata/RiceTable";

import AddRiceForm from "../../components/khata/AddRiceForm";

import "../../styles/khata.css";

function RiceManagement() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [rice, setRice] = useState([]);

  useEffect(() => {
    fetchRice();
  }, []);

  const fetchRice = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/rice-gas/rice", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRice(res.data.rice);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="khata-container">
        <h1 className="khata-title">Rice Management</h1>

        <div className="table-wrapper">
          <RiceTable rice={rice} />
        </div>

        {user?.role === "admin" && <AddRiceForm fetchRice={fetchRice} />}
      </div>
    </DashboardLayout>
  );
}

export default RiceManagement;
