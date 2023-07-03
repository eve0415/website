import Card from './Card';
import { bots } from './bot';
import { minecraft } from './minecraft';
import { other } from './other';

export default function Page() {
  return [...bots, ...minecraft, ...other].map(data => <Card key={data.name} data={data} />);
}
