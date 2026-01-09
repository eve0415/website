export interface NotFoundMessage {
  main: string;
  sub: string;
}

export const NOT_FOUND_MESSAGES: NotFoundMessage[] = [
  {
    main: '探しているものは、虚無に飲み込まれました',
    sub: 'The void has claimed what you sought',
  },
  {
    main: 'ここには何もない...でも、それも一つの答えかも',
    sub: 'Nothing here... but perhaps that is an answer',
  },
  {
    main: 'このページは存在しないことを選びました',
    sub: 'This page chose not to exist',
  },
  {
    main: '404: 存在の証明に失敗',
    sub: 'Proof of existence failed',
  },
  {
    main: '虚空からの応答: null',
    sub: 'Response from the void: null',
  },
  {
    main: 'あなたの探し物、宇宙のどこかで迷子です',
    sub: 'What you seek is lost in the cosmos',
  },
  {
    main: 'リクエストはイベントホライズンの向こう側へ',
    sub: 'Request crossed the event horizon',
  },
  {
    main: 'ページが見つかりません。最初から無かったのかも',
    sub: 'Page not found. Maybe it never existed',
  },
  {
    main: '迷子になったようですね。でも、ここも悪くない',
    sub: "Looks like you're lost. But this place isn't so bad",
  },
  {
    main: 'このURLは夢の中にしか存在しません',
    sub: 'This URL exists only in dreams',
  },
];

export const getRandomMessage = (): NotFoundMessage => {
  const index = Math.floor(Math.random() * NOT_FOUND_MESSAGES.length);
  return NOT_FOUND_MESSAGES[index]!;
};
