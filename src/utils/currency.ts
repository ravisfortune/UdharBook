/** Format number as Indian Rupee */
export function formatCurrency(amount: number, showSign = false): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });
  const prefix = showSign && amount > 0 ? '+' : '';
  return `${prefix}₹${formatted}`;
}

/** Short form: 1200 → ₹1.2K, 150000 → ₹1.5L */
export function formatCurrencyShort(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${(abs / 1000).toFixed(1)}K`;
  return `₹${abs.toLocaleString('en-IN')}`;
}
