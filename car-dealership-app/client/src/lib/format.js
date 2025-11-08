const currencyFormatter = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK',
  maximumFractionDigits: 0
});

export function formatCurrency(value) {
  if (value === null || value === undefined) return '—';
  return currencyFormatter.format(Number(value));
}

export function formatNumber(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('sv-SE').format(Number(value));
}

export function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium' }).format(new Date(value));
}
