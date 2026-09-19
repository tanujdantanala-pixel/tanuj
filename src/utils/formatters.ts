export function formatCurrency(
  amount: number,
  currency: '₹' | '$' = '₹',
  compact: boolean = false
): string {
  if (compact) {
    if (currency === '₹') {
      if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)}Cr`;
      }
      if (amount >= 100000) {
        const lakhs = (amount / 100000).toFixed(1).replace(/\.0$/, '');
        return `₹${lakhs}L`;
      }
      if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}k`;
      }
      return `₹${amount}`;
    } else {
      if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
      }
      if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}k`;
      }
      return `$${amount.toFixed(2)}`;
    }
  }

  if (currency === '₹') {
    // Indian numbering format (e.g., 12,45,000)
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
    return `₹${formatted}`;
  } else {
    // Western format (e.g., 12,875.00)
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `$${formatted}`;
  }
}

export function generateInvoiceNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `#INV-${num}`;
}
