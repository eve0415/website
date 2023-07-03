'use client';

import type { FC, FormEvent, ReactNode } from 'react';

import { useRouter } from 'next/navigation';
import { flex } from 'styled-system/patterns';

interface ContactFormControlElement extends HTMLFormControlsCollection {
  name: HTMLInputElement;
  reply: HTMLInputElement;
  title: HTMLInputElement;
  message: HTMLInputElement;
  'cf-turnstile-response': HTMLInputElement;
}

interface ContactFormElement extends HTMLFormElement {
  readonly elements: ContactFormControlElement;
}

const FormParent: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();

  return (
    <form
      className={flex({ direction: 'column', width: { mdDown: '90%', md: '1/2' } })}
      action=''
      method='POST'
      onSubmit={(e: FormEvent<ContactFormElement>) => {
        fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: e.currentTarget.elements.name.value,
            reply: e.currentTarget.elements.reply.value || undefined,
            title: e.currentTarget.elements.title.value,
            message: e.currentTarget.elements.message.value,
            turnstile: e.currentTarget.elements['cf-turnstile-response'].value,
          }),
        })
          // @ts-expect-error 2345
          .then(() => router.push('/contact'))
          .catch(null);
      }}
    >
      {children}
    </form>
  );
};

export default FormParent;
