import { tw } from '#lib/tw';

/**
 * The class contract for the three elements `SiteHeader` does not render
 * itself. Their own module so the header stays a component-only file and Fast
 * Refresh can keep its state across edits.
 */
export const BRAND_CLASS = tw(
  'flex min-h-(--hit-target) flex-none items-center gap-2.5 text-[1rem] font-bold whitespace-nowrap text-(--ink-nav) no-underline hover:text-(--accent)',
);

/**
 * The header row's trailing slot. `flex-none` because it is a fixed pill group,
 * and the margin is the *nav's* own gap minus the row's — the design sets the
 * switch off from the last nav link by the same distance the links keep from
 * each other, not by the wider gap the row uses for brand-to-nav.
 */
export const TRAILING_CLASS = tw('ml-[calc(clamp(10px,2vw,22px)-12px)] flex-none [@media(width<720px)]:order-2 [@media(width<720px)]:ml-auto');

export const NAV_LINK_CLASS = tw(
  'inline-flex min-h-(--hit-target) flex-none cursor-pointer items-center border-b-2 border-b-transparent font-[inherit] text-(length:--text-nav-link) text-(--ink-nav) no-underline hover:text-(--accent) aria-[current=page]:border-b-(--accent) aria-[current=page]:text-(--accent)',
);
