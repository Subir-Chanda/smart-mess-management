import { useEffect, useState } from "react";

import axios from "axios";

function PaymentForm() {
  const [amount, setAmount] = useState("");

  const [screenshot, setScreenshot] = useState(null);

  const [qrImage, setQrImage] = useState("");

  const token = localStorage.getItem("token");

  // ======================================
  // FETCH LATEST QR
  // ======================================

  useEffect(() => {
    fetchQR();
  }, []);

  const fetchQR = async () => {
    try {
      const res = await axios.get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/payment/get-qr");

      if (res.data.success && res.data.qr && res.data.qr.qrImage) {
        setQrImage(res.data.qr.qrImage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ======================================
  // SUBMIT PAYMENT
  // ======================================

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("amount", amount);

      formData.append("screenshot", screenshot);

      const res = await axios.post(
        (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/payment/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        alert("Payment Submitted Successfully");

        setAmount("");

        setScreenshot(null);
      }
    } catch (error) {
      console.log(error);

      alert("Failed To Submit Payment");
    }
  };

  return (
    <div className="payment-form-wrapper">
      {/* QR IMAGE */}

      <div className="text-center mb-4">
        {qrImage && (
          <img
            src={qrImage}
            alt="QR"
            className="img-fluid payment-qr"
            style={{
              width: "280px",
              borderRadius: "15px",
            }}
          />
        )}
      </div>

      {/* FORM */}

      <form onSubmit={submitHandler} className="w-100">
        {/* AMOUNT */}

        <div className="mb-4">
          <label className="form-label fw-bold">Amount</label>

          <input
            type="number"
            className="form-control payment-input"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        {/* FILE */}

        <div className="mb-4">
          <label className="form-label fw-bold">Upload Screenshot</label>

          <input
            type="file"
            className="form-control payment-input"
            onChange={(e) => setScreenshot(e.target.files[0])}
            required
          />
        </div>

        {/* BUTTON */}

        <button type="submit" className="btn btn-dark w-100 payment-submit-btn">
          Submit Payment
        </button>
      </form>
    </div>
  );
}

export default PaymentForm;
