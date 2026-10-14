import { build } from 'cn/build';

export const cnOptions = {
  content: ['src/**/*.{ts,tsx}'],
  out: 'src/lib/cn-tables.gen.ts',
} as const satisfies NonNullable<Parameters<typeof build>[0]>;

if (import.meta.main) {
  try {
    const { warnings } = await build(cnOptions);
    for (const warning of warnings) console.warn(warning);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
