/**
 * Verification Code Generator
 * Generates short, readable codes for TFA and PIF form verification
 * Format: TFA-8X9K2 or PIF-3M7Q5
 */

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes I, O, 0, 1 for clarity

/**
 * Generate a random character from the code alphabet
 */
function randomChar(): string {
  return CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
}

/**
 * Generate a verification code for TFA forms
 * Format: TFA-XXXXX (e.g., TFA-8X9K2)
 */
export function generateTFAVerificationCode(): string {
  const randomPart = Array.from({ length: 5 }, () => randomChar()).join('');
  return `TFA-${randomPart}`;
}

/**
 * Generate a verification code for PIF forms
 * Format: PIF-XXXXX (e.g., PIF-3M7Q5)
 */
export function generatePIFVerificationCode(): string {
  const randomPart = Array.from({ length: 5 }, () => randomChar()).join('');
  return `PIF-${randomPart}`;
}

/**
 * Validate a verification code format
 */
export function isValidVerificationCode(code: string, type: 'tfa' | 'pif'): boolean {
  const prefix = type === 'tfa' ? 'TFA-' : 'PIF-';
  if (!code.startsWith(prefix)) return false;
  
  const randomPart = code.substring(prefix.length);
  if (randomPart.length !== 5) return false;
  
  // Check all characters are valid
  return randomPart.split('').every(char => CODE_ALPHABET.includes(char));
}
