const DANGEROUS_CHARS = /[<>\"'&]/g;
const SCRIPT_TAGS = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  let sanitized = input.replace(SCRIPT_TAGS, '');
  
  sanitized = sanitized.replace(DANGEROUS_CHARS, '');
  
  sanitized = sanitized.trim();
  
  return sanitized;
};

export const validateName = (name: string): { isValid: boolean; error: string; sanitized: string } => {
  const sanitized = sanitizeString(name);
  
  if (!sanitized || sanitized.length === 0) {
    return { isValid: false, error: 'Name is required', sanitized: '' };
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters', sanitized };
  }
  
  if (sanitized.length > 100) {
    return { isValid: false, error: 'Name must not exceed 100 characters', sanitized: sanitized.substring(0, 100) };
  }
  
  const namePattern = /^[a-zA-Z\s'-]+$/;
  if (!namePattern.test(sanitized)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes', sanitized };
  }
  
  return { isValid: true, error: '', sanitized };
};

export const validateEmail = (email: string): { isValid: boolean; error: string; sanitized: string } => {
  const sanitized = sanitizeString(email.trim().toLowerCase());
  
  if (!sanitized || sanitized.length === 0) {
    return { isValid: false, error: 'Email is required', sanitized: '' };
  }
  
  if (sanitized.length > 200) {
    return { isValid: false, error: 'Email must not exceed 200 characters', sanitized: sanitized.substring(0, 200) };
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(sanitized)) {
    return { isValid: false, error: 'Please enter a valid email address', sanitized };
  }
  
  if (SCRIPT_TAGS.test(sanitized) || DANGEROUS_CHARS.test(sanitized)) {
    return { isValid: false, error: 'Email contains invalid characters', sanitized: sanitizeString(sanitized) };
  }
  
  return { isValid: true, error: '', sanitized };
};

