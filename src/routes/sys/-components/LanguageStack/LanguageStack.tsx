import type { LanguageStat } from '../../-utils/github-stats';
import type { FC } from 'react';

import LanguageBar from './LanguageBar/LanguageBar';

interface LanguageStackProps {
  languages: LanguageStat[];
  animate: boolean;
}

const LanguageStack: FC<LanguageStackProps> = ({ languages, animate }) => {
  if (languages.length === 0) {
    return (
      <div className='font-mono text-sm text-text-muted'>
        <span className='text-accent-tertiary'>[NO_DATA]</span> 言語データが見つかりません
      </div>
    );
  }

  return (
    <div className='w-full max-w-2xl'>
      <div className='mb-3 font-mono text-text-muted text-xs'>
        <span className='text-accent-primary'>[</span>
        <span>STACK_ANALYSIS</span>
        <span className='text-accent-primary'>]</span>
        <span className='ml-2 opacity-50'>// リポジトリ言語分布</span>
      </div>

      <div className='space-y-1 rounded border border-border-subtle bg-bg-secondary/50 p-4'>
        {languages.map((lang, index) => (
          <LanguageBar key={lang.name} language={lang} index={index} animate={animate} />
        ))}

        {/* Footer tree end */}
        <div className='font-mono text-sm text-text-muted'>
          <span>└── </span>
          <span className='opacity-50'>EOF</span>
        </div>
      </div>
    </div>
  );
};

export default LanguageStack;
