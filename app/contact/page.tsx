import Link from 'next/link';
import { BsDiscord } from 'react-icons/bs';
import { GrGithub, GrTwitter } from 'react-icons/gr';
import { SiCrowdin } from 'react-icons/si';
import { css } from 'styled-system/css';
import { flex, grid } from 'styled-system/patterns';
import { paper } from 'styled-system/recipes';

export const metadata = {
  title: 'コンタクト',
};

export default function Page() {
  const buttonStyle = flex({
    alignItems: 'center',
    height: 90,
    width: { mdDown: '100%', md: 350 },
    padding: 4,
    fontSize: '1.5rem',
    color: 'white',
    borderRadius: 'xl',
    transition: 'background-color 0.2s ease-in-out',
  });
  const iconStyle = css({
    backgroundColor: 'white',
    borderRadius: '50%',
    height: 38,
    width: 38,
    padding: 2,
    marginRight: 4,
  });

  return (
    <div className={paper()}>
      <h2>連絡先</h2>
      <p>お仕事などの依頼は Discord の DM にお願いします。</p>

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
            _hover: { backgroundColor: 'rgba(30, 40, 194, 1)' },
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
            _hover: { backgroundColor: 'rgba(23, 124, 192, 1)' },
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
            _hover: { backgroundColor: 'rgba(77, 77, 77, 1)' },
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
            _hover: { backgroundColor: 'rgba(23, 26, 32, 1)' },
          })}`}
          target='_blank'
          rel='noopener noreferrer'
          data-ripplet
        >
          <SiCrowdin color='#2E3340' className={iconStyle} />
          eve0415
        </Link>
      </div>
    </div>
  );
}
