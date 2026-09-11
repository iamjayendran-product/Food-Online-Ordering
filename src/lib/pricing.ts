export const GST_RATE = 0.05;

export type Totals = {
  subtotalPaise: number;
  gstPaise: number;
  totalPaise: number;
};

export function calculateTotals(lines: { unitPricePaise: number; quantity: number }[]): Totals {
  const subtotalPaise = lines.reduce((sum, line) => sum + line.unitPricePaise * line.quantity, 0);
  const gstPaise = Math.round(subtotalPaise * GST_RATE);
  const totalPaise = subtotalPaise + gstPaise;

  return { subtotalPaise, gstPaise, totalPaise };
}
