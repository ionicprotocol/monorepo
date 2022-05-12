// Formats date object into "DD-MM-YYYY"
export const formatDateToDDMMYY = (date: Date) =>
  date.toISOString().split('T')[0].split('-').reverse().join('-');
