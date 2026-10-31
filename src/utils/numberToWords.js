export const numberToWords = (num) => {
  if (num === null || num === undefined || isNaN(num) || num === 0) {
    return 'Zero Rupees Only';
  }
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const convertHundreds = (n) => {
    let str = '';
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + ' ';
    }
    return str.trim();
  };
  const rounded = Math.round(Math.abs(num) * 100) / 100;
  let integerPart = Math.floor(rounded);
  const paise = Math.round((rounded - integerPart) * 100);
  let words = '';
  if (integerPart >= 10000000) {
    words += convertHundreds(Math.floor(integerPart / 10000000)) + ' Crore ';
    integerPart %= 10000000;
  }
  if (integerPart >= 100000) {
    words += convertHundreds(Math.floor(integerPart / 100000)) + ' Lakh ';
    integerPart %= 100000;
  }
  if (integerPart >= 1000) {
    words += convertHundreds(Math.floor(integerPart / 1000)) + ' Thousand ';
    integerPart %= 1000;
  }
  if (integerPart > 0) {
    words += convertHundreds(integerPart) + ' ';
  }
  words = words.trim();
  if (!words) words = 'Zero';

  let result = words + ' Rupees';
  if (paise > 0) {
    result += ' and ' + convertHundreds(paise) + ' Paise';
  }
  return result + ' Only';
};
export const formatCurrency = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0.00';
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};