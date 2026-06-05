import { useState } from "react";
import axios from "axios";

function AddMashiForm({ fetchMashi }) {
  const [formData, setFormData] = useState({
    rannaMashiCost: "",
    kajerMashiCost: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/fixed-cost/add-mashi",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Mashi Cost Added");

      setFormData({
        rannaMashiCost: "",
        kajerMashiCost: "",
      });

      fetchMashi();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="khata-form">
      <h2>Add Mashi Cost(per Person)</h2>

      <form onSubmit={handleSubmit}>
        <div className="khata-form-grid">
          <input
            type="number"
            placeholder="Ranna Mashi Cost"
            value={formData.rannaMashiCost}
            onChange={(e) =>
              setFormData({
                ...formData,
                rannaMashiCost: e.target.value,
              })
            }
            required
          />

          <input
            type="number"
            placeholder="Kajer Mashi Cost"
            value={formData.kajerMashiCost}
            onChange={(e) =>
              setFormData({
                ...formData,
                kajerMashiCost: e.target.value,
              })
            }
            required
          />
        </div>

        <button className="khata-btn" type="submit">
          Save Mashi Cost
        </button>
      </form>
    </div>
  );
}

export default AddMashiForm;
