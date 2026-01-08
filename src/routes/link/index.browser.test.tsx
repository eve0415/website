import type { FC, FormEvent } from 'react';

import { useState } from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

import CurrentTime from './-components/CurrentTime/CurrentTime';
import SocialLinkCard from './-components/SocialLinkCard/SocialLinkCard';

const socialLinks = [
  { name: 'GitHub', url: 'https://github.com/eve0415', handle: 'eve0415', icon: 'GH', color: 'hover:border-[#238636]/50' },
  { name: 'Twitter / X', url: 'https://twitter.com/eveevekun', handle: '@eveevekun', icon: 'X', color: 'hover:border-muted-foreground/50' },
  { name: 'Bluesky', url: 'https://bsky.app/profile/eve0415.net', handle: '@eve0415.net', icon: 'BS', color: 'hover:border-[#0085ff]/50' },
  { name: 'Discord', url: '#', handle: 'eve0415', icon: 'DC', color: 'hover:border-[#5865F2]/50' },
];

// Test component without router dependencies
const TestLinkPage: FC = () => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormState('submitting');

    // Simulate form submission - longer timeout to reliably test submitting state
    await new Promise(resolve => setTimeout(resolve, 500));

    setFormState('success');
    setFormData({ name: '', email: '', message: '' });

    // Reset after reduced time for testing
    setTimeout(() => setFormState('idle'), 200);
  };

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
          <div className='mt-8 rounded-lg border border-line border-dashed bg-surface/50 p-4'>
            <div className='flex items-center gap-3'>
              <span className='flex size-10 items-center justify-center rounded-lg bg-muted font-mono text-sm text-subtle-foreground'>@</span>
              <div>
                <span className='block text-sm text-subtle-foreground'>直接メール</span>
                <a href='mailto:eve@eve0415.net' className='font-mono text-muted-foreground transition-colors hover:text-neon'>
                  eve@eve0415.net
                </a>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className='mb-8 font-mono text-sm text-subtle-foreground uppercase tracking-wider'>// Contact</h2>
          <form data-testid='contact-form' onSubmit={handleSubmit} className='space-y-6'>
            <div className='group'>
              <label htmlFor='name' className='mb-2 block text-muted-foreground text-sm transition-colors group-focus-within:text-neon'>
                お名前
              </label>
              <input
                type='text'
                id='name'
                data-testid='name-input'
                required
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className='w-full rounded-lg border border-line bg-surface px-4 py-3 text-foreground transition-all duration-fast placeholder:text-subtle-foreground focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon'
                placeholder='山田太郎'
                disabled={formState === 'submitting'}
              />
            </div>
            <div className='group'>
              <label htmlFor='email' className='mb-2 block text-muted-foreground text-sm transition-colors group-focus-within:text-neon'>
                メールアドレス
              </label>
              <input
                type='email'
                id='email'
                data-testid='email-input'
                required
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className='w-full rounded-lg border border-line bg-surface px-4 py-3 text-foreground transition-all duration-fast placeholder:text-subtle-foreground focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon'
                placeholder='you@example.com'
                disabled={formState === 'submitting'}
              />
            </div>
            <div className='group'>
              <label htmlFor='message' className='mb-2 block text-muted-foreground text-sm transition-colors group-focus-within:text-neon'>
                メッセージ
              </label>
              <textarea
                id='message'
                data-testid='message-input'
                required
                rows={5}
                value={formData.message}
                onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className='w-full resize-none rounded-lg border border-line bg-surface px-4 py-3 text-foreground transition-all duration-fast placeholder:text-subtle-foreground focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon'
                placeholder='ご用件をお書きください...'
                disabled={formState === 'submitting'}
              />
            </div>
            <button
              type='submit'
              data-testid='submit-button'
              disabled={formState === 'submitting' || formState === 'success'}
              className={`group relative w-full overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-fast ${
                formState === 'success' ? 'bg-neon/20 text-neon' : 'bg-neon text-background hover:shadow-glow/20 hover:shadow-lg'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className='relative z-10'>
                {formState === 'submitting' ? (
                  <span data-testid='submitting-text' className='flex items-center justify-center gap-2'>
                    <span className='size-4 animate-spin rounded-full border-2 border-background border-t-transparent' />
                    送信中...
                  </span>
                ) : formState === 'success' ? (
                  <span data-testid='success-text'>送信完了！ ✓</span>
                ) : (
                  <span data-testid='idle-text'>送信する</span>
                )}
              </span>
            </button>
            {formState === 'success' && (
              <p data-testid='success-message' className='animate-fade-in-up text-center text-neon text-sm'>
                メッセージが送信されました。ありがとうございます！
              </p>
            )}
            {formState === 'error' && (
              <p data-testid='error-message' className='animate-fade-in-up text-center text-orange text-sm'>
                エラーが発生しました。もう一度お試しください。
              </p>
            )}
          </form>
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

  test('form starts in idle state with empty fields', async () => {
    await render(<TestLinkPage />);
    await expect.element(page.getByTestId('idle-text')).toBeInTheDocument();
    await expect.element(page.getByTestId('name-input')).toHaveValue('');
    await expect.element(page.getByTestId('email-input')).toHaveValue('');
    await expect.element(page.getByTestId('message-input')).toHaveValue('');
  });

  test('form fields update on user input', async () => {
    const { getByTestId } = await render(<TestLinkPage />);

    const nameInput = getByTestId('name-input');
    const emailInput = getByTestId('email-input');
    const messageInput = getByTestId('message-input');

    await nameInput.fill('テスト太郎');
    await emailInput.fill('test@example.com');
    await messageInput.fill('テストメッセージ');

    await expect.element(page.getByTestId('name-input')).toHaveValue('テスト太郎');
    await expect.element(page.getByTestId('email-input')).toHaveValue('test@example.com');
    await expect.element(page.getByTestId('message-input')).toHaveValue('テストメッセージ');
  });

  test('form submission transitions through states and clears data', async () => {
    const { getByTestId } = await render(<TestLinkPage />);

    // Fill form
    await userEvent.fill(getByTestId('name-input'), 'テスト太郎');
    await userEvent.fill(getByTestId('email-input'), 'test@example.com');
    await userEvent.fill(getByTestId('message-input'), 'テストメッセージ');

    // Verify initial state
    await expect.element(page.getByTestId('idle-text')).toBeInTheDocument();

    // Submit form by clicking button
    await userEvent.click(getByTestId('submit-button'));

    // Wait for success state (submitting state is too brief to reliably test at 100ms)
    await expect.element(page.getByTestId('success-text')).toBeVisible();
    await expect.element(page.getByTestId('success-message')).toBeInTheDocument();

    // Form data should be cleared
    await expect.element(page.getByTestId('name-input')).toHaveValue('');
    await expect.element(page.getByTestId('email-input')).toHaveValue('');
    await expect.element(page.getByTestId('message-input')).toHaveValue('');

    // Wait for idle state (TestLinkPage resets after 200ms)
    await expect.element(page.getByTestId('idle-text')).toBeVisible();
  });

  test('submit button is disabled during submission', async () => {
    const { getByTestId } = await render(<TestLinkPage />);

    await userEvent.fill(getByTestId('name-input'), 'テスト太郎');
    await userEvent.fill(getByTestId('email-input'), 'test@example.com');
    await userEvent.fill(getByTestId('message-input'), 'テストメッセージ');

    // Submit form
    await userEvent.click(getByTestId('submit-button'));

    // Button should be disabled
    await expect.element(page.getByTestId('submit-button')).toBeDisabled();

    // Wait for completion and verify button is enabled again
    await expect.element(page.getByTestId('idle-text')).toBeVisible();
  });

  test('form inputs are disabled during submission', async () => {
    const { getByTestId } = await render(<TestLinkPage />);

    await userEvent.fill(getByTestId('name-input'), 'テスト太郎');
    await userEvent.fill(getByTestId('email-input'), 'test@example.com');
    await userEvent.fill(getByTestId('message-input'), 'テストメッセージ');

    await userEvent.click(getByTestId('submit-button'));

    // Wait for submitting state to be active
    await expect.element(page.getByTestId('submitting-text')).toBeVisible();

    // Inputs should be disabled during submission
    await expect.element(page.getByTestId('name-input')).toBeDisabled();
    await expect.element(page.getByTestId('email-input')).toBeDisabled();
    await expect.element(page.getByTestId('message-input')).toBeDisabled();

    // Wait for completion and verify inputs are enabled again
    await expect.element(page.getByTestId('idle-text')).toBeVisible();
  });

  test('email link is rendered correctly', async () => {
    await render(<TestLinkPage />);
    const emailLink = page.getByRole('link', { name: 'eve@eve0415.net' });
    await expect.element(emailLink).toBeInTheDocument();
    await expect.element(emailLink).toHaveAttribute('href', 'mailto:eve@eve0415.net');
  });
});
