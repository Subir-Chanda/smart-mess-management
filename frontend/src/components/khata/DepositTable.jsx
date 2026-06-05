import "../../styles/khata.css";

function DepositTable({ deposits }) {
  return (
    <table className="khata-table">
      <thead>
        <tr>
          <th>Name</th>

          <th>Amount</th>

          <th>Date</th>

          <th>Month</th>

          <th>Year</th>
        </tr>
      </thead>

      <tbody>
        {deposits.length > 0 ? (
          deposits.map((d) => (
            <tr key={d._id}>
              <td>{d.user?.name}</td>

              <td>₹{d.amount}</td>

              <td>{d.date}</td>

              <td>{d.month}</td>

              <td>{d.year}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5">No Deposit Data Found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default DepositTable;
