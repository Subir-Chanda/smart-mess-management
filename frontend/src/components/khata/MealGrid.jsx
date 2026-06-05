import React, { useEffect, useState } from "react";

import axios from "axios";

import { totalDays } from "../../utils/dateUtils";

function MealGrid({ members, currentMonth, currentYear }) {
  const [mealData, setMealData] = useState({});

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  // ======================================
  // FETCH SAVED MEALS
  // ======================================

  useEffect(() => {
    fetchMeals();
  }, [currentMonth, currentYear]);

  const fetchMeals = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/meal/get-meals?month=${currentMonth}&year=${currentYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const formatted = {};

      res.data.meals.forEach((meal) => {
        if (!formatted[meal.user]) {
          formatted[meal.user] = {};
        }

        formatted[meal.user][`${meal.date}-Lunch`] = meal.lunch ? "✓" : "✗";

        formatted[meal.user][`${meal.date}-Dinner`] = meal.dinner ? "✓" : "✗";
      });

      setMealData(formatted);
    } catch (error) {
      console.log(error);
    }
  };

  // ======================================
  // SAVE MEAL
  // ======================================

  const saveMeal = async (memberId, day, lunch, dinner) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/meal/save-meal",
        {
          userId: memberId,
          date: day,
          month: currentMonth,
          year: currentYear,
          lunch,
          dinner,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  // ======================================
  // HANDLE CHANGE
  // ======================================

  const handleChange = (memberId, key, value) => {
    const updated = {
      ...mealData,
    };

    if (!updated[memberId]) {
      updated[memberId] = {};
    }

    updated[memberId][key] = value;

    setMealData(updated);

    const day = key.split("-")[0];

    const lunch = updated[memberId][`${day}-Lunch`] === "✓";

    const dinner = updated[memberId][`${day}-Dinner`] === "✓";

    saveMeal(memberId, day, lunch, dinner);
  };

  return (
    <div className="table-wrapper">
      <table className="khata-table">
        <thead>
          <tr>
            <th rowSpan="2">Name</th>

            {days.map((day) => (
              <th key={`header-${day}`} colSpan="2">
                {day}
              </th>
            ))}

            <th rowSpan="2">Total</th>
          </tr>

          <tr>
            {days.map((day) => (
              <React.Fragment key={`subheader-${day}`}>
                <th>L</th>
                <th>D</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {members.map((member) => {
            let total = 0;
            const isMealOff = member.monthlyMealStatus === "OFF";

            const isPaused = member.mealPaused === true;

            const isDisabled = isMealOff || isPaused;

            return (
              <tr key={member._id}>
                <td>
                  {member.name}

                  {isMealOff && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      MEAL OFF
                    </div>
                  )}

                  {isPaused && (
                    <div
                      style={{
                        color: "orange",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      PAUSED
                    </div>
                  )}
                </td>

                {days.map((day) => {
                  const lunchKey = `${day}-Lunch`;

                  const dinnerKey = `${day}-Dinner`;

                  const lunch = mealData[member._id]?.[lunchKey] || "";

                  const dinner = mealData[member._id]?.[dinnerKey] || "";

                  if (lunch === "✓") {
                    total++;
                  }

                  if (dinner === "✓") {
                    total++;
                  }

                  return (
                    <React.Fragment key={`${member._id}-${day}`}>
                      {/* LUNCH */}

                      <td>
                        <select
                          className="meal-select"
                          value={lunch}
                          disabled={isDisabled}
                          onChange={(e) =>
                            handleChange(member._id, lunchKey, e.target.value)
                          }
                        >
                          <option value=""></option>

                          <option value="✓">✓</option>

                          <option value="✗">✗</option>
                        </select>
                      </td>

                      {/* DINNER */}

                      <td>
                        <select
                          className="meal-select"
                          value={dinner}
                          disabled={isDisabled}
                          onChange={(e) =>
                            handleChange(member._id, dinnerKey, e.target.value)
                          }
                        >
                          <option value=""></option>

                          <option value="✓">✓</option>

                          <option value="✗">✗</option>
                        </select>
                      </td>
                    </React.Fragment>
                  );
                })}

                <td>{total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default MealGrid;
