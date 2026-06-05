import { useEffect, useState } from "react";
import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";

import MashiTable from "../../components/khata/MashiTable";
import AddMashiForm from "../../components/khata/AddMashiForm";

import "../../styles/khata.css";

function MashiManagement() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [mashi, setMashi] = useState([]);

  useEffect(() => {
    fetchMashi();
  }, []);

  const fetchMashi = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/fixed-cost/mashi",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        setMashi(res.data.mashi);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="khata-container">
        <h1 className="khata-title">Mashi Management</h1>

        <div className="table-wrapper">
          <MashiTable mashi={mashi} />
        </div>

        {user?.role === "admin" && <AddMashiForm fetchMashi={fetchMashi} />}
      </div>
    </DashboardLayout>
  );
}

export default MashiManagement;
