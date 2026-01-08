import type { SocialLink } from './-components/SocialLinkCard/SocialLinkCard';
import type { ContactFormResult } from './-utils/contact-form';
import type { FC } from 'react';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import CurrentTime from './-components/CurrentTime/CurrentTime';
import BlueskyIcon from './-components/icons/BlueskyIcon';
import DiscordIcon from './-components/icons/DiscordIcon';
import GitHubIcon from './-components/icons/GitHubIcon';
import XIcon from './-components/icons/XIcon';
import SocialLinkCard from './-components/SocialLinkCard/SocialLinkCard';

// Mock the server function
vi.mock('./-utils/contact-form', () => ({
  submitContactForm: vi.fn(),
}));

// Mock Turnstile to auto-verify
vi.mock('./-components/TurnstileWidget/TurnstileWidget', () => ({
  default: ({ onVerify }: { onVerify: (token: string) => void }) => {
    // Auto-verify after a short delay to simulate real behavior
    setTimeout(() => onVerify('mock-turnstile-token'), 10);
    return <div data-testid='turnstile-mock'>Turnstile Mock</div>;
  },
}));

import ContactForm from './-components/ContactForm/ContactForm';
// Import after mocking
import { submitContactForm } from './-utils/contact-form';

const mockedSubmitContactForm = vi.mocked(submitContactForm);

const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/eve0415',
    handle: 'eve0415',
    icon: <GitHubIcon className='size-6' />,
    color: 'hover:border-white/50',
    iconHover: 'group-hover:bg-white/10 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.3)]',
  },
  {
    name: 'Twitter / X',
    url: 'https://twitter.com/eveevekun',
    handle: '@eveevekun',
    icon: <XIcon className='size-6' />,
    color: 'hover:border-white/50',
    iconHover: 'group-hover:bg-white/10 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.3)]',
  },
  {
    name: 'Bluesky',
    url: 'https://bsky.app/profile/eve0415.net',
    handle: '@eve0415.net',
    icon: <BlueskyIcon className='size-6' />,
    color: 'hover:border-[#0085ff]/50',
    iconHover: 'group-hover:bg-[#0085ff]/10 group-hover:shadow-[0_0_12px_rgba(0,133,255,0.4)]',
  },
  {
    name: 'Discord',
    url: '#',
    handle: 'eve0415',
    icon: <DiscordIcon className='size-6' />,
    color: 'hover:border-[#5865F2]/50',
    iconHover: 'group-hover:bg-[#5865F2]/10 group-hover:shadow-[0_0_12px_rgba(88,101,242,0.4)]',
  },
];

// Test component for LinkPage without router dependencies
const TestLinkPage: FC = () => {
  return (
    <main data-testid='main' className='min-h-dvh px-6 py-24 md:px-12'>
      <header className='mb-16'>
        <h1 className='animate-fade-in-up font-bold text-4xl tracking-tight md:text-5xl'>Link</h1>
        <p className='mt-4 text-muted-foreground'>連絡先 / SNS</p>
      </header>

      <div className='grid gap-16 lg:grid-cols-2'>
        <section>
          <h2 className='mb-8 font-mono text-sm text-subtle-foreground uppercase tracking-wider'>// Social</h2>
          <div className='grid gap-4'>
            {socialLinks.map((link, index) => (
              <SocialLinkCard key={link.name} link={link} index={index} />
            ))}
          </div>
        </section>

        <section>
          <h2 className='mb-8 font-mono text-sm text-subtle-foreground uppercase tracking-wider'>// Contact</h2>
          <ContactForm />
        </section>
      </div>

      <section className='mt-24 border-line border-t pt-12'>
        <div className='flex flex-wrap gap-8 text-sm text-subtle-foreground md:gap-12'>
          <div>
            <span className='block font-mono text-xs uppercase tracking-wider'>Location</span>
            <span className='mt-1 block text-muted-foreground'>Tokyo, Japan</span>
          </div>
          <div>
            <span className='block font-mono text-xs uppercase tracking-wider'>Timezone</span>
            <span className='mt-1 block text-muted-foreground'>UTC+9 (JST)</span>
          </div>
          <div>
            <span className='block font-mono text-xs uppercase tracking-wider'>Current Time</span>
            <span className='mt-1 block'>
              <CurrentTime />
            </span>
          </div>
          <div>
            <span className='block font-mono text-xs uppercase tracking-wider'>Status</span>
            <span className='mt-1 flex items-center gap-2 text-muted-foreground'>
              <span className='relative flex size-2'>
                <span className='absolute inline-flex size-full animate-ping rounded-full bg-neon opacity-75' />
                <span className='relative inline-flex size-2 rounded-full bg-neon' />
              </span>
              Available
            </span>
          </div>
        </div>
      </section>
    </main>
  );
};

describe('LinkPage', () => {
  test('renders page header and sections', async () => {
    await render(<TestLinkPage />);
    await expect.element(page.getByText('Link')).toBeInTheDocument();
    await expect.element(page.getByText('連絡先 / SNS')).toBeInTheDocument();
    await expect.element(page.getByText('// Social')).toBeInTheDocument();
    await expect.element(page.getByText('// Contact')).toBeInTheDocument();
  });

  test('renders social links', async () => {
    await render(<TestLinkPage />);
    await expect.element(page.getByText('GitHub')).toBeInTheDocument();
    await expect.element(page.getByText('Twitter / X')).toBeInTheDocument();
    await expect.element(page.getByText('Bluesky')).toBeInTheDocument();
    await expect.element(page.getByText('Discord')).toBeInTheDocument();
  });

  test('renders location and status info', async () => {
    await render(<TestLinkPage />);
    await expect.element(page.getByText('Tokyo, Japan')).toBeInTheDocument();
    await expect.element(page.getByText('UTC+9 (JST)')).toBeInTheDocument();
    await expect.element(page.getByText('Available')).toBeInTheDocument();
  });
});

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('form starts in idle state with empty fields', async () => {
    await render(<ContactForm />);
    await expect.element(page.getByTestId('idle-text')).toBeInTheDocument();
    await expect.element(page.getByTestId('name-input')).toHaveValue('');
    await expect.element(page.getByTestId('email-input')).toHaveValue('');
    await expect.element(page.getByTestId('message-input')).toHaveValue('');
  });

  test('form fields update on user input', async () => {
    const { getByTestId } = await render(<ContactForm />);

    await userEvent.fill(getByTestId('name-input'), 'テスト太郎');
    await userEvent.fill(getByTestId('email-input'), 'test@example.com');
    await userEvent.fill(getByTestId('message-input'), 'テストメッセージ');

    await expect.element(page.getByTestId('name-input')).toHaveValue('テスト太郎');
    await expect.element(page.getByTestId('email-input')).toHaveValue('test@example.com');
    await expect.element(page.getByTestId('message-input')).toHaveValue('テストメッセージ');
  });

  test('character counter updates with message input', async () => {
    const { getByTestId } = await render(<ContactForm />);

    await userEvent.fill(getByTestId('message-input'), 'Hello');

    await expect.element(page.getByTestId('char-counter')).toHaveTextContent('5/2000');
  });

  test('shows validation errors on empty submit', async () => {
    const { getByTestId } = await render(<ContactForm />);

    // Wait for Turnstile to auto-verify
    await expect.element(page.getByTestId('turnstile-mock')).toBeInTheDocument();

    // Submit without filling
    await userEvent.click(getByTestId('submit-button'));

    // Should show validation errors (client-side validation)
    await expect.element(page.getByTestId('name-error')).toBeVisible();
    await expect.element(page.getByTestId('email-error')).toBeVisible();
    await expect.element(page.getByTestId('message-error')).toBeVisible();
  });

  test('shows inline error on blur with invalid name', async () => {
    const { getByTestId } = await render(<ContactForm />);

    // Type a very long name
    await userEvent.fill(getByTestId('name-input'), 'a'.repeat(101));
    // Blur by clicking elsewhere
    await userEvent.click(getByTestId('email-input'));

    await expect.element(page.getByTestId('name-error')).toBeVisible();
  });

  test('clears field error on focus', async () => {
    const { getByTestId } = await render(<ContactForm />);

    // Trigger validation error
    await userEvent.fill(getByTestId('name-input'), '');
    await userEvent.click(getByTestId('email-input')); // blur to trigger validation

    // Now focus name again
    await userEvent.click(getByTestId('name-input'));

    // Error should be cleared (element should not exist)
    await expect.element(page.getByTestId('name-error')).not.toBeInTheDocument();
  });

  test('successful submission shows success message and clears form', async () => {
    const successResult: ContactFormResult = { success: true };
    mockedSubmitContactForm.mockResolvedValueOnce(successResult);

    const { getByTestId } = await render(<ContactForm />);

    // Wait for Turnstile to auto-verify
    await expect.element(page.getByTestId('turnstile-mock')).toBeInTheDocument();

    // Fill form
    await userEvent.fill(getByTestId('name-input'), 'テスト太郎');
    await userEvent.fill(getByTestId('email-input'), 'test@example.com');
    await userEvent.fill(getByTestId('message-input'), 'テストメッセージ');

    // Small delay to ensure Turnstile token is set
    await new Promise(resolve => setTimeout(resolve, 50));

    // Submit
    await userEvent.click(getByTestId('submit-button'));

    // Should show success
    await expect.element(page.getByTestId('success-text'), { timeout: 5000 }).toBeVisible();
    await expect.element(page.getByTestId('success-message')).toBeInTheDocument();

    // Form should be cleared
    await expect.element(page.getByTestId('name-input')).toHaveValue('');
    await expect.element(page.getByTestId('email-input')).toHaveValue('');
    await expect.element(page.getByTestId('message-input')).toHaveValue('');
  });

  test('rate limit error shows alternative contact options', async () => {
    const rateLimitResult: ContactFormResult = {
      success: false,
      error: 'rate_limit',
      message: 'メッセージの送信制限に達しました（1時間に3回まで）。Discord または X でお問い合わせください。',
    };
    mockedSubmitContactForm.mockResolvedValueOnce(rateLimitResult);

    const { getByTestId } = await render(<ContactForm />);

    // Wait for Turnstile
    await expect.element(page.getByTestId('turnstile-mock')).toBeInTheDocument();

    // Fill and submit
    await userEvent.fill(getByTestId('name-input'), 'テスト太郎');
    await userEvent.fill(getByTestId('email-input'), 'test@example.com');
    await userEvent.fill(getByTestId('message-input'), 'テストメッセージ');
    await new Promise(resolve => setTimeout(resolve, 50));
    await userEvent.click(getByTestId('submit-button'));

    // Should show error with alternative contact
    await expect.element(page.getByTestId('error-message')).toBeVisible();
    await expect.element(page.getByText('Discord')).toBeInTheDocument();
    await expect.element(page.getByText('X (@eveevekun)')).toBeInTheDocument();
  });

  test('email failure error shows alternative contact options', async () => {
    const emailFailedResult: ContactFormResult = {
      success: false,
      error: 'email_failed',
      message: 'メールの送信に失敗しました。Discord または X でお問い合わせください。',
    };
    mockedSubmitContactForm.mockResolvedValueOnce(emailFailedResult);

    const { getByTestId } = await render(<ContactForm />);

    // Wait for Turnstile
    await expect.element(page.getByTestId('turnstile-mock')).toBeInTheDocument();

    // Fill and submit
    await userEvent.fill(getByTestId('name-input'), 'テスト太郎');
    await userEvent.fill(getByTestId('email-input'), 'test@example.com');
    await userEvent.fill(getByTestId('message-input'), 'テストメッセージ');
    await new Promise(resolve => setTimeout(resolve, 50));
    await userEvent.click(getByTestId('submit-button'));

    // Should show error with alternative contact
    await expect.element(page.getByTestId('error-message')).toBeVisible();
  });

  test('form is disabled during submission', async () => {
    // Slow response to test disabled state
    mockedSubmitContactForm.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 500)));

    const { getByTestId } = await render(<ContactForm />);

    // Wait for Turnstile
    await expect.element(page.getByTestId('turnstile-mock')).toBeInTheDocument();

    // Fill form
    await userEvent.fill(getByTestId('name-input'), 'テスト太郎');
    await userEvent.fill(getByTestId('email-input'), 'test@example.com');
    await userEvent.fill(getByTestId('message-input'), 'テストメッセージ');
    await new Promise(resolve => setTimeout(resolve, 50));

    // Submit
    await userEvent.click(getByTestId('submit-button'));

    // Should show submitting state
    await expect.element(page.getByTestId('submitting-text')).toBeVisible();

    // Inputs should be disabled
    await expect.element(page.getByTestId('name-input')).toBeDisabled();
    await expect.element(page.getByTestId('email-input')).toBeDisabled();
    await expect.element(page.getByTestId('message-input')).toBeDisabled();
    await expect.element(page.getByTestId('submit-button')).toBeDisabled();
  });

  test('server validation errors display per-field', async () => {
    const validationResult: ContactFormResult = {
      success: false,
      error: 'validation',
      errors: {
        name: 'お名前は100文字以内で入力してください',
        email: '有効なメールアドレスを入力してください',
      },
    };
    mockedSubmitContactForm.mockResolvedValueOnce(validationResult);

    const { getByTestId } = await render(<ContactForm />);

    // Wait for Turnstile
    await expect.element(page.getByTestId('turnstile-mock')).toBeInTheDocument();

    // Fill form
    await userEvent.fill(getByTestId('name-input'), 'Test');
    await userEvent.fill(getByTestId('email-input'), 'test@example.com');
    await userEvent.fill(getByTestId('message-input'), 'Test message');
    await new Promise(resolve => setTimeout(resolve, 50));

    // Submit
    await userEvent.click(getByTestId('submit-button'));

    // Should show per-field errors
    await expect.element(page.getByTestId('name-error')).toBeVisible();
    await expect.element(page.getByTestId('email-error')).toBeVisible();
  });

  test('turnstile error shows global error message', async () => {
    const turnstileResult: ContactFormResult = {
      success: false,
      error: 'turnstile',
      message: '認証に失敗しました',
    };
    mockedSubmitContactForm.mockResolvedValueOnce(turnstileResult);

    const { getByTestId } = await render(<ContactForm />);

    // Wait for Turnstile
    await expect.element(page.getByTestId('turnstile-mock')).toBeInTheDocument();

    // Fill and submit
    await userEvent.fill(getByTestId('name-input'), 'テスト太郎');
    await userEvent.fill(getByTestId('email-input'), 'test@example.com');
    await userEvent.fill(getByTestId('message-input'), 'テストメッセージ');
    await new Promise(resolve => setTimeout(resolve, 50));
    await userEvent.click(getByTestId('submit-button'));

    // Should show global error
    await expect.element(page.getByTestId('error-message')).toBeVisible();
    await expect.element(page.getByText('認証に失敗しました')).toBeInTheDocument();
  });
});
