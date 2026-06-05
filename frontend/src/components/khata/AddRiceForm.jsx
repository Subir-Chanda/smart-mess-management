import { useState } from "react";
import axios from "axios";

function AddRiceForm({ fetchRice }) {
  const [formData, setFormData] = useState({
    date: "",
    quantity: "",
    cost: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/rice-gas/add-rice",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Rice Added Successfully");

      setFormData({
        date: "",
        quantity: "",
        cost: "",
      });

      fetchRice();
    } catch (error) {
      console.log(error);

      alert("Failed To Add Rice");
    }
  };

  return (
    <div className="khata-form">
      <h2>Add Rice Purchase</h2>

      <form onSubmit={handleSubmit}>
        <div className="khata-form-grid">
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

          <input
            type="number"
            placeholder="Quantity (KG)"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity: e.target.value,
              })
            }
            required
          />

          <input
            type="number"
            placeholder="Cost"
            value={formData.cost}
            onChange={(e) =>
              setFormData({
                ...formData,
                cost: e.target.value,
              })
            }
            required
          />
        </div>

        <button className="khata-btn" type="submit">
          Save Rice
        </button>
      </form>
    </div>
  );
}

export default AddRiceForm;
