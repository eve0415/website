import type { AISkill, AISkillsState } from '#workflows/-utils/ai-skills-types';
import type { Skill } from './-config/skills-config';
import type { FC } from 'react';

import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import AISkillPanel from './-components/AISkillPanel/ai-skill-panel';
import AnalysisLog from './-components/AnalysisLog/analysis-log';
import SkillCard from './-components/SkillCard/skill-card';
import SkillsVisualization from './-components/SkillsVisualization/skills-visualization';
import { categoryIcons, categoryLabels, levelConfig, skills } from './-config/skills-config';
import { loadAISkillsState } from './-utils/ai-skills-loader';

const SkillsPage: FC = () => {
  const loaderData = Route.useLoaderData();
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(null);

  const aiSkillsState: AISkillsState = loaderData;
  const aiSkills = aiSkillsState.content?.skills || [];
  const workflowState = aiSkillsState.workflow;

  // Find selected AI skill for panel display
  const selectedAISkill = aiSkills.find(s => s.name === selectedSkillName) || null;

  // Show analysis log when workflow is running
  const isWorkflowActive = workflowState.phase !== 'idle' && workflowState.phase !== 'completed' && workflowState.phase !== 'error';

  const groupedSkills = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const category = skill.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  // Group AI-discovered skills by category
  const aiDiscoveredSkills = aiSkills.filter(s => s.is_ai_discovered);
  const groupedAISkills = aiDiscoveredSkills.reduce<Record<string, AISkill[]>>((acc, skill) => {
    const category = skill.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  const handleNodeSelect = (skillName: string | null) => {
    setSelectedSkillName(skillName);
  };

  const handlePanelClose = () => {
    setSelectedSkillName(null);
  };

  return (
    <main className='min-h-dvh px-6 py-24 md:px-12'>
      {/* Header */}
      <header className='mb-16'>
        <Link to='/' className='group text-subtle-foreground hover:text-neon mb-8 inline-flex items-center gap-2 text-sm transition-colors'>
          <span className='transition-transform group-hover:-translate-x-1'>←</span>
          <span>Index</span>
        </Link>
        <h1 className='animate-fade-in-up text-4xl font-bold tracking-tight md:text-5xl'>Skills Matrix</h1>
        <p className='text-muted-foreground mt-4'>技術スタック</p>

        {/* AI Profile Summary */}
        {aiSkillsState.profile && (
          <div className='border-fuchsia/20 bg-surface/50 mt-6 rounded-lg border p-4'>
            <p className='text-foreground text-sm leading-relaxed'>{aiSkillsState.profile.summary_ja}</p>
            {aiSkillsState.profile.activity_narrative_ja && <p className='text-muted-foreground mt-2 text-xs'>{aiSkillsState.profile.activity_narrative_ja}</p>}
          </div>
        )}
      </header>

      {/* Legend */}
      <div className='mb-12 flex flex-wrap gap-6'>
        {Object.entries(levelConfig).map(([level, config]) => {
          const colors: Record<string, string> = {
            neon: 'bg-neon',
            cyan: 'bg-cyan',
            orange: 'bg-orange',
          };
          return (
            <div key={level} className='flex items-center gap-2'>
              <span className={`size-3 rounded-full ${colors[config.color]}`} />
              <span className='text-subtle-foreground text-sm'>{config.label}</span>
              <span className='text-subtle-foreground font-mono text-xs'>({config.progress}%)</span>
            </div>
          );
        })}
        {aiDiscoveredSkills.length > 0 && (
          <div className='flex items-center gap-2'>
            <span className='bg-fuchsia size-3 rounded-full' />
            <span className='text-subtle-foreground text-sm'>AI発見</span>
            <span className='text-fuchsia font-mono text-xs'>({aiDiscoveredSkills.length})</span>
          </div>
        )}
      </div>

      {/* Skills Visualization */}
      <section className='mb-16'>
        <SkillsVisualization aiSkills={aiSkills} selectedSkillId={selectedSkillName} onNodeSelect={handleNodeSelect} />
      </section>

      {/* Skills Grid by Category */}
      <div className='grid gap-12 lg:grid-cols-3'>
        {(Object.keys(groupedSkills) as Array<keyof typeof categoryLabels>).map(category => (
          <section key={category}>
            <h2 className='border-line text-subtle-foreground mb-6 flex items-center gap-2 border-b pb-2 font-mono text-sm tracking-wider uppercase'>
              <span>{categoryIcons[category]}</span>
              <span>{categoryLabels[category]}</span>
            </h2>
            <div className='space-y-3'>
              {groupedSkills[category]?.map((skill, index) => (
                <SkillCard key={skill.name} skill={skill} index={index} />
              ))}

              {/* AI-discovered skills in this category */}
              {groupedAISkills[category]?.map((aiSkill, index) => (
                <button
                  type='button'
                  key={aiSkill.name}
                  onClick={() => setSelectedSkillName(aiSkill.name)}
                  className='group border-fuchsia/20 hover:border-fuchsia/50 hover:bg-fuchsia/5 flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all'
                >
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-fuchsia ai-glow font-medium'>{aiSkill.name}</span>
                      <span className='bg-fuchsia/20 text-fuchsia rounded px-1.5 py-0.5 text-xs'>AI</span>
                    </div>
                    <p className='text-muted-foreground mt-1 line-clamp-1 text-xs'>{aiSkill.description_ja}</p>
                  </div>
                  <span className='text-subtle-foreground group-hover:text-fuchsia text-xs transition-colors'>{index + 1}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Learning Journey */}
      <section className='mt-24'>
        <h2 className='mb-8 text-2xl font-bold'>現在学習中</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='group border-line bg-surface duration-normal hover:border-orange/30 rounded-lg border p-6 transition-all'>
            <h3 className='text-orange text-lg font-bold'>Rust</h3>
            <p className='text-muted-foreground mt-2 text-sm'>
              システムプログラミングとパフォーマンス最適化のため学習中。 メモリ安全性と並行処理の理解を深めている。
            </p>
            <div className='bg-muted mt-4 h-1 w-full rounded-full'>
              <div className='bg-orange duration-slow h-full rounded-full transition-all' style={{ width: '35%' }} />
            </div>
          </div>
          <div className='group border-line bg-surface duration-normal hover:border-orange/30 rounded-lg border p-6 transition-all'>
            <h3 className='text-orange text-lg font-bold'>Go</h3>
            <p className='text-muted-foreground mt-2 text-sm'>
              マイクロサービスとインフラツーリングのため学習中。 シンプルで効率的なバックエンドサービスの構築を目指す。
            </p>
            <div className='bg-muted mt-4 h-1 w-full rounded-full'>
              <div className='bg-orange duration-slow h-full rounded-full transition-all' style={{ width: '25%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Navigation hint */}
      <div className='mt-16 flex justify-center gap-8'>
        <Link to='/projects' className='group text-subtle-foreground hover:text-neon flex items-center gap-2 text-sm transition-colors'>
          <span className='transition-transform group-hover:-translate-x-1'>←</span>
          <span>Projects</span>
        </Link>
        <Link to='/link' className='group text-subtle-foreground hover:text-neon flex items-center gap-2 text-sm transition-colors'>
          <span>Link</span>
          <span className='transition-transform group-hover:translate-x-1'>→</span>
        </Link>
      </div>

      {/* AI Skill Panel (expandable) */}
      {selectedAISkill && <AISkillPanel skill={selectedAISkill} isExpanded={true} onClose={handlePanelClose} />}

      {/* Analysis Log (workflow progress) */}
      {isWorkflowActive && <AnalysisLog state={workflowState} />}
    </main>
  );
};

export const Route = createFileRoute('/skills/')({
  component: SkillsPage,
  loader: () => loadAISkillsState(),
});
