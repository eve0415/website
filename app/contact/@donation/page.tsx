import Link from 'next/link';
import { SiGithubsponsors } from 'react-icons/si';
import { css } from 'styled-system/css';
import { grid } from 'styled-system/patterns';
import { paper } from 'styled-system/recipes';

import { buttonStyle, title } from '../style';

export default function Page() {
  const iconStyle = css({
    backgroundColor: 'white',
    borderRadius: '40%',
    fontSize: '2.5rem',
    padding: 2,
    marginRight: 4,
  });

  return (
    <div className={paper()}>
      <h2 className={title}>サポート・寄付・支援</h2>
      <p>GitHub Sponsors に登録しています。</p>
      <p>ご支援いただけると嬉しいです。</p>

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
            backgroundColor: '#181616',
            _hover: { backgroundColor: 'rgba(77, 77, 77, 1)' },
          })}`}
          target='_blank'
          rel='noopener noreferrer'
          data-ripplet
        >
          <SiGithubsponsors color='#C96198' className={iconStyle} />
          一度限り
        </Link>

        <Link
          href='https://github.com/sponsors/eve0415?o=esb&'
          className={`${buttonStyle} ${css({
            backgroundColor: '#181616',
            _hover: { backgroundColor: 'rgba(77, 77, 77, 1)' },
          })}`}
          target='_blank'
          rel='noopener noreferrer'
          data-ripplet
        >
          <SiGithubsponsors color='#C96198' className={iconStyle} />
          毎月
        </Link>
      </div>
    </div>
  );
}
