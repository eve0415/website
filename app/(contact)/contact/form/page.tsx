import { css } from 'styled-system/css';
import { flex } from 'styled-system/patterns';
import { paper } from 'styled-system/recipes';

import FormParent from './Parent';
import TextInput from './TextInput';
import { inputStyle } from './style';

export default function Page() {
  const formStyle = `${paper()} ${flex({
    direction: 'column',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
  })}`;

  return (
    <FormParent>
      <div className={paper()}>
        <h1 className={css({ fontSize: '2.2rem', marginBottom: 2 })}>お問い合わせ</h1>
        <p>
          Discord など、他のソーシャルアカウントをご利用いただけない場合、
          <br />
          以下のフォームよりお願いいたします。
        </p>
        <p>
          なお、内容によってはお答えできない場合がございますこと、
          <br />
          予めご了承ください。
        </p>
      </div>

      <label className={formStyle}>
        お名前（ニックネーム）
        <input
          name='name'
          type='text'
          inputMode='text'
          color='#E5FCFB'
          className={inputStyle}
          autoComplete='off'
          autoFocus
          required
        />
      </label>

      <label className={formStyle}>
        ご返信先
        <p className={css({ fontSize: '0.8em', marginTop: 1 })}>
          返信をご希望の場合は、
          <br />
          メールアドレス又はソーシャルアカウントをご記入ください
        </p>
        <input
          name='reply'
          type='text'
          inputMode='text'
          color='#E5FCFB'
          className={inputStyle}
          autoComplete='off'
          autoCapitalize='off'
        />
      </label>

      <label className={formStyle}>
        件名
        <input
          name='title'
          type='text'
          inputMode='text'
          color='#E5FCFB'
          className={inputStyle}
          autoComplete='off'
          required
        />
      </label>

      <label className={formStyle}>
        お問い合わせ内容
        <TextInput />
      </label>

      <div
        className={`cf-turnstile ${flex({ justifyContent: 'center' })}`}
        data-sitekey={process.env.CF_SITE_KEY}
        data-theme='light'
      />

      <button
        type='submit'
        className={`${paper()} ${css({
          width: '50%',
          alignSelf: 'center',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease-in-out',
          _hover: { backgroundColor: 'blue.100' },
        })}`}
        data-ripplet
      >
        送信
      </button>
    </FormParent>
  );
}
