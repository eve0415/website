import { css } from 'styled-system/css';
import { grid, stack } from 'styled-system/patterns';
import { box } from 'styled-system/recipes';

import Card from './Card';
import { frameworks } from './framework';
import { infrastructure } from './infrastructure';
import { languages } from './language';
import { monitoring } from './monitor';
import { services } from './service';
import { tools } from './tools';

export default function Page() {
  const title = css({ fontSize: '1.8rem', marginBottom: 4 });
  const gridClass = grid({ columns: { smDown: 2, lg: 4, xl: 8 }, gap: { smDown: 2, lg: 6 } });

  return (
    <div
      className={stack({
        direction: 'column',
        alignItems: 'center',
        marginTop: 70,
        marginBottom: 30,
      })}
    >
      <h1 className={css({ fontSize: '2.2rem' })}>プロフィール</h1>

      <div className={box()}>
        <h2 className={title}>自己紹介</h2>
        <p>猫と寝るの大好き</p>
        <p>毎日プログラム書いてます</p>
        <p>日本人ですが、どちらかといえば英語の方が得意です</p>
      </div>

      <div className={box()}>
        <h2 className={title}>プログラミング言語</h2>

        <div className={gridClass}>
          {languages.map(language => (
            <Card key={language.name} data={language} />
          ))}
        </div>
      </div>

      <div className={box()}>
        <h2 className={title}>ツール</h2>

        <div className={gridClass}>
          {tools.map(tool => (
            <Card key={tool.name} data={tool} />
          ))}
        </div>
      </div>

      <div className={box()}>
        <h2 className={title}>フレームワーク</h2>

        <div className={gridClass}>
          {frameworks.map(framework => (
            <Card key={framework.name} data={framework} />
          ))}
        </div>
      </div>

      <div className={box()}>
        <h2 className={title}>サービス</h2>

        <div className={gridClass}>
          {services.map(service => (
            <Card key={service.name} data={service} />
          ))}
        </div>
      </div>

      <div className={box()}>
        <h2 className={title}>インフラストラクチャー</h2>

        <div className={gridClass}>
          {infrastructure.map(service => (
            <Card key={service.name} data={service} />
          ))}
        </div>
      </div>

      <div className={box()}>
        <h2 className={title}>モニタリング</h2>

        <div className={gridClass}>
          {monitoring.map(service => (
            <Card key={service.name} data={service} />
          ))}
        </div>
      </div>
    </div>
  );
}
