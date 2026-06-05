export const currentDate = new Date();

export const currentMonth = currentDate.toLocaleString("default", {
  month: "long",
});

export const currentYear = currentDate.getFullYear();

export const totalDays = new Date(
  currentYear,

  currentDate.getMonth() + 1,

  0,
).getDate();
