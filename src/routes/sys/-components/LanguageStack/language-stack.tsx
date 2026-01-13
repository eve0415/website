import type { LanguageStat } from '../../-utils/github-stats-utils';
import type { FC } from 'react';

import LanguageBar from './LanguageBar/language-bar';

interface LanguageStackProps {
  languages: LanguageStat[];
  animate: boolean;
}

const LanguageStack: FC<LanguageStackProps> = ({ languages, animate }) => {
  if (languages.length === 0) {
    return (
      <div className='text-subtle-foreground font-mono text-sm'>
        <span className='text-orange'>[NO_DATA]</span> 言語データが見つかりません
      </div>
    );
  }

  return (
    <div className='w-full max-w-2xl'>
      <div className='text-subtle-foreground mb-3 font-mono text-xs'>
        <span className='text-neon'>[</span>
        <span>STACK_ANALYSIS</span>
        <span className='text-neon'>]</span>
        <span className='ml-2'>// リポジトリ言語分布</span>
      </div>

      <div className='border-line bg-surface/50 space-y-1 rounded border p-4'>
        {languages.map((lang, index) => (
          <LanguageBar key={lang.name} language={lang} index={index} animate={animate} isLast={index === languages.length - 1} />
        ))}

        {/* Footer tree end */}
        <div className='text-subtle-foreground font-mono text-sm'>
          <span>└── </span>
          <span>EOF</span>
        </div>
      </div>
    </div>
  );
};

export default LanguageStack;
