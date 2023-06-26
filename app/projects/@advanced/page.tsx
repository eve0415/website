import Card from './Card';
import { localizedProjects } from './localized';
import { minecraft } from './minecraft';

export default function Page() {
  return [
    ...minecraft,
    ...localizedProjects.map(l => ({ ...l, description: `【翻訳】 ${l.description}` })),
  ].map(data => <Card key={data.name} data={data} />);
}
