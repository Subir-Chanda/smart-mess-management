import { useState } from "react";
import axios from "axios";
import "../../styles/khata.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function BazaarTable({ bazaar, isAdmin, onRefresh }) {
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const startEdit = (b) => {
    setEditId(b._id);
    setEditData({
      date: b.date,
      month: b.month,
      year: b.year,
      mealType: b.mealType,
      items: b.items.map((i) => ({ itemName: i.itemName, price: i.price })),
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const updateItem = (index, field, value) => {
    const items = [...editData.items];
    items[index] = { ...items[index], [field]: value };
    setEditData({ ...editData, items });
  };

  const saveEdit = async (id) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/meal/daily-bazaar/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onRefresh();
      setEditId(null);
    } catch (err) {
      alert("Failed to update. Check your backend route.");
    } finally {
      setSaving(false);
    }
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
    <table className="khata-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Meal</th>
          <th>Items</th>
          <th>Total Cost</th>
          <th>Bazaar By</th>
          <th>Bill</th>
          {isAdmin && <th>Action</th>}
        </tr>
      </thead>
      <tbody>
        {bazaar.length > 0 ? (
          bazaar.map((b) => (
            <tr key={b._id}>
              {editId === b._id ? (
                <>
                  <td>
                    <input
                      style={{ ...inputStyle, width: "50px" }}
                      value={editData.date}
                      onChange={(e) =>
                        setEditData({ ...editData, date: e.target.value })
                      }
                      placeholder="Day"
                    />
                  </td>
                  <td>
                    <select
                      value={editData.mealType}
                      onChange={(e) =>
                        setEditData({ ...editData, mealType: e.target.value })
                      }
                      style={{ ...inputStyle, width: "90px" }}
                    >
                      <option>Lunch</option>
                      <option>Dinner</option>
                    </select>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    {editData.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: "6px",
                          marginBottom: "6px",
                          alignItems: "center",
                        }}
                      >
                        <input
                          style={{ ...inputStyle, width: "110px" }}
                          value={item.itemName}
                          onChange={(e) =>
                            updateItem(idx, "itemName", e.target.value)
                          }
                          placeholder="Item"
                        />
                        <span style={{ fontSize: "12px" }}>₹</span>
                        <input
                          style={{ ...inputStyle, width: "70px" }}
                          value={item.price}
                          onChange={(e) =>
                            updateItem(idx, "price", e.target.value)
                          }
                          placeholder="Price"
                        />
                      </div>
                    ))}
                  </td>
                  <td>
                    ₹
                    {editData.items.reduce(
                      (s, i) => s + Number(i.price || 0),
                      0,
                    )}
                  </td>
                  <td>{b.bazaarBy?.name}</td>
                  <td>—</td>
                  <td
                    style={{
                      display: "flex",
                      gap: "6px",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => saveEdit(b._id)}
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
                      onClick={cancelEdit}
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
                  <td>
                    {b.date}/{b.month}/{b.year}
                  </td>
                  <td>{b.mealType}</td>
                  <td style={{ textAlign: "left" }}>
                    {b.items.map((item, index) => (
                      <div key={index} style={{ marginBottom: "10px" }}>
                        • {item.itemName} = ₹{item.price}
                      </div>
                    ))}
                  </td>
                  <td>₹{b.totalCost}</td>
                  <td>{b.bazaarBy?.name}</td>
                  <td>
                    {b.billImage ? (
                      <a
                        href={b.billImage}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          textDecoration: "none",
                          color: "#2563eb",
                          fontWeight: "bold",
                        }}
                      >
                        View Bill
                      </a>
                    ) : (
                      <span style={{ color: "#999" }}>No Bill</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td>
                      <button
                        onClick={() => startEdit(b)}
                        style={{
                          padding: "4px 14px",
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
                    </td>
                  )}
                </>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={isAdmin ? 7 : 6}>No Bazaar Data Found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default BazaarTable;
