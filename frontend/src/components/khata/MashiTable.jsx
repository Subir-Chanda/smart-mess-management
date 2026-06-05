function MashiTable({ mashi }) {
  return (
    <table className="khata-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Ranna Mashi</th>
          <th>Kajer Mashi</th>
          <th>Added By</th>
        </tr>
      </thead>

      <tbody>
        {mashi.length > 0 ? (
          mashi.map((item) => (
            <tr key={item._id}>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>

              <td>₹{item.rannaMashiCost}</td>

              <td>₹{item.kajerMashiCost}</td>

              <td>{item.addedBy?.name}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4">No Mashi Records Found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default MashiTable;
