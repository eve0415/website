/**
 * Marks a string as a Tailwind class list, unchanged at runtime.
 *
 * oxlint's tailwindcss plugin and oxfmt's class sorter only look inside
 * `className`, a handful of variable names, and calls they are told about —
 * a class list hoisted into a constant is invisible to both. `tw` is the call
 * they are told about, so a hoisted list gets linted and sorted like the JSX.
 *
 * The `stripTw` plugin in `vite.config.ts` removes the call, leaving the bare
 * string. Being an identity function is not enough on its own: oxc's minifier
 * does not inline across chunk boundaries, so without that plugin this function
 * ships in the shared chunk and every marked list becomes a call to it — 0.47 KiB
 * raw and 0.09 KiB gzip of client JS, measured.
 *
 * Use `cn` instead when classes are actually being combined or overridden.
 */
export const tw = <T extends string>(classes: T): T => classes;
