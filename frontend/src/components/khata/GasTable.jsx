function GasTable({ gas }) {
  return (
    <table className="khata-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Cylinders</th>
          <th>Cost</th>
          <th>Added By</th>
        </tr>
      </thead>

      <tbody>
        {gas.length > 0 ? (
          gas.map((item) => (
            <tr key={item._id}>
              <td>
                {item.date}/{item.month}/{item.year}
              </td>

              <td>{item.cylinderCount}</td>

              <td>₹{item.cost}</td>

              <td>{item.addedBy?.name}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4">No Gas Records Found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default GasTable;
