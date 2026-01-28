/* oxlint-disable typescript-eslint(no-unsafe-type-assertion) -- Intentionally casting to invalid types to test runtime type guards */
import { describe, expect, test } from 'vitest';

import { hasErrors, validateContactForm } from './validation';

describe('validateContactForm', () => {
  describe('type guards', () => {
    test('returns error when name is not a string', () => {
      const result = validateContactForm({
        name: 123 as unknown as string,
        email: 'test@example.com',
        message: 'Hello',
      });

      expect(result.name).toBe('お名前を入力してください');
      expect(result.email).toBeUndefined();
      expect(result.message).toBeUndefined();
    });

    test('returns error when email is not a string', () => {
      const result = validateContactForm({
        name: 'Test User',
        email: undefined as unknown as string,
        message: 'Hello',
      });

      expect(result.name).toBeUndefined();
      expect(result.email).toBe('メールアドレスを入力してください');
      expect(result.message).toBeUndefined();
    });

    test('returns error when message is not a string', () => {
      const result = validateContactForm({
        name: 'Test User',
        email: 'test@example.com',
        message: undefined as unknown as string,
      });

      expect(result.name).toBeUndefined();
      expect(result.email).toBeUndefined();
      expect(result.message).toBe('メッセージを入力してください');
    });

    test('returns errors for all non-string fields and does not proceed to value validation', () => {
      const result = validateContactForm({
        name: {} as unknown as string,
        email: [] as unknown as string,
        message: 42 as unknown as string,
      });

      expect(result.name).toBe('お名前を入力してください');
      expect(result.email).toBe('メールアドレスを入力してください');
      expect(result.message).toBe('メッセージを入力してください');
    });
  });

  describe('name validation', () => {
    test('returns error for empty name', () => {
      const result = validateContactForm({
        name: '',
        email: 'test@example.com',
        message: 'Hello',
      });

      expect(result.name).toBe('お名前を入力してください');
    });

    test('returns error for whitespace-only name', () => {
      const result = validateContactForm({
        name: '   ',
        email: 'test@example.com',
        message: 'Hello',
      });

      expect(result.name).toBe('お名前を入力してください');
    });

    test('returns error for name over 100 characters', () => {
      const result = validateContactForm({
        name: 'a'.repeat(101),
        email: 'test@example.com',
        message: 'Hello',
      });

      expect(result.name).toBe('お名前は100文字以内で入力してください');
    });

    test('accepts name exactly 100 characters', () => {
      const result = validateContactForm({
        name: 'a'.repeat(100),
        email: 'test@example.com',
        message: 'Hello',
      });

      expect(result.name).toBeUndefined();
    });

    test('trims whitespace before validation', () => {
      const result = validateContactForm({
        name: '  Test User  ',
        email: 'test@example.com',
        message: 'Hello',
      });

      expect(result.name).toBeUndefined();
    });
  });

  describe('email validation', () => {
    test('returns error for empty email', () => {
      const result = validateContactForm({
        name: 'Test User',
        email: '',
        message: 'Hello',
      });

      expect(result.email).toBe('メールアドレスを入力してください');
    });

    test('returns error for whitespace-only email', () => {
      const result = validateContactForm({
        name: 'Test User',
        email: '   ',
        message: 'Hello',
      });

      expect(result.email).toBe('メールアドレスを入力してください');
    });

    test.each([['invalid'], ['@example.com'], ['test@'], ['test@.com'], ['test @example.com'], ['test@ example.com'], ['test@example .com']])(
      'returns error for invalid email format: %s',
      invalidEmail => {
        const result = validateContactForm({
          name: 'Test User',
          email: invalidEmail,
          message: 'Hello',
        });

        expect(result.email).toBe('有効なメールアドレスを入力してください');
      },
    );

    test.each([['test@example.com'], ['user.name@example.com'], ['user+tag@example.com'], ['test@subdomain.example.com'], ['a@b.co']])(
      'accepts valid email: %s',
      validEmail => {
        const result = validateContactForm({
          name: 'Test User',
          email: validEmail,
          message: 'Hello',
        });

        expect(result.email).toBeUndefined();
      },
    );

    test('trims whitespace before validation', () => {
      const result = validateContactForm({
        name: 'Test User',
        email: '  test@example.com  ',
        message: 'Hello',
      });

      expect(result.email).toBeUndefined();
    });
  });

  describe('message validation', () => {
    test('returns error for empty message', () => {
      const result = validateContactForm({
        name: 'Test User',
        email: 'test@example.com',
        message: '',
      });

      expect(result.message).toBe('メッセージを入力してください');
    });

    test('returns error for whitespace-only message', () => {
      const result = validateContactForm({
        name: 'Test User',
        email: 'test@example.com',
        message: '   ',
      });

      expect(result.message).toBe('メッセージを入力してください');
    });

    test('returns error for message over 2000 characters', () => {
      const result = validateContactForm({
        name: 'Test User',
        email: 'test@example.com',
        message: 'a'.repeat(2001),
      });

      expect(result.message).toBe('メッセージは2000文字以内で入力してください');
    });

    test('accepts message exactly 2000 characters', () => {
      const result = validateContactForm({
        name: 'Test User',
        email: 'test@example.com',
        message: 'a'.repeat(2000),
      });

      expect(result.message).toBeUndefined();
    });

    test('trims whitespace before validation', () => {
      const result = validateContactForm({
        name: 'Test User',
        email: 'test@example.com',
        message: '  Hello World  ',
      });

      expect(result.message).toBeUndefined();
    });
  });

  describe('combined validation', () => {
    test('returns empty object for valid form data', () => {
      const result = validateContactForm({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Hello, this is a test message.',
      });

      expect(result).toStrictEqual({});
    });

    test('returns multiple errors for multiple invalid fields', () => {
      const result = validateContactForm({
        name: '',
        email: 'invalid-email',
        message: '',
      });

      expect(result.name).toBe('お名前を入力してください');
      expect(result.email).toBe('有効なメールアドレスを入力してください');
      expect(result.message).toBe('メッセージを入力してください');
    });

    test('validates all fields independently', () => {
      const result = validateContactForm({
        name: 'a'.repeat(101),
        email: 'valid@example.com',
        message: 'a'.repeat(2001),
      });

      expect(result.name).toBe('お名前は100文字以内で入力してください');
      expect(result.email).toBeUndefined();
      expect(result.message).toBe('メッセージは2000文字以内で入力してください');
    });
  });
});

describe('hasErrors', () => {
  test('returns false for empty object', () => {
    expect(hasErrors({})).toBeFalsy();
  });

  test('returns true when name error exists', () => {
    expect(hasErrors({ name: 'error' })).toBeTruthy();
  });

  test('returns true when email error exists', () => {
    expect(hasErrors({ email: 'error' })).toBeTruthy();
  });

  test('returns true when message error exists', () => {
    expect(hasErrors({ message: 'error' })).toBeTruthy();
  });

  test('returns true when multiple errors exist', () => {
    expect(hasErrors({ name: 'error', email: 'error', message: 'error' })).toBeTruthy();
  });
});
