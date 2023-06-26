import Card from './Card';
import { bots } from './bot';
import { minecraft } from './minecraft';

export default function Page() {
  return [...bots, ...minecraft].map(data => <Card key={data.name} data={data} />);
}
