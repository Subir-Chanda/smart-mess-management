function MealTickCell({
  checked,

  onClick,
}) {
  return (
    <td className="tick-cell" onClick={onClick}>
      {checked ? "✓" : "✗"}
    </td>
  );
}

export default MealTickCell;
