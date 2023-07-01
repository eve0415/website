import { paper } from 'styled-system/recipes';

import Card from '../Card';
import { gridClass, title } from '../styles';
import { monitoring } from './monitor';

export default function Page() {
  return (
    <div className={paper()}>
      <h2 className={title}>モニタリング</h2>

      <div className={gridClass}>
        {monitoring.map(monitor => (
          <Card key={monitor.name} data={monitor} />
        ))}
      </div>
    </div>
  );
}
