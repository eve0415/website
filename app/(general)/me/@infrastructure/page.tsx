import { paper } from 'styled-system/recipes';

import Card from '../Card';
import { gridClass, title } from '../styles';
import { infrastructure } from './infrastructure';

export default function Page() {
  return (
    <div className={paper()}>
      <h2 className={title}>インフラストラクチャー</h2>

      <div className={gridClass}>
        {infrastructure.map(i => (
          <Card key={i.name} data={i} />
        ))}
      </div>
    </div>
  );
}
