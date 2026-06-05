import { useState } from "react";
import axios from "axios";

function AddFixedExpenseForm({ fetchExpenses }) {
  const [formData, setFormData] = useState({
    expenseName: "",
    amount: "",
    date: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fixed-cost/add-expense",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Expense Added");

      setFormData({
        expenseName: "",
        amount: "",
        date: "",
      });

      fetchExpenses();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="khata-form">
      <h2>Add Expense</h2>

      <form onSubmit={handleSubmit}>
        <div className="khata-form-grid">
          <input
            type="text"
            placeholder="Expense Name"
            value={formData.expenseName}
            onChange={(e) =>
              setFormData({
                ...formData,
                expenseName: e.target.value,
              })
            }
            required
          />

          <input
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount: e.target.value,
              })
            }
            required
          />

          <input
            type="number"
            placeholder="Date"
            value={formData.date}
            onChange={(e) =>
              setFormData({
                ...formData,
                date: e.target.value,
              })
            }
            required
          />
        </div>

        <button className="khata-btn" type="submit">
          Save Expense
        </button>
      </form>
    </div>
  );
}

export default AddFixedExpenseForm;
