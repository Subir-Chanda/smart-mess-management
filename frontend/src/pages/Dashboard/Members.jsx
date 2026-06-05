import { useEffect, useState } from "react";

import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";

function Members() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  // ======================================
  // FETCH MEMBERS
  // ======================================

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

  return (
    <DashboardLayout>
      <div className="khata-container">
        <h1 className="khata-title">Members List</h1>

        <div className="table-wrapper">
          <table className="khata-table">
            <thead>
              <tr>
                <th>Name</th>

                <th>Email</th>

                <th>Role</th>

                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <tr key={member._id}>
                  <td>{member.name}</td>

                  <td>{member.email}</td>

                  <td>{member.role}</td>

                  <td>{member.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Members;
