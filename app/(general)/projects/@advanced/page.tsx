import { gridItem } from 'styled-system/patterns';

import Card from './Card';
import { localizedProjects } from './localized';
import { minecraft } from './minecraft';

export default function Page() {
  return (
    <>
      {minecraft.map(data => (
        <Card key={data.name} data={data} />
      ))}

      <div
        className={gridItem({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          alignSelf: 'center',
          justifySelf: 'center',
          textAlign: 'center',
          border: '0.0625rem solid #dee2e6',
          borderRadius: 'lg',
          boxShadow: '0 20px 30px -15px rgba(0,0,0,0.15)',
          backgroundColor: 'white',
          height: '330px',
          width: '350px',
        })}
      >
        翻訳に参加したプロジェクト
      </div>

      {localizedProjects.map(data => (
        <Card key={data.name} data={data} />
      ))}
    </>
  );
}
