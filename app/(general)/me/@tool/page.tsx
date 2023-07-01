import { paper } from 'styled-system/recipes';

import Card from '../Card';
import { gridClass, title } from '../styles';
import { tools } from './tools';

export default function Page() {
  return (
    <div className={paper()}>
      <h2 className={title}>プログラミング言語</h2>

      <div className={gridClass}>
        {tools.map(tool => (
          <Card key={tool.name} data={tool} />
        ))}
      </div>
    </div>
  );
}
