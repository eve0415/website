/**
 * Console Easter Eggs
 * These appear when developers open DevTools
 */

const ASCII_LOGO = `
███████╗██╗   ██╗███████╗ ██████╗ ██╗  ██╗ ██╗███████╗
██╔════╝██║   ██║██╔════╝██╔═████╗██║  ██║███║██╔════╝
█████╗  ██║   ██║█████╗  ██║██╔██║███████║╚██║███████╗
██╔══╝  ╚██╗ ██╔╝██╔══╝  ████╔╝██║╚════██║ ██║╚════██║
███████╗ ╚████╔╝ ███████╗╚██████╔╝     ██║ ██║███████║
╚══════╝  ╚═══╝  ╚══════╝ ╚═════╝      ╚═╝ ╚═╝╚══════╝
`;

const MESSAGES = [
  'ようこそ、開発者さん。',
  'ソースコードを覗いてる？いいね。',
  'このサイト自体がポートフォリオです。',
  '',
  'GitHub: github.com/eve0415',
  'Twitter: @eveevekun',
  '',
  '何か面白いもの見つけた？',
];

const STYLES = {
  logo: 'color: #00ff88; font-weight: bold;',
  message: 'color: #a3a3a3; font-size: 12px;',
  highlight: 'color: #00d4ff; font-weight: bold;',
  secret: 'color: #ff6b35; font-style: italic;',
};

export const printConsoleArt = (): void => {
  if (globalThis.window === undefined) return;

  console.clear();
  console.log(`%c${ASCII_LOGO}`, STYLES.logo);
  console.log('');

  for (const msg of MESSAGES) {
    if (msg.startsWith('GitHub:') || msg.startsWith('Twitter:')) console.log(`%c${msg}`, STYLES.highlight);
    else console.log(`%c${msg}`, STYLES.message);
  }

  console.log('');
  console.log('%c💡 Hint: Konami Code を知ってる？', STYLES.secret);
  console.log('');
};
