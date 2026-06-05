import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { showSuccess, showError } from "../../utils/toast";

function AdminMealRequests() {
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/meal-request/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setRequests(res.data.requests);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approveRequest = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/meal-request/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchRequests();
      showSuccess("Request Approved");
    } catch (error) {
      console.log(error);
    }
  };

  const rejectRequest = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/meal-request/reject/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchRequests();
      showSuccess("Request Rejected");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mt-4">
        <div className="card p-4">
          <h1 className="text-center mb-4">Meal Requests</h1>

          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Request Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.user?.name}</td>

                  <td>{request.requestType}</td>

                  <td>{request.status}</td>

                  <td>
                    <button
                      className="btn btn-success me-2"
                      onClick={() => approveRequest(request._id)}
                    >
                      Approve
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => rejectRequest(request._id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminMealRequests;
