import { useState } from "react";

import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { showSuccess, showError } from "../../utils/toast";

function AdminQR() {
  const [qr, setQr] = useState(null);

  const token = localStorage.getItem("token");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("qr", qr);

      const res = await axios.post(
        import.meta.env.VITE_API_URL || "http://localhost:5000"/api/admin-qr/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      showSuccess("QR Uploaded Successfully");

      console.log(res.data);

      window.location.href = "/dashboard/payment";
    } catch (error) {
      console.log(error);

      showError(error?.response?.data?.message || "Failed To Upload QR");
    }
  };

  return (
    <DashboardLayout>
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9">
            <div
              className="bg-white shadow rounded-4 p-5"
              style={{
                maxWidth: "700px",
                margin: "0 auto",
              }}
            >
              <h1
                className="text-center fw-bold mb-5"
                style={{
                  fontSize: "70px",
                  color: "#0f172a",
                }}
              >
                Upload QR
              </h1>

              <form onSubmit={submitHandler}>
                <div className="mb-4">
                  <input
                    type="file"
                    className="form-control form-control-lg"
                    onChange={(e) => setQr(e.target.files[0])}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-dark w-100 py-3 fw-bold"
                  style={{
                    fontSize: "24px",
                    borderRadius: "12px",
                  }}
                >
                  Upload QR
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminQR;
