import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";

function GuestMealRates() {
  const [rates, setRates] = useState({
    sobji: "",
    fish: "",
    egg: "",
    chicken: "",
    grandMeal: "",
  });

  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await axios.get(
        (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/guest-meal/rates",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setRates(res.data.rates);
    } catch (error) {
      console.log(error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await axios.put((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/guest-meal/rates", rates, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Guest Meal Rates Updated");

      fetchRates();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="khata-container">
        <h1 className="khata-title">Guest Meal Rates</h1>

        {/* VIEW RATES */}

        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto 30px auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#02112b",
                  color: "white",
                }}
              >
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                  }}
                >
                  Meal Type
                </th>

                <th
                  style={{
                    padding: "16px",
                    textAlign: "center",
                  }}
                >
                  Rate
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Sobji
                </td>

                <td
                  style={{
                    padding: "15px",
                    textAlign: "center",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  ₹{rates.sobji}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Fish
                </td>

                <td
                  style={{
                    padding: "15px",
                    textAlign: "center",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  ₹{rates.fish}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Egg
                </td>

                <td
                  style={{
                    padding: "15px",
                    textAlign: "center",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  ₹{rates.egg}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Chicken
                </td>

                <td
                  style={{
                    padding: "15px",
                    textAlign: "center",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  ₹{rates.chicken}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    padding: "15px",
                  }}
                >
                  Grand Meal
                </td>

                <td
                  style={{
                    padding: "15px",
                    textAlign: "center",
                  }}
                >
                  ₹{rates.grandMeal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ADMIN EDIT SECTION */}

        {isAdmin && (
          <form
            onSubmit={submitHandler}
            style={{
              margin: "30px auto",
              maxWidth: "700px",
              padding: "25px",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Edit Guest Meal Rates
            </h3>

            <input
              type="number"
              className="form-control"
              placeholder="Sobji Rate"
              value={rates.sobji}
              onChange={(e) =>
                setRates({
                  ...rates,
                  sobji: e.target.value,
                })
              }
            />

            <input
              type="number"
              className="form-control"
              placeholder="Fish Rate"
              value={rates.fish}
              onChange={(e) =>
                setRates({
                  ...rates,
                  fish: e.target.value,
                })
              }
            />

            <input
              type="number"
              className="form-control"
              placeholder="Egg Rate"
              value={rates.egg}
              onChange={(e) =>
                setRates({
                  ...rates,
                  egg: e.target.value,
                })
              }
            />

            <input
              type="number"
              className="form-control"
              placeholder="Chicken Rate"
              value={rates.chicken}
              onChange={(e) =>
                setRates({
                  ...rates,
                  chicken: e.target.value,
                })
              }
            />

            <input
              type="number"
              className="form-control"
              placeholder="Grand Meal Rate"
              value={rates.grandMeal}
              onChange={(e) =>
                setRates({
                  ...rates,
                  grandMeal: e.target.value,
                })
              }
            />

            <button type="submit" className="btn btn-dark">
              Update Rates
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default GuestMealRates;
