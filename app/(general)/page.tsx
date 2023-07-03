import Image from 'next/image';
import { css } from 'styled-system/css';
import { circle, flex } from 'styled-system/patterns';

export default function Page() {
  return (
    <>
      <div className={css({ position: 'static' })}>
        <Image
          src='https://eve0415.net/cdn-cgi/imagedelivery/e1FmkEoJCgY0rL0NK8GfGA/1eec637e-fed1-46b7-6c35-bcf496fe2c01/background'
          alt='background'
          style={{ objectFit: 'cover' }}
          className={css({ zIndex: -100 })}
          fill
        />
      </div>

      <div
        className={flex({
          direction: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100dvh',
          width: '100dvw',
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.4)',
        })}
      >
        <div
          className={circle({
            size: { mdDown: 200, md: 300 },
            position: 'relative',
          })}
        >
          <Image
            src='https://eve0415.net/cdn-cgi/imagedelivery/e1FmkEoJCgY0rL0NK8GfGA/648ac891-edcf-4ae6-2c20-9cc7adae0401/avatar'
            alt='me'
            className={css({ borderRadius: '50%' })}
            fill
            priority
          />
        </div>

        <h1 className={css({ fontSize: '5xl' })}>eve0415</h1>
        <p className={css({ fontSize: 'lg' })}>学生というステータスを失った人</p>
      </div>
    </>
  );
}
