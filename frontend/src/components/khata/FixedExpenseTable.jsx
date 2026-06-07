import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function FixedExpenseTable({ expenses, isAdmin, onRefresh }) {
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const startEdit = (item) => {
    setEditId(item._id);
    setEditData({
      date: item.date,
      month: item.month,
      year: item.year,
      expenseName: item.expenseName,
      amount: item.amount,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/fixed-cost/expenses/${id}`, editData, {
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
          <th>Expense Name</th>
          <th>Amount</th>
          <th>Added By</th>
          {isAdmin && <th>Action</th>}
        </tr>
      </thead>
      <tbody>
        {expenses.length > 0 ? (
          expenses.map((item) => (
            <tr key={item._id}>
              {editId === item._id ? (
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
                    <input
                      style={{ ...inputStyle, width: "140px" }}
                      value={editData.expenseName}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          expenseName: e.target.value,
                        })
                      }
                      placeholder="Name"
                    />
                  </td>
                  <td>
                    <input
                      style={inputStyle}
                      value={editData.amount}
                      onChange={(e) =>
                        setEditData({ ...editData, amount: e.target.value })
                      }
                      placeholder="Amount"
                    />
                  </td>
                  <td>{item.addedBy?.name}</td>
                  <td
                    style={{
                      display: "flex",
                      gap: "6px",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => saveEdit(item._id)}
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
                    {item.date}/{item.month}/{item.year}
                  </td>
                  <td>{item.expenseName}</td>
                  <td>₹{item.amount}</td>
                  <td>{item.addedBy?.name}</td>
                  {isAdmin && (
                    <td>
                      <button
                        onClick={() => startEdit(item)}
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
            <td colSpan={isAdmin ? 5 : 4}>No Expenses Found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default FixedExpenseTable;
