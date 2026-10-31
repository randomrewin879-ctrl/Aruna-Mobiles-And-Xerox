export const calculateInvoiceTotals = (invoice) => {
  const items = invoice.items || [];
  let subtotal = 0;
  let totalTax = 0;
  items.forEach(item => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.unitPrice) || 0;
    const itemSubtotal = qty * rate;
    const taxRate = parseFloat(item.taxRate) || 0;
    const itemTax = itemSubtotal * (taxRate / 100);
    subtotal += itemSubtotal;
    totalTax += itemTax;
  });
  const hasDiscount = !!invoice.hasDiscount;
  const discountVal = parseFloat(invoice.discount) || 0;
  const discountAmount = hasDiscount ? Math.min(discountVal, subtotal) : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const effectiveTax = subtotal > 0 ? (totalTax * (taxableAmount / subtotal)) : 0;
  const cgst = effectiveTax / 2;
  const sgst = effectiveTax / 2;
  const grandTotal = Math.max(0, Math.round((taxableAmount + effectiveTax) * 100) / 100);
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    totalTax: Math.round(effectiveTax * 100) / 100,
    grandTotal
  };
};

export const sanitizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '');
};

export const sanitizeFileName = (fileName) => {
  if (!fileName) return 'invoice';
  return fileName.replace(/[/\\?%*:|"<>]/g, '_').trim();
};