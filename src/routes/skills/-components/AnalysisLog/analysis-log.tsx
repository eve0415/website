// AnalysisLog - Terminal-style progress widget for workflow status

import type { WorkflowPhase, WorkflowState } from '#workflows/-utils/ai-skills-types';
import type { FC } from 'react';

import { useEffect, useState } from 'react';

interface Props {
  state: WorkflowState;
}

const phaseMessages: Record<WorkflowPhase, string> = {
  idle: '次回の実行を待機しています',
  'listing-repos': 'リポジトリを取得中...',
  'fetching-commits': 'コミット履歴を取得中...',
  'fetching-prs': 'プルリクエストを取得中...',
  'fetching-reviews': 'レビューを取得中...',
  'squashing-history': '履歴を要約中...',
  'ai-extracting-skills': 'AIがスキルを分析中...',
  'ai-generating-japanese': 'AI説明文を生成中...',
  'storing-results': '結果を保存中...',
  completed: '完了',
  error: 'エラーが発生しました',
};

const AnalysisLog: FC<Props> = ({ state }) => {
  const [blinkVisible, setBlinkVisible] = useState(true);

  const isActive = state.phase !== 'idle' && state.phase !== 'completed' && state.phase !== 'error';

  // Heartbeat blink effect
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setBlinkVisible(prev => !prev);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isActive]);

  return (
    <div className='border-line bg-surface/80 fixed right-4 bottom-4 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-lg border backdrop-blur-sm'>
      {/* Header */}
      <div className='border-line flex items-center justify-between border-b px-3 py-2'>
        <div className='flex items-center gap-2'>
          <span className={`size-2 rounded-full ${isActive ? 'bg-fuchsia animate-heartbeat' : state.phase === 'completed' ? 'bg-neon' : 'bg-muted'}`} />
          <span className='text-subtle-foreground font-mono text-xs uppercase'>
            {isActive ? '分析中' : state.phase === 'completed' ? '完了' : state.phase === 'error' ? 'エラー' : '待機中'}
          </span>
        </div>
        {isActive && <span className='text-fuchsia font-mono text-xs'>{state.progress_pct}%</span>}
      </div>

      {/* Current status */}
      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- live region, not form output */}
      <div className='h-16 overflow-hidden p-3' role='status'>
        <div className='flex flex-col gap-1'>
          {state.current_repo && isActive && (
            <p className='text-muted-foreground font-mono text-xs'>
              <span className='text-subtle-foreground mr-2' aria-hidden='true'>
                {'>'}
              </span>
              スキャン中: {state.current_repo}
            </p>
          )}
          {isActive && (
            <p className='text-fuchsia font-mono text-xs'>
              <span className='mr-2' aria-hidden='true'>
                {'>'}
              </span>
              {phaseMessages[state.phase]}
              <span aria-hidden='true' className={`ml-1 ${blinkVisible ? 'opacity-100' : 'opacity-0'}`}>
                _
              </span>
            </p>
          )}
          {!isActive && (
            <p className='text-muted-foreground font-mono text-xs'>
              <span className='text-subtle-foreground mr-2' aria-hidden='true'>
                {'>'}
              </span>
              {getIdleMessage(state)}
            </p>
          )}
        </div>
      </div>

      {/* Footer with stats */}
      {state.repos_total > 0 && (
        <div className='border-line border-t px-3 py-2'>
          <span className='text-subtle-foreground font-mono text-xs'>
            {state.repos_processed}/{state.repos_total} repos
          </span>
        </div>
      )}
    </div>
  );
};

const getIdleMessage = (state: WorkflowState): string => {
  if (state.phase === 'completed') return `分析完了（${state.repos_processed} リポジトリ）`;
  if (state.phase === 'error') return state.error_message ?? 'エラーが発生しました';
  return phaseMessages.idle;
};

export default AnalysisLog;
