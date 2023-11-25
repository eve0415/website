import { defineRecipe } from '@pandacss/dev';

export const paperRecipe = defineRecipe({
  className: 'paper',
  base: {
    textAlign: 'center',
    padding: 5,
    marginY: '1.25rem',
    border: '0.0625rem solid #dee2e6',
    borderRadius: 'sm',
    boxShadow:
      '0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 0.625rem 0.9375rem -0.3125rem, rgba(0, 0, 0, 0.04) 0 0.4375rem 0.4375rem -0.3125rem',
    backgroundColor: 'white',
  },
});
