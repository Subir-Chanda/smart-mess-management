import { useState } from "react";
import axios from "axios";

function AddGasForm({ fetchGas }) {
  const [formData, setFormData] = useState({
    date: "",
    cylinderCount: "",
    cost: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(import.meta.env.VITE_API_URL || "http://localhost:5000"/api/rice-gas/add-gas", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Gas Added Successfully");

      setFormData({
        date: "",
        cylinderCount: "",
        cost: "",
      });

      fetchGas();
    } catch (error) {
      console.log(error);

      alert("Failed To Add Gas");
    }
  };

  return (
    <div className="khata-form">
      <h2>Add Gas Purchase</h2>

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
            placeholder="Cylinder Count"
            value={formData.cylinderCount}
            onChange={(e) =>
              setFormData({
                ...formData,
                cylinderCount: e.target.value,
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
          Save Gas
        </button>
      </form>
    </div>
  );
}

export default AddGasForm;
