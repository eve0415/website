import { paper } from 'styled-system/recipes';

import Card from '../Card';
import { gridClass, title } from '../styles';

import { services } from './service';

export default function Page() {
  return (
    <div className={paper()}>
      <h2 className={title}>サービス</h2>

      <div className={gridClass}>
        {services.map(service => (
          <Card key={service.name} data={service} />
        ))}
      </div>
    </div>
  );
}
