import { formOptions } from '@tanstack/react-form-start';

interface ContactFormValues {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
}

const defaultValues: ContactFormValues = {
  name: '',
  email: '',
  message: '',
  turnstileToken: '',
};

// Validation lives on each form.Field (per-field onBlur validators in
// contact-form.tsx) so a blur only ever touches its own field's errors
export const contactFormOpts = formOptions({
  defaultValues,
});
