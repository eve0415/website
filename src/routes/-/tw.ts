/**
 * Marks a string as a Tailwind class list, unchanged at runtime.
 *
 * oxlint's tailwindcss plugin and oxfmt's class sorter only look inside
 * `className`, a handful of variable names, and calls they are told about —
 * a class list hoisted into a constant is invisible to both. `tw` is the call
 * they are told about, so a hoisted list gets linted and sorted like the JSX.
 *
 * Use `cn` instead when classes are actually being combined or overridden.
 */
export const tw = <T extends string>(classes: T): T => classes;
