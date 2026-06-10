/* oxlint-disable promise/prefer-await-to-callbacks -- Mock callback setters for Turnstile widget testing */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser';
import { render } from 'vitest-browser-react';

// Types for mock
type ContactFormResult =
  | { success: true }
  | { success: false; error: 'validation'; errors: { name?: string; email?: string; message?: string } }
  | { success: false; error: 'turnstile'; message: string }
  | { success: false; error: 'rate_limit'; message: string }
  | { success: false; error: 'email_failed'; message: string };

// Hoist mock to make it available in vi.mock factory
const { submitMock, getTurnstileCallback, setTurnstileCallback } = vi.hoisted(() => {
  let turnstileCallback: ((token: string) => void) | null;
  return {
    submitMock: vi.fn(),
    getTurnstileCallback: () => turnstileCallback,
    setTurnstileCallback: (cb: ((token: string) => void) | null) => {
      turnstileCallback = cb;
    },
  };
});

// Mock the server function module (uses cloudflare: imports not available in browser)
// oxlint-disable-next-line typescript/require-await -- vi.mock factory can be async
vi.mock('../../-utils/contact-form', async () => ({
  handleForm: Object.assign(submitMock, { url: '/api/contact' }),
}));

// Mock TurnstileWidget - provide token callback for tests
vi.mock('../TurnstileWidget/turnstile-widget', () => ({
  default: ({ onVerify }: { onVerify: (token: string) => void }) => {
    setTurnstileCallback(onVerify);
    return <div data-testid='turnstile-mock' />;
  },
}));

import ContactForm from './contact-form';

// Helper to trigger blur by clicking on a different element
const triggerBlur = async () => {
  // Click on the email label to blur current field without triggering form submission
  await page.getByText('メールアドレス').click();
};

describe('contactForm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setTurnstileCallback(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders all form fields', async () => {
      await render(<ContactForm />);

      await expect.element(page.getByTestId('name-input')).toBeVisible();
      await expect.element(page.getByTestId('email-input')).toBeVisible();
      await expect.element(page.getByTestId('message-input')).toBeVisible();
      await expect.element(page.getByTestId('turnstile-container')).toBeInTheDocument();
      await expect.element(page.getByTestId('submit-button')).toBeVisible();
    });

    test('initial state has empty fields and enabled submit button', async () => {
      await render(<ContactForm />);

      const nameInput = page.getByTestId('name-input');
      const emailInput = page.getByTestId('email-input');
      const messageInput = page.getByTestId('message-input');
      const submitButton = page.getByTestId('submit-button');

      await expect.element(nameInput).toHaveValue('');
      await expect.element(emailInput).toHaveValue('');
      await expect.element(messageInput).toHaveValue('');
      await expect.element(submitButton).not.toBeDisabled();
      await expect.element(page.getByTestId('idle-text')).toHaveTextContent('送信する');
    });

    test('displays character counter for message field', async () => {
      await render(<ContactForm />);

      await expect.element(page.getByTestId('char-counter')).toHaveTextContent('0/2000');
    });
  });

  describe('field Validation', () => {
    test('name field shows error when empty on blur', async () => {
      await render(<ContactForm />);

      const nameInput = page.getByTestId('name-input');
      await nameInput.click();
      await triggerBlur();

      await expect.element(page.getByTestId('name-error')).toHaveTextContent('お名前を入力してください');
    });

    test('name field shows error when only whitespace', async () => {
      await render(<ContactForm />);

      const nameInput = page.getByTestId('name-input');
      await nameInput.fill('   ');
      await triggerBlur();

      await expect.element(page.getByTestId('name-error')).toHaveTextContent('お名前を入力してください');
    });

    test('name field has maxLength constraint', async () => {
      await render(<ContactForm />);

      const nameInput = page.getByTestId('name-input');
      // Browser enforces maxLength, preventing input over 100 chars
      await expect.element(nameInput).toHaveAttribute('maxlength', '100');
    });

    test('name field shows no error with valid input', async () => {
      await render(<ContactForm />);

      const nameInput = page.getByTestId('name-input');
      await nameInput.fill('山田太郎');
      await triggerBlur();

      const errorElement = page.getByTestId('name-error');
      await expect.element(errorElement).not.toBeInTheDocument();
    });

    test('email field shows error when empty on blur', async () => {
      await render(<ContactForm />);

      const emailInput = page.getByTestId('email-input');
      await emailInput.click();
      await triggerBlur();

      await expect.element(page.getByTestId('email-error')).toHaveTextContent('メールアドレスを入力してください');
    });

    test('email field shows error with invalid format', async () => {
      await render(<ContactForm />);

      const emailInput = page.getByTestId('email-input');
      await emailInput.fill('invalid-email');
      await triggerBlur();

      await expect.element(page.getByTestId('email-error')).toHaveTextContent('有効なメールアドレスを入力してください');
    });

    test('email field shows no error with valid email', async () => {
      await render(<ContactForm />);

      const emailInput = page.getByTestId('email-input');
      await emailInput.fill('test@example.com');
      await triggerBlur();

      const errorElement = page.getByTestId('email-error');
      await expect.element(errorElement).not.toBeInTheDocument();
    });

    test('message field shows error when empty on blur', async () => {
      await render(<ContactForm />);

      const messageInput = page.getByTestId('message-input');
      await messageInput.click();
      await triggerBlur();

      await expect.element(page.getByTestId('message-error')).toHaveTextContent('メッセージを入力してください');
    });

    test('message field has maxLength constraint', async () => {
      await render(<ContactForm />);

      const messageInput = page.getByTestId('message-input');
      // Browser enforces maxLength, preventing input over 2000 chars
      await expect.element(messageInput).toHaveAttribute('maxlength', '2000');
    });

    test('message field shows no error with valid message', async () => {
      await render(<ContactForm />);

      const messageInput = page.getByTestId('message-input');
      await messageInput.fill('これはテストメッセージです');
      await triggerBlur();

      const errorElement = page.getByTestId('message-error');
      await expect.element(errorElement).not.toBeInTheDocument();
    });

    test('character counter updates with input', async () => {
      await render(<ContactForm />);

      const messageInput = page.getByTestId('message-input');
      await messageInput.fill('テスト');

      await expect.element(page.getByTestId('char-counter')).toHaveTextContent('3/2000');
    });

    test('clears field error when typing', async () => {
      await render(<ContactForm />);

      const nameInput = page.getByTestId('name-input');
      await nameInput.click();
      await triggerBlur();
      await expect.element(page.getByTestId('name-error')).toBeVisible();

      await nameInput.fill('山');

      await expect.element(page.getByTestId('name-error')).not.toBeInTheDocument();
    });

    test('marks invalid fields with aria-invalid and links the error message', async () => {
      await render(<ContactForm />);

      const nameInput = page.getByTestId('name-input');
      await nameInput.click();
      await triggerBlur();

      await expect.element(nameInput).toHaveAttribute('aria-invalid', 'true');
      await expect.element(nameInput).toHaveAttribute('aria-describedby', 'name-error');
    });
  });

  describe('submission Flow', () => {
    // Submission tests need real timers for async form handling to work properly
    beforeEach(() => {
      vi.useRealTimers();
    });

    afterEach(() => {
      vi.useFakeTimers();
    });

    test('shows validation errors when submitting an empty form', async () => {
      await render(<ContactForm />);

      await page.getByTestId('submit-button').click();

      await expect.element(page.getByTestId('name-error')).toBeInTheDocument();
      await expect.element(page.getByTestId('email-error')).toBeInTheDocument();
      await expect.element(page.getByTestId('message-error')).toBeInTheDocument();
    });

    test('shows error when Turnstile token is missing', async () => {
      await render(<ContactForm />);

      // Fill form without triggering Turnstile
      await page.getByTestId('name-input').fill('山田太郎');
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('message-input').fill('テストメッセージ');

      // Submit without Turnstile token
      await page.getByTestId('submit-button').click();

      await expect.element(page.getByTestId('error-message')).toHaveTextContent('セキュリティ認証を完了してください');
    });

    test('handles successful submission', async () => {
      submitMock.mockResolvedValue({ success: true } as ContactFormResult);

      await render(<ContactForm />);

      // Fill form
      await page.getByTestId('name-input').fill('山田太郎');
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('message-input').fill('テストメッセージ');

      // Trigger Turnstile verification
      getTurnstileCallback()?.('mock-token');

      // Submit
      await page.getByTestId('submit-button').click();

      // Wait for success state
      await expect.element(page.getByTestId('success-text')).toHaveTextContent('送信完了!');
      await expect.element(page.getByTestId('success-message')).toHaveTextContent('メッセージが送信されました');

      // Form should be reset
      await expect.element(page.getByTestId('name-input')).toHaveValue('');
    });

    // Note: Server-side validation errors set via form.setFieldMeta have complex timing
    // with TanStack Form. Other error types (rate_limit, turnstile, email_failed) are tested below.

    test('handles rate limit error', async () => {
      submitMock.mockResolvedValue({
        success: false,
        error: 'rate_limit',
        message: '送信制限に達しました。しばらくしてからお試しください。',
      } as ContactFormResult);

      await render(<ContactForm />);

      // Fill form
      await page.getByTestId('name-input').fill('山田太郎');
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('message-input').fill('テストメッセージ');

      // Trigger Turnstile verification
      getTurnstileCallback()?.('mock-token');

      // Submit
      await page.getByTestId('submit-button').click();

      await expect.element(page.getByTestId('error-message')).toHaveTextContent('送信制限に達しました');
    });

    test('handles turnstile error', async () => {
      submitMock.mockResolvedValue({
        success: false,
        error: 'turnstile',
        message: 'セキュリティ認証に失敗しました',
      } as ContactFormResult);

      await render(<ContactForm />);

      // Fill form
      await page.getByTestId('name-input').fill('山田太郎');
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('message-input').fill('テストメッセージ');

      // Trigger Turnstile verification
      getTurnstileCallback()?.('mock-token');

      // Submit
      await page.getByTestId('submit-button').click();

      await expect.element(page.getByTestId('error-message')).toHaveTextContent('セキュリティ認証に失敗しました');
    });

    test('handles email_failed error', async () => {
      submitMock.mockResolvedValue({
        success: false,
        error: 'email_failed',
        message: 'メール送信に失敗しました。Discord経由でご連絡ください。',
      } as ContactFormResult);

      await render(<ContactForm />);

      // Fill form
      await page.getByTestId('name-input').fill('山田太郎');
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('message-input').fill('テストメッセージ');

      // Trigger Turnstile verification
      getTurnstileCallback()?.('mock-token');

      // Submit
      await page.getByTestId('submit-button').click();

      await expect.element(page.getByTestId('error-message')).toHaveTextContent('Discord経由でご連絡ください');
    });

    test('handles network error', async () => {
      submitMock.mockRejectedValue(new Error('Network error'));

      await render(<ContactForm />);

      // Fill form
      await page.getByTestId('name-input').fill('山田太郎');
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('message-input').fill('テストメッセージ');

      // Trigger Turnstile verification
      getTurnstileCallback()?.('mock-token');

      // Submit
      await page.getByTestId('submit-button').click();

      await expect.element(page.getByTestId('error-message')).toHaveTextContent('予期せぬエラーが発生しました');
    });
  });

  describe('uI States', () => {
    // Submission tests need real timers for async form handling to work properly
    beforeEach(() => {
      vi.useRealTimers();
    });

    afterEach(() => {
      vi.useFakeTimers();
    });

    test('shows alternative contact for email_failed errors', async () => {
      submitMock.mockResolvedValue({
        success: false,
        error: 'email_failed',
        message: 'メール送信に失敗しました。Discord経由でご連絡ください。',
      } as ContactFormResult);

      await render(<ContactForm />);

      // Fill form
      await page.getByTestId('name-input').fill('山田太郎');
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('message-input').fill('テストメッセージ');

      // Trigger Turnstile verification
      getTurnstileCallback()?.('mock-token');

      // Submit
      await page.getByTestId('submit-button').click();

      // Should show alternative contact info
      await expect.element(page.getByText('Discord (eve0415)')).toBeVisible();
    });

    test('shows alternative contact for rate_limit errors', async () => {
      submitMock.mockResolvedValue({
        success: false,
        error: 'rate_limit',
        message: '送信制限に達しました',
      } as ContactFormResult);

      await render(<ContactForm />);

      // Fill form
      await page.getByTestId('name-input').fill('山田太郎');
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('message-input').fill('テストメッセージ');

      // Trigger Turnstile verification
      getTurnstileCallback()?.('mock-token');

      // Submit
      await page.getByTestId('submit-button').click();

      // Should show alternative contact info
      await expect.element(page.getByText('Discord (eve0415)')).toBeVisible();
    });

    test('success message persists until the user edits a field', async () => {
      submitMock.mockResolvedValue({ success: true } as ContactFormResult);

      await render(<ContactForm />);

      // Fill form
      await page.getByTestId('name-input').fill('山田太郎');
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('message-input').fill('テストメッセージ');

      // Trigger Turnstile verification
      getTurnstileCallback()?.('mock-token');

      // Submit
      await page.getByTestId('submit-button').click();

      // Success message stays (no timed dismissal - WCAG 2.2.1)
      await expect.element(page.getByTestId('success-message')).toBeVisible();
      await expect.element(page.getByTestId('success-text')).toHaveTextContent('送信完了!');

      // Editing a field returns the form to idle
      await page.getByTestId('name-input').fill('再');

      await expect.element(page.getByTestId('success-message')).not.toBeInTheDocument();
      await expect.element(page.getByTestId('idle-text')).toHaveTextContent('送信する');
    });

    test('announces errors via role=alert and success via role=status', async () => {
      submitMock.mockResolvedValue({ success: true } as ContactFormResult);

      await render(<ContactForm />);

      // Submit without a Turnstile token to trigger the global error
      await page.getByTestId('name-input').fill('山田太郎');
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('message-input').fill('テストメッセージ');
      await page.getByTestId('submit-button').click();

      await expect.element(page.getByRole('alert')).toHaveTextContent('セキュリティ認証を完了してください');

      // Complete Turnstile and submit again - success lands in role=status
      getTurnstileCallback()?.('mock-token');
      await page.getByTestId('submit-button').click();

      await expect.element(page.getByRole('status')).toHaveTextContent('メッセージが送信されました');
    });
  });
});
