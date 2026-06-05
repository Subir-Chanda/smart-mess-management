import { useEffect, useState } from "react";

import axios from "axios";

function PaymentTable() {
  const [payments, setPayments] = useState([]);

  const token = localStorage.getItem("token");

  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payment/pending",

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

  const approveHandler = async (id) => {
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
  };

  const rejectHandler = async (id) => {
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
  };

  return (
    <div className="payment-table-wrapper">
      <table className="payment-table">
        <thead>
          <tr>
            <th>Name</th>

            <th>Amount</th>

            <th>Screenshot</th>

            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((item) => (
            <tr key={item._id}>
              <td>{item.user?.name}</td>

              <td>₹{item.amount}</td>

              <td>
                <a
                  href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${item.screenshot}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
              </td>

              <td>
                <button onClick={() => approveHandler(item._id)}>
                  Approve
                </button>

                <button onClick={() => rejectHandler(item._id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PaymentTable;
