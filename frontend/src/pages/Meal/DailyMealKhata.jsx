import { useEffect, useState } from "react";

import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";

import MealGrid from "../../components/khata/MealGrid";

import { currentMonth, currentYear } from "../../utils/dateUtils";

import "../../styles/khata.css";

function DailyMealKhata() {
  const [members, setMembers] = useState([]);

  // ======================================
  // FETCH MEMBERS
  // ======================================

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/member/all-members",

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

  return (
    <DashboardLayout>
      <div className="khata-container">
        <h1 className="khata-title">
          {currentMonth} {currentYear}
          <br />
          Daily Meal Khata
        </h1>

        <MealGrid
          members={members}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      </div>
    </DashboardLayout>
  );
}

export default DailyMealKhata;
