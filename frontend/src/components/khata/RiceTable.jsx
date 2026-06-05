function RiceTable({ rice }) {
  return (
    <table className="khata-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Quantity (KG)</th>
          <th>Cost</th>
          <th>Added By</th>
        </tr>
      </thead>

      <tbody>
        {rice.length > 0 ? (
          rice.map((item) => (
            <tr key={item._id}>
              <td>
                {item.date}/{item.month}/{item.year}
              </td>

              <td>{item.quantity} KG</td>

              <td>₹{item.cost}</td>

              <td>{item.addedBy?.name}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4">No Rice Records Found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default RiceTable;
