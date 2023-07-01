import { paper } from 'styled-system/recipes';

import Card from '../Card';
import { gridClass, title } from '../styles';
import { languages } from './language';

export default function Page() {
  return (
    <div className={paper()}>
      <h2 className={title}>プログラミング言語</h2>

      <div className={gridClass}>
        {languages.map(language => (
          <Card key={language.name} data={language} />
        ))}
      </div>
    </div>
  );
}
