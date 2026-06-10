// Shared validation logic for client and server

export interface ValidationErrors {
  name?: string;
  email?: string;
  message?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per-field validators: each validates ONLY its own field so that blurring
// one field never stamps errors onto untouched fields (which also caused
// layout shifts mid-click that swallowed submit-button clicks)
export const validateName = (name: string): string | undefined => {
  const trimmed = name.trim();
  if (!trimmed) return 'お名前を入力してください';
  if (trimmed.length > 100) return 'お名前は100文字以内で入力してください';
  return undefined;
};

export const validateEmail = (email: string): string | undefined => {
  const trimmed = email.trim();
  if (!trimmed) return 'メールアドレスを入力してください';
  if (!EMAIL_REGEX.test(trimmed)) return '有効なメールアドレスを入力してください';
  return undefined;
};

export const validateMessage = (message: string): string | undefined => {
  const trimmed = message.trim();
  if (!trimmed) return 'メッセージを入力してください';
  if (trimmed.length > 2000) return 'メッセージは2000文字以内で入力してください';
  return undefined;
};

export const validateContactForm = (data: ContactFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  const name = validateName(data.name);
  if (name) errors.name = name;

  const email = validateEmail(data.email);
  if (email) errors.email = email;

  const message = validateMessage(data.message);
  if (message) errors.message = message;

  return errors;
};

export const hasErrors = (errors: ValidationErrors): boolean => Object.keys(errors).length > 0;
