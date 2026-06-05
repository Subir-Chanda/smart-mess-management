function FixedExpenseTable({ expenses }) {
  return (
    <table className="khata-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Expense Name</th>
          <th>Amount</th>
          <th>Added By</th>
        </tr>
      </thead>

      <tbody>
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <tr key={expense._id}>
              <td>
                {expense.date}/{expense.month}/{expense.year}
              </td>

              <td>{expense.expenseName}</td>

              <td>₹{expense.amount}</td>

              <td>{expense.addedBy?.name}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4">No Expenses Found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default FixedExpenseTable;
