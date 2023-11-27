import localFont from 'next/font/local';

import { paper } from 'styled-system/recipes';

import Card from '../Card';
import { gridClass, title } from '../styles';

import { languages } from './language';

const neon = localFont({
  src: '../../../../assets/MonaspaceNeon-Regular.woff',
  display: 'swap',
  variable: '--font-neon',
});

export default function Page() {
  return (
    <div className={paper()}>
      <h2 className={title}>プログラミング言語</h2>

      <div className={`${neon.className} ${gridClass}`}>
        {languages.map(language => (
          <Card key={language.name} data={language} />
        ))}
      </div>
    </div>
  );
}
