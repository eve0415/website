import { paper } from 'styled-system/recipes';

import { title } from './styles';

export default function Page() {
  return (
    <div className={paper()}>
      <h2 className={title}>自己紹介</h2>
      <p>猫と寝るの大好き</p>
      <p>毎日プログラム書いてます</p>
      <p>日本人ですが、どちらかといえば英語の方が得意です</p>
    </div>
  );
}
