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

export const validateContactForm = (data: ContactFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Type guards - ensure all fields are strings to prevent runtime errors
  if (typeof data.name !== 'string') errors.name = 'お名前を入力してください';

  if (typeof data.email !== 'string') errors.email = 'メールアドレスを入力してください';

  if (typeof data.message !== 'string') errors.message = 'メッセージを入力してください';

  // Return early if type guards fail
  if (Object.keys(errors).length > 0) return errors;

  // Name validation
  const trimmedName = data.name.trim();
  if (!trimmedName) errors.name = 'お名前を入力してください';
  else if (trimmedName.length > 100) errors.name = 'お名前は100文字以内で入力してください';

  // Email validation
  const trimmedEmail = data.email.trim();
  if (!trimmedEmail) errors.email = 'メールアドレスを入力してください';
  else if (!EMAIL_REGEX.test(trimmedEmail)) errors.email = '有効なメールアドレスを入力してください';

  // Message validation
  const trimmedMessage = data.message.trim();
  if (!trimmedMessage) errors.message = 'メッセージを入力してください';
  else if (trimmedMessage.length > 2000) errors.message = 'メッセージは2000文字以内で入力してください';

  return errors;
};

export const hasErrors = (errors: ValidationErrors): boolean => Object.keys(errors).length > 0;
