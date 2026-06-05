import DashboardLayout from "../../components/layout/DashboardLayout";

import PaymentTable from "../../components/payment/PaymentTable";

import "../../styles/payment.css";

function PaymentRequests() {
  return (
    <DashboardLayout>
      <div className="payment-page-content">
        <div className="container-fluid">
          <div className="payment-table-wrapper">
            <h1
              className="text-center mb-4"
              style={{
                fontSize: "52px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              Payment Requests
            </h1>

            <PaymentTable />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PaymentRequests;
