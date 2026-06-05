import { useEffect, useState } from "react";
import axios from "axios";

function AddBazaarForm({ fetchBazaar }) {
  const [members, setMembers] = useState([]);

  const [billImage, setBillImage] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    mealType: "Lunch",
    foodCategory: "Sobji",
    bazaarBy: "",
  });

  const [items, setItems] = useState([
    {
      itemName: "",
      price: "",
    },
  ]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/member/all-members",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMembers(res.data.users);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, e) => {
    const values = [...items];

    values[index][e.target.name] = e.target.value;

    setItems(values);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        itemName: "",
        price: "",
      },
    ]);
  };

  const totalCost = items.reduce(
    (acc, item) => acc + Number(item.price || 0),
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const form = new FormData();

      form.append("date", formData.date);

      form.append("mealType", formData.mealType);

      form.append("foodCategory", formData.foodCategory);

      form.append("bazaarBy", formData.bazaarBy);

      form.append("items", JSON.stringify(items));

      if (billImage) {
        form.append("billImage", billImage);
      }

      await axios.post("${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/meal/add-bazaar", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Bazaar Added Successfully");

      setFormData({
        date: "",
        mealType: "Lunch",
        foodCategory: "Sobji",
        bazaarBy: "",
      });

      setItems([
        {
          itemName: "",
          price: "",
        },
      ]);

      setBillImage(null);

      fetchBazaar();
    } catch (error) {
      console.log(error);

      alert("Failed To Add Bazaar");
    }
  };

  return (
    <div className="khata-form">
      <h2>Add Daily Bazaar</h2>

      <form onSubmit={handleSubmit}>
        {/* TOP */}

        <div className="khata-form-grid">
          <input
            type="number"
            name="date"
            placeholder="Date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <select
            name="mealType"
            value={formData.mealType}
            onChange={handleChange}
          >
            <option value="Lunch">Lunch</option>

            <option value="Dinner">Dinner</option>
          </select>

          <select
            name="foodCategory"
            value={formData.foodCategory}
            onChange={handleChange}
          >
            <option value="Sobji">Sobji</option>
            <option value="Fish">Fish</option>
            <option value="Egg">Egg</option>
            <option value="Chicken">Chicken</option>
            <option value="Grand Meal">Grand Meal</option>
          </select>

          <select
            name="bazaarBy"
            value={formData.bazaarBy}
            onChange={handleChange}
            required
          >
            <option value="">Select Member</option>

            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* BILL IMAGE */}

        <div
          style={{
            marginTop: "20px",
          }}
        >
          <label
            style={{
              fontWeight: "bold",
            }}
          >
            Upload Bazaar Bill
          </label>

          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setBillImage(e.target.files[0])}
          />
        </div>

        {/* ITEMS */}

        <div
          style={{
            marginTop: "30px",
          }}
        >
          <h3>Bazaar Items</h3>

          {items.map((item, index) => (
            <div className="item-row" key={index}>
              <input
                type="text"
                name="itemName"
                placeholder="Item Name"
                value={item.itemName}
                onChange={(e) => handleItemChange(index, e)}
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={item.price}
                onChange={(e) => handleItemChange(index, e)}
              />
            </div>
          ))}

          <button type="button" onClick={addItem} className="khata-btn">
            + Add More Item
          </button>
        </div>

        {/* TOTAL */}

        <div className="total-cost">Total: ₹{totalCost}</div>

        {/* SAVE */}

        <button type="submit" className="khata-btn">
          Save Bazaar
        </button>
      </form>
    </div>
  );
}

export default AddBazaarForm;
