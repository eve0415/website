import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import { tw } from '#routes/-/tw';

import './comet-link.css';
import { cn } from '../../cn';

const ROOT = tw(
  'group relative inline-flex min-h-[44px] cursor-pointer items-center gap-[10px] font-sans text-(length:--text-ui) font-bold tracking-[0.06em] text-(--link) no-underline hover:text-(--link-hover)',
);

interface CometLinkBaseProps {
  children?: ReactNode;
}

interface CometLinkAnchorProps extends CometLinkBaseProps, Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'children'> {
  href: string;
}

interface CometLinkButtonProps extends CometLinkBaseProps, Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  href?: undefined;
}

type CometLinkProps = CometLinkAnchorProps | CometLinkButtonProps;

export const CometLink: FC<CometLinkProps> = props => {
  const { className, children, ...rest } = props;
  const cls = cn(ROOT, className);
  const inner = (
    <>
      <span className='relative inline-block pb-[5px]'>
        {children}
        <span
          className='absolute inset-x-0 bottom-0 h-[2px] origin-right transform-[scaleX(0)] rounded-[1px] bg-(image:--grad-comet) transition-[transform] duration-500 ease-(--ease-comet) group-hover:origin-left group-hover:transform-[scaleX(1)]'
          aria-hidden='true'
        />
        <span
          className='absolute bottom-[-1.5px] left-0 h-[5px] w-full transform-[translateX(calc(-100%+10px))] opacity-0 group-hover:[animation:evCometRun_0.6s_var(--ease-comet)_0.08s_both]'
          aria-hidden='true'
        >
          <span className='absolute top-px right-0 h-[3px] w-[26px] rounded-[3px] bg-[linear-gradient(90deg,transparent,rgba(252,247,253,.95))] shadow-[0_0_8px_1px_rgba(4,254,255,.8)]' />
          <span className='absolute top-0 right-[-2px] size-[5px] rounded-[50%] bg-(--star-white) shadow-[0_0_10px_3px_rgba(4,254,255,.9)]' />
        </span>
        <span
          className='absolute right-[-7px] -bottom-px size-[13px] transform-[scale(0)] bg-(--star-white) drop-shadow-[0_0_5px_rgba(4,254,255,.9)] [clip-path:polygon(50%_0%,61%_39%,100%_50%,61%_61%,50%_100%,39%_61%,0%_50%,39%_39%)] group-hover:[animation:evKiraPop_0.5s_ease-in-out_0.45s_both]'
          aria-hidden='true'
        />
      </span>
      <span
        className='inline-block transition-[transform] delay-[0.05s] duration-[0.4s] ease-(--ease-comet) group-hover:transform-[translateX(5px)]'
        aria-hidden='true'
      >
        →
      </span>
    </>
  );

  if (rest.href === undefined) {
    return (
      <button type='button' className={cls} {...rest}>
        {inner}
      </button>
    );
  }

  return (
    <a className={cls} {...rest}>
      {inner}
    </a>
  );
};
