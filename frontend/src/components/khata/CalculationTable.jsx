function CalculationTable({ rows }) {
  return (
    <div
      style={{
        overflowX: "auto",
      }}
    >
      <table className="khata-table">
        <thead>
          <tr>
            <th>Name</th>

            <th>Deposit</th>

            <th>
              Actual Meals <br />
              Count
            </th>

            <th>
              Billable Meals <br /> Count
            </th>

            <th>Meal Cost</th>

            <th>Guest Cost</th>

            <th>Ranna Mashi</th>

            <th>Kajer Mashi</th>

            <th>Fixed Cost</th>

            <th>Total Cost</th>

            <th>Due</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((item, index) => (
            <tr key={index}>
              <td>
                <div>
                  <div>{item.name}</div>

                  {item.monthlyMealStatus === "OFF" && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        fontWeight: "bold",
                        marginTop: "4px",
                      }}
                    >
                      Monthly Meal OFF
                    </div>
                  )}
                </div>
              </td>

              <td>₹{item.deposit}</td>

              <td>{item.mealCount}</td>

              <td>{item.billableMeals}</td>

              <td>₹{item.mealCost}</td>

              <td>₹{item.guestCost}</td>

              <td>₹{item.rannaCost}</td>

              <td>₹{item.kajerCost}</td>

              <td>₹{item.fixedCost}</td>

              <td>₹{item.totalCost}</td>

              <td>₹{item.due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CalculationTable;
