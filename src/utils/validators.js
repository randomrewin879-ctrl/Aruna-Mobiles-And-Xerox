export const validateGmail = (email, required = false) => {
  const clean = email != null ? String(email).trim() : '';
  if (!clean) {
    if (required) {
      return { valid: false, message: 'Gmail address is required.' };
    }
    return { valid: true, message: '' };
  }
  const gmailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@gmail\.com$/i;
  if (!gmailRegex.test(clean)) {
    if (!clean.toLowerCase().endsWith('@gmail.com')) {
      return { valid: false, message: 'Only valid @gmail.com addresses are allowed (e.g. name@gmail.com).' };
    }
    return { valid: false, message: 'Invalid Gmail format. Please check for special characters or spaces.' };
  }
  return { valid: true, message: '' };
};

export const validateSinglePhone = (phone, required = false) => {
  const clean = phone != null ? String(phone).trim() : '';
  if (!clean) {
    if (required) {
      return { valid: false, message: 'Mobile number is required.' };
    }
    return { valid: true, message: '' };
  }
  if (clean.startsWith('+91')) {
    const remainder = clean.slice(3).replace(/[\s-]/g, '');
    if (!/^\d+$/.test(remainder)) {
      return { valid: false, message: '+91 must be followed by numbers only.' };
    }
    if (remainder.length !== 10) {
      return { 
        valid: false, 
        message: `+91 must be followed by exactly 10 digits (currently ${remainder.length} digits).` 
      };
    }
    return { valid: true, message: '' };
  }
  const digitsOnly = clean.replace(/[\s-]/g, '');
  if (!/^\d+$/.test(digitsOnly)) {
    return { valid: false, message: 'Mobile number must contain digits only (or start with +91).' };
  }
  if (digitsOnly.length !== 10) {
    return { 
      valid: false, 
      message: `Mobile number must be exactly 10 digits (currently ${digitsOnly.length} digits).` 
    };
  }
  return { valid: true, message: '' };
};

export const validateCustomerPhone = (phonesStr, required = false) => {
  const cleanStr = phonesStr != null ? String(phonesStr).trim() : '';
  if (!cleanStr) {
    if (required) {
      return { valid: false, message: 'Customer phone number is required.' };
    }
    return { valid: true, message: '' };
  }
  const parts = cleanStr.split(/[,/;\n]+/).map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { valid: true, message: '' };
  }
  for (let i = 0; i < parts.length; i++) {
    const singleResult = validateSinglePhone(parts[i], true);
    if (!singleResult.valid) {
      return {
        valid: false,
        message: `Number ${i + 1} ("${parts[i]}") is invalid: ${singleResult.message}`
      };
    }
  }
  return { valid: true, message: '' };
};

export const sanitizeSinglePhoneInput = (val) => {
  if (val == null) return '';
  const trimmed = String(val).trimStart();
  if (trimmed.startsWith('+91')) {
    const digits = trimmed.slice(3).replace(/\D/g, '').slice(0, 10);
    return digits.length > 0 ? `+91 ${digits}` : '+91 ';
  }
  if (trimmed.startsWith('+')) {
    if ('+91'.startsWith(trimmed)) {
      return trimmed;
    }
  }
  return trimmed.replace(/\D/g, '').slice(0, 10);
};

export const sanitizeCustomerPhoneInput = (val) => {
  if (val == null) return '';
  return String(val).replace(/[^0-9+,/;\s-]/g, '');
};