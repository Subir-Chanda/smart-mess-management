import { useEffect, useState } from "react";

import axios from "axios";

function PaymentTable() {
  const [payments, setPayments] = useState([]);

  const token = localStorage.getItem("token");

  // ======================================
  // FETCH PAYMENTS
  // ======================================

  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payment/all",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPayments(res.data.payments);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ======================================
  // APPROVE
  // ======================================

  const approveHandler = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payment/approve/${id}`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchPayments();
    } catch (error) {
      console.log(error);
    }
  };

  // ======================================
  // REJECT
  // ======================================

  const rejectHandler = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payment/reject/${id}`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchPayments();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="table-responsive">
      <table className="payment-table">
        <thead>
          <tr>
            <th>Name</th>

            <th>Amount</th>

            <th>Screenshot</th>

            <th>Status</th>

            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {payments.length > 0 ? (
            payments.map((item) => (
              <tr key={item._id}>
                <td>{item.user?.name}</td>

                <td>₹{item.amount}</td>

                <td>
                  <a href={item.screenshot} target="_blank" rel="noreferrer">
                    View
                  </a>
                </td>

                <td>{item.status}</td>

                <td>
                  <button onClick={() => approveHandler(item._id)}>
                    Approve
                  </button>

                  <button onClick={() => rejectHandler(item._id)}>
                    Reject
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No Payment Requests</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PaymentTable;
