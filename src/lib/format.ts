export function formatInr(paise: number): string {
  const rupees = paise / 100;
  const hasFraction = paise % 100 !== 0;

  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
