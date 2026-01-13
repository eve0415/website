import type { FC } from 'react';

import { useEffect, useState } from 'react';

export interface Project {
  title: string;
  description: string;
  tags: string[];
  links: { label: string; url: string }[];
  highlight?: string;
  highlightSub?: string;
  featured?: boolean;
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard: FC<ProjectCardProps> = ({ project, index }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const baseClasses =
    'group rounded-lg border border-line bg-surface p-6 transition-all duration-normal hover:border-neon/30 hover:shadow-glow/10 hover:shadow-lg';
  const visibilityClasses = isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0';
  const featuredClasses = project.featured ? 'col-span-full md:p-8' : '';

  return (
    <article className={`${baseClasses} ${visibilityClasses} ${featuredClasses} duration-normal transition-all`}>
      <div className={project.featured ? 'flex flex-col gap-4 md:flex-row md:items-start md:justify-between' : ''}>
        <div>
          <h2 className={`text-foreground group-hover:text-neon font-bold ${project.featured ? 'text-2xl' : 'text-xl'}`}>{project.title}</h2>
          <p className={`text-muted-foreground mt-2 ${project.featured ? '' : 'text-sm'}`}>{project.description}</p>
        </div>
        {project.highlight && (
          <div className='flex flex-col items-end gap-1'>
            <span className='bg-neon/10 text-neon rounded-full px-3 py-1 font-mono text-sm'>{project.highlight}</span>
            {project.highlightSub && <span className='text-subtle-foreground text-xs'>{project.highlightSub}</span>}
          </div>
        )}
      </div>
      <div className='mt-4 flex flex-wrap gap-2'>
        {project.tags.map(tag => (
          <span key={tag} className='border-line text-subtle-foreground group-hover:border-input rounded-md border px-2 py-1 text-xs transition-colors'>
            {tag}
          </span>
        ))}
      </div>
      <div className={`flex gap-4 ${project.featured ? 'mt-6' : 'mt-4'}`}>
        {project.links.map(link => (
          <a
            key={link.label}
            href={link.url}
            target='_blank'
            rel='noopener noreferrer'
            className='group/link text-muted-foreground hover:text-neon relative text-sm transition-colors'
          >
            {link.label}
            <span className='ml-1 inline-block transition-transform group-hover/link:translate-x-0.5'>→</span>
          </a>
        ))}
      </div>
    </article>
  );
};

export default ProjectCard;
