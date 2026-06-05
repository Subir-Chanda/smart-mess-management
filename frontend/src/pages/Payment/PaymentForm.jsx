import { useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import { showSuccess, showError } from "../../utils/toast";

function PaymentForm() {
  const [amount, setAmount] = useState("");

  const [screenshot, setScreenshot] = useState(null);

  const token = localStorage.getItem("token");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("amount", amount);

      formData.append("screenshot", screenshot);

      await axios.post(
        (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/payment/create",

        formData,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      showSuccess("Payment Submitted Successfully");

      setAmount("");
    } catch (error) {
      showError("Payment Submission Failed");
      console.log(error);
    }
  };

  return (
    <div className="payment-form-card">
      {/* QR */}

      <div className="text-center">
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GooglePayPlaceholder"
          alt="QR"
          className="payment-qr"
        />
      </div>

      {/* FORM */}

      <form onSubmit={submitHandler}>
        <div className="mb-4">
          <label className="form-label">Amount</label>

          <input
            type="number"
            className="form-control payment-input"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Upload Screenshot</label>

          <input
            type="file"
            className="form-control payment-input"
            onChange={(e) => setScreenshot(e.target.files[0])}
            required
          />
        </div>

        <button type="submit" className="btn payment-btn">
          Submit Payment
        </button>
      </form>
    </div>
  );
}

export default PaymentForm;
