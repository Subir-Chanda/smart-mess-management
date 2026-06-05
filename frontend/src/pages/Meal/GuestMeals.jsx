import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { showSuccess, showError } from "../../utils/toast";

function GuestMeals() {
  const [members, setMembers] = useState([]);
  const [guestMeals, setGuestMeals] = useState([]);
  const [rates, setRates] = useState({});

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
    const res = await axios.get(
      import.meta.env.VITE_API_URL || "http://localhost:5000"/api/member/all-members",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setMembers(res.data.users);
  };

  const fetchGuestMeals = async () => {
    const res = await axios.get(import.meta.env.VITE_API_URL || "http://localhost:5000"/api/guest-meal/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setGuestMeals(res.data.guestMeals);
  };

  const fetchRates = async () => {
    const res = await axios.get(import.meta.env.VITE_API_URL || "http://localhost:5000"/api/guest-meal/rates", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setRates(res.data.rates);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    await axios.post(import.meta.env.VITE_API_URL || "http://localhost:5000"/api/guest-meal/add", form, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    showSuccess("Guest Meal Added");

    fetchGuestMeals();
  };

  const deleteMeal = async (id) => {
    await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/guest-meal/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    showSuccess("Guest Meal Deleted");

    fetchGuestMeals();
  };

  const getCurrentRate = () => {
    switch (form.mealType) {
      case "Sobji":
        return rates.sobji || 0;

      case "Fish":
        return rates.fish || 0;

      case "Egg":
        return rates.egg || 0;

      case "Chicken":
        return rates.chicken || 0;

      case "Grand Meal":
        return rates.grandMeal || 0;

      default:
        return 0;
    }
  };

  return (
    <DashboardLayout>
      <div className="khata-container">
        <h1 className="khata-title">Guest Meal Management</h1>

        {/* ADMIN ONLY FORM */}

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
              onChange={(e) =>
                setForm({
                  ...form,
                  member: e.target.value,
                })
              }
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
              onChange={(e) =>
                setForm({
                  ...form,
                  guestCount: e.target.value,
                })
              }
            />

            <select
              value={form.mealType}
              onChange={(e) =>
                setForm({
                  ...form,
                  mealType: e.target.value,
                })
              }
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
              onChange={(e) =>
                setForm({
                  ...form,
                  date: e.target.value,
                })
              }
            />

            <h3>Total Cost : ₹{Number(form.guestCount) * getCurrentRate()}</h3>

            <button className="btn btn-dark" type="submit">
              Add Guest Meal
            </button>
          </form>
        )}

        {/* EVERYONE CAN SEE TABLE */}

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
                  <td>{meal.date}</td>

                  <td>{meal.member?.name}</td>

                  <td>{meal.mealType}</td>

                  <td>{meal.guestCount}</td>

                  <td>₹{meal.rate}</td>

                  <td>₹{meal.totalCost}</td>

                  {isAdmin && (
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteMeal(meal._id)}
                      >
                        Delete
                      </button>
                    </td>
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
