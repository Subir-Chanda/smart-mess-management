import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { showSuccess, showError } from "../../utils/toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function GuestMeals() {
  const [members, setMembers] = useState([]);
  const [guestMeals, setGuestMeals] = useState([]);
  const [rates, setRates] = useState({});
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    member: "",
    guestCount: 1,
    mealType: "Sobji",
    date: "",
  });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchMembers();
    fetchGuestMeals();
    fetchRates();
  }, []);

  const fetchMembers = async () => {
    const res = await axios.get(`${API}/api/member/all-members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMembers(res.data.users);
  };

  const fetchGuestMeals = async () => {
    const res = await axios.get(`${API}/api/guest-meal/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setGuestMeals(res.data.guestMeals);
  };

  const fetchRates = async () => {
    const res = await axios.get(`${API}/api/guest-meal/rates`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRates(res.data.rates);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/api/guest-meal/add`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    showSuccess("Guest Meal Added");
    fetchGuestMeals();
  };

  const deleteMeal = async (id) => {
    await axios.delete(`${API}/api/guest-meal/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    showSuccess("Guest Meal Deleted");
    fetchGuestMeals();
  };

  const startEdit = (meal) => {
    setEditId(meal._id);
    setEditData({
      guestCount: meal.guestCount,
      mealType: meal.mealType,
      date: meal.date,
    });
  };

  const saveEdit = async (id) => {
    try {
      setSaving(true);
      await axios.put(`${API}/api/guest-meal/update/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess("Guest Meal Updated");
      fetchGuestMeals();
      setEditId(null);
    } catch (err) {
      showError("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const getCurrentRate = () => {
    const map = {
      Sobji: rates.sobji,
      Fish: rates.fish,
      Egg: rates.egg,
      Chicken: rates.chicken,
      "Grand Meal": rates.grandMeal,
    };
    return map[form.mealType] || 0;
  };

  const inputStyle = {
    width: "80px",
    padding: "4px 6px",
    border: "1.5px solid #2563eb",
    borderRadius: "6px",
    fontSize: "13px",
    textAlign: "center",
  };

  return (
    <DashboardLayout>
      <div className="khata-container">
        <h1 className="khata-title">Guest Meal Management</h1>

        {isAdmin && (
          <form
            onSubmit={submitHandler}
            style={{
              display: "grid",
              gap: "15px",
              marginBottom: "30px",
              background: "white",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <select
              value={form.member}
              onChange={(e) => setForm({ ...form, member: e.target.value })}
              required
            >
              <option value="">Select Member</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Guest Count"
              value={form.guestCount}
              onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
            />
            <select
              value={form.mealType}
              onChange={(e) => setForm({ ...form, mealType: e.target.value })}
            >
              <option>Sobji</option>
              <option>Fish</option>
              <option>Egg</option>
              <option>Chicken</option>
              <option>Grand Meal</option>
            </select>
            <input
              type="number"
              placeholder="Date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <h3>Total Cost : ₹{Number(form.guestCount) * getCurrentRate()}</h3>
            <button className="btn btn-dark" type="submit">
              Add Guest Meal
            </button>
          </form>
        )}

        <div className="table-wrapper">
          <table className="khata-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Member</th>
                <th>Meal</th>
                <th>Guests</th>
                <th>Rate</th>
                <th>Total Cost</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {guestMeals.map((meal) => (
                <tr key={meal._id}>
                  {editId === meal._id ? (
                    <>
                      <td>
                        <input
                          style={{ ...inputStyle, width: "60px" }}
                          value={editData.date}
                          onChange={(e) =>
                            setEditData({ ...editData, date: e.target.value })
                          }
                        />
                      </td>
                      <td>{meal.member?.name}</td>
                      <td>
                        <select
                          value={editData.mealType}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              mealType: e.target.value,
                            })
                          }
                          style={{ ...inputStyle, width: "100px" }}
                        >
                          <option>Sobji</option>
                          <option>Fish</option>
                          <option>Egg</option>
                          <option>Chicken</option>
                          <option>Grand Meal</option>
                        </select>
                      </td>
                      <td>
                        <input
                          style={inputStyle}
                          value={editData.guestCount}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              guestCount: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>₹{meal.rate}</td>
                      <td>₹{meal.totalCost}</td>
                      <td
                        style={{
                          display: "flex",
                          gap: "6px",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() => saveEdit(meal._id)}
                          disabled={saving}
                          style={{
                            padding: "4px 12px",
                            background: "#16a34a",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {saving ? "..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          style={{
                            padding: "4px 12px",
                            background: "#e5e7eb",
                            color: "#374151",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{meal.date}</td>
                      <td>{meal.member?.name}</td>
                      <td>{meal.mealType}</td>
                      <td>{meal.guestCount}</td>
                      <td>₹{meal.rate}</td>
                      <td>₹{meal.totalCost}</td>
                      {isAdmin && (
                        <td
                          style={{
                            display: "flex",
                            gap: "6px",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={() => startEdit(meal)}
                            style={{
                              padding: "4px 12px",
                              background: "#dbeafe",
                              color: "#2563eb",
                              border: "1px solid #93c5fd",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMeal(meal._id)}
                            style={{
                              padding: "4px 12px",
                              background: "#fee2e2",
                              color: "#dc2626",
                              border: "1px solid #fca5a5",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default GuestMeals;
