import "../../styles/khata.css";

function BazaarTable({ bazaar }) {
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
        </tr>
      </thead>

      <tbody>
        {bazaar.length > 0 ? (
          bazaar.map((b) => (
            <tr key={b._id}>
              {/* DATE */}

              <td>
                {b.date}/{b.month}/{b.year}
              </td>

              {/* MEAL */}

              <td>{b.mealType}</td>

              {/* ITEMS */}

              <td
                style={{
                  textAlign: "left",
                }}
              >
                {b.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "10px",
                    }}
                  >
                    • {item.itemName} = ₹{item.price}
                  </div>
                ))}
              </td>

              {/* TOTAL */}

              <td>₹{b.totalCost}</td>

              {/* MEMBER */}

              <td>{b.bazaarBy?.name}</td>

              {/* BILL */}

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
                  <span
                    style={{
                      color: "#999",
                    }}
                  >
                    No Bill
                  </span>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6">No Bazaar Data Found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default BazaarTable;
