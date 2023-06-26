import { paper } from 'styled-system/recipes';

import Card from '../Card';
import { gridClass, title } from '../styles';
import { frameworks } from './framework';

export default function Page() {
  return (
    <div className={paper()}>
      <h2 className={title}>フレームワーク</h2>

      <div className={gridClass}>
        {frameworks.map(framework => (
          <Card key={framework.name} data={framework} />
        ))}
      </div>
    </div>
  );
}
