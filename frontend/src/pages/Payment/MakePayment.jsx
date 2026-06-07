import DashboardLayout from "../../components/layout/DashboardLayout";

import PaymentForm from "../../components/payment/PaymentForm";

import "../../styles/payment.css";

function MakePayment() {
  return (
    <DashboardLayout>
      <div
        className="container-fluid py-4"
        style={{
          minHeight: "100vh",
        }}
      >
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-7 col-md-9 col-sm-11">
            <div
              className="card shadow-lg border-0 p-4"
              style={{
                borderRadius: "25px",

                background: "#f8fafc",
              }}
            >
              <h1
                className="text-center fw-bold mb-4"
                style={{
                  fontSize: "28px",
                  color: "#0f172a",
                }}
              >
                Make Payment
              </h1>

              <PaymentForm />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MakePayment;
