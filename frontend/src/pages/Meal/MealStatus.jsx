import { useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { showSuccess, showError } from "../../utils/toast";

function MealStatus() {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);

  const submitRequest = async (requestType) => {
    try {
      setLoading(true);

      const res = await axios.post(
        "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/meal-request/create",
        { requestType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      showSuccess(res.data.message);
    } catch (error) {
      console.log(error);

      showError("Failed To Submit Request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mt-4">
        <div
          className="card p-5"
          style={{
            maxWidth: "900px",
            margin: "auto",
          }}
        >
          <h1 className="text-center mb-5">Meal Status Requests</h1>

          <div className="mb-5 text-center">
            <h3>Monthly Meal Status</h3>

            <div className="mt-3 d-flex justify-content-center gap-3">
              <button
                className="btn btn-success"
                disabled={loading}
                onClick={() => submitRequest("MONTHLY_ON")}
              >
                Request ON
              </button>

              <button
                className="btn btn-danger"
                disabled={loading}
                onClick={() => submitRequest("MONTHLY_OFF")}
              >
                Request OFF
              </button>
            </div>
          </div>

          <hr />

          <div className="mt-5 text-center">
            <h3>Temporary Pause / Resume</h3>

            <div className="mt-3 d-flex justify-content-center gap-3">
              <button
                className="btn btn-warning"
                disabled={loading}
                onClick={() => submitRequest("PAUSE")}
              >
                Request Pause
              </button>

              <button
                className="btn btn-primary"
                disabled={loading}
                onClick={() => submitRequest("RESUME")}
              >
                Request Resume
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MealStatus;
