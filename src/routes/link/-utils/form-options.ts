import { formOptions } from '@tanstack/react-form-start';

import { validateContactForm } from './validation';

export const contactFormOpts = formOptions({
  defaultValues: {
    name: '',
    email: '',
    message: '',
    turnstileToken: '' as string,
  },
  validators: {
    onBlur: ({ value }) => {
      const errors = validateContactForm({
        name: value.name,
        email: value.email,
        message: value.message,
      });
      // Return field errors in the format TanStack Form expects
      return {
        fields: {
          name: errors.name,
          email: errors.email,
          message: errors.message,
        },
      };
    },
  },
});
