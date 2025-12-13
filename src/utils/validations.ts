/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate full name (minimum 2 words)
 */
export const validateFullName = (name: string): boolean => {
  if (!name) return false;

  const trimmedName = name.trim();
  const words = trimmedName.split(/\s+/);

  // Must have at least 2 words and each word must have at least 1 character
  return words.length >= 2 && words.every(word => word.length > 0);
};

/**
 * Validate CPF
 */
export const validateCPF = (cpf: string): boolean => {
  if (!cpf) return false;

  // Remove non-numeric characters
  const numbers = cpf.replace(/\D/g, '');

  // Must have exactly 11 digits
  if (numbers.length !== 11) return false;

  // Check if all digits are the same (invalid CPF)
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  if (checkDigit !== parseInt(numbers.charAt(9))) return false;

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  if (checkDigit !== parseInt(numbers.charAt(10))) return false;

  return true;
};

/**
 * Validate CNPJ
 */
export const validateCNPJ = (cnpj: string): boolean => {
  if (!cnpj) return false;

  // Remove non-numeric characters
  const numbers = cnpj.replace(/\D/g, '');

  // Must have exactly 14 digits
  if (numbers.length !== 14) return false;

  // Check if all digits are the same (invalid CNPJ)
  if (/^(\d)\1{13}$/.test(numbers)) return false;

  // Validate first check digit
  let length = numbers.length - 2;
  let nums = numbers.substring(0, length);
  const digits = numbers.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(nums.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  // Validate second check digit
  length = length + 1;
  nums = numbers.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(nums.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

/**
 * Validate phone number (Brazilian format)
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return false;

  const numbers = phone.replace(/\D/g, '');

  // Must have 10 or 11 digits (with or without 9th digit)
  return numbers.length === 10 || numbers.length === 11;
};

/**
 * Validate CPF or CNPJ based on length
 */
export const validateCPFOrCNPJ = (value: string): boolean => {
  if (!value) return false;

  const numbers = value.replace(/\D/g, '');

  if (numbers.length === 11) {
    return validateCPF(value);
  } else if (numbers.length === 14) {
    return validateCNPJ(value);
  }

  return false;
};
