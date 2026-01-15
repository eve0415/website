import { vi } from 'vitest';

// Types need to be redefined here to avoid importing the real module
export type ContactFormResult =
  | { success: true }
  | { success: false; error: 'validation'; errors: { name?: string; email?: string; message?: string } }
  | { success: false; error: 'turnstile'; message: string }
  | { success: false; error: 'rate_limit'; message: string }
  | { success: false; error: 'email_failed'; message: string };

// Mock the server function
export const submitContactForm =
  vi.fn<(opts: { data: { formData: { name: string; email: string; message: string }; turnstileToken: string } }) => Promise<ContactFormResult>>();
