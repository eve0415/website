import { css } from 'styled-system/css';
import { paper } from 'styled-system/recipes';

export const metadata = {
  title: 'プロジェクト一覧',
};

export default function Page() {
  return (
    <div className={paper()}>
      <h2 className={css({ fontSize: '1.8rem', marginBottom: 4 })}>説明</h2>
      <p>個人、チーム問わず、</p>
      <p>プライベート、パブリック問わず、</p>
      <p>様々なものを作っています。</p>
      <p>ここに掲載されているものはほんの一例です。</p>
      <p>また翻訳作業もしています。</p>
    </div>
  );
}
