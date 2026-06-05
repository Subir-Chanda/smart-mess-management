import { useEffect, useState } from "react";

import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";

function TransferAdmin() {
  const [members, setMembers] = useState([]);

  const [selectedUser, setSelectedUser] = useState("");

  // ======================================
  // FETCH MEMBERS
  // ======================================

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/member/all-members",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMembers(res.data.users);
    } catch (error) {
      console.log(error);
    }
  };

  // ======================================
  // TRANSFER ADMIN
  // ======================================

  const transferAdmin = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5000/api/member/transfer-admin",

        {
          userId: selectedUser,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Admin Transferred Successfully");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="khata-container">
        <h1 className="khata-title">Transfer Admin</h1>

        <div className="khata-form">
          <select onChange={(e) => setSelectedUser(e.target.value)}>
            <option>Select Member</option>

            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>

          <button className="khata-btn" onClick={transferAdmin}>
            Transfer Admin
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default TransferAdmin;
