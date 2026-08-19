import { tw } from '#lib/tw';

/**
 * The class contract for the two elements `SiteHeader` does not render itself.
 * Their own module so the header stays a component-only file and Fast Refresh
 * can keep its state across edits.
 */
export const BRAND_CLASS = tw('flex min-h-(--hit-target) items-center gap-2.5 text-[1rem] font-bold text-(--ink-nav) no-underline');

export const NAV_LINK_CLASS = tw(
  'inline-flex min-h-(--hit-target) cursor-pointer items-center border-b-2 border-b-transparent font-[inherit] text-(length:--text-nav) text-(--ink-nav) no-underline hover:text-(--accent) aria-[current=page]:border-b-(--accent) aria-[current=page]:text-(--accent)',
);
