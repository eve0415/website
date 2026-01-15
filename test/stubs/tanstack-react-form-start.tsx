// Stub for @tanstack/react-form-start in browser test environment
// Re-exports client-safe functionality from the base form package without SSR deps

// Re-export everything from the base react-form package (client-safe)
export * from '@tanstack/react-form';

// Stub SSR-specific exports that would bring in react-dom/server
export const createServerValidate = () => () => Promise.resolve({});
export const getFormData = () => () => Promise.resolve({});
export const initialFormState = {};
export const useTransform = (fn: unknown, _deps: unknown[]) => fn;
export class ServerValidateError extends Error {
  constructor() {
    super('ServerValidateError stub');
  }
}

// Simplified formOptions that just returns the options
export const formOptions = <T,>(opts: T): T => opts;
