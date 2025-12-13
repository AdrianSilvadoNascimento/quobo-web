/**
 * Apply phone mask to a value
 * Format: (XX) XXXXX-XXXX
 */
export const phoneMask = (value: string): string => {
  if (!value) return '';

  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');

  // Apply mask based on length
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }

  // Limit to 11 digits
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

/**
 * Apply CPF mask to a value
 * Format: XXX.XXX.XXX-XX
 */
export const cpfMask = (value: string): string => {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  } else {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }
};

/**
 * Apply CNPJ mask to a value
 * Format: XX.XXX.XXX/XXXX-XX
 */
export const cnpjMask = (value: string): string => {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 5) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  } else if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  } else {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  }
};

/**
 * Apply CPF or CNPJ mask dynamically based on length
 */
export const cpfCnpjMask = (value: string): string => {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');

  // If 11 digits or less, treat as CPF
  if (numbers.length <= 11) {
    return cpfMask(value);
  }

  // Otherwise, treat as CNPJ
  return cnpjMask(value);
};

/**
 * Remove mask from a value, returning only numbers
 */
export const removeMask = (value: string): string => {
  return value.replace(/\D/g, '');
};
