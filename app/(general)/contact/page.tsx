import Link from 'next/link';
import { BsDiscord } from 'react-icons/bs';
import { GrGithub, GrTwitter } from 'react-icons/gr';
import { SiCrowdin } from 'react-icons/si';
import { css } from 'styled-system/css';
import { grid, gridItem } from 'styled-system/patterns';
import { paper } from 'styled-system/recipes';

import { buttonStyle, title } from './style';

export const metadata = {
  title: 'コンタクト',
};

export default function Page() {
  const iconStyle = css({
    backgroundColor: 'white',
    borderRadius: '50%',
    height: '38px',
    width: '38px',
    padding: 2,
    marginRight: 4,
  });

  return (
    <div className={paper()}>
      <h2 className={title}>アカウント・連絡先</h2>
      <p>お仕事などの依頼は Discord の DM にお願いします。</p>
      <p>または、下記のコンタクトフォームからお願いします。</p>

      <div
        className={grid({
          columns: { mdDown: 1, md: 2 },
          gap: { xlDown: 2, xl: 4 },
          margin: 2,
          marginTop: 6,
        })}
      >
        <Link
          href='https://discord.com/users/456937186856665098'
          className={`${buttonStyle} ${css({
            backgroundColor: '#2532F2',
          })}`}
          target='_blank'
          rel='noopener noreferrer'
          data-ripplet
        >
          <BsDiscord color='#5865F2' className={iconStyle} />
          eve0415
        </Link>

        <Link
          href='https://twitter.com/eveevekun'
          className={`${buttonStyle} ${css({
            backgroundColor: '#1D9BF0',
          })}`}
          target='_blank'
          rel='noopener noreferrer'
          data-ripplet
        >
          <GrTwitter color='#1D9BF0' className={iconStyle} />
          eveevekun
        </Link>

        <Link
          href='https://github.com/eve0415'
          className={`${buttonStyle} ${css({
            backgroundColor: '#181616',
          })}`}
          target='_blank'
          rel='noopener noreferrer'
          data-ripplet
        >
          <GrGithub color='#181616' className={iconStyle} />
          eve0415
        </Link>

        <Link
          href='https://crowdin.com/profile/eve0415'
          className={`${buttonStyle} ${css({
            backgroundColor: '#2E3340',
          })}`}
          target='_blank'
          rel='noopener noreferrer'
          data-ripplet
        >
          <SiCrowdin color='#2E3340' className={iconStyle} />
          eve0415
        </Link>

        <Link
          href='/contact/form'
          className={`${buttonStyle} ${gridItem({
            colSpan: 2,
            width: { xlDown: '100%' },
            justifyContent: 'center',
            backgroundColor: 'sky.600',
            cursor: 'pointer',
          })}`}
          data-ripplet
        >
          コンタクトフォーム
        </Link>
      </div>
    </div>
  );
}
