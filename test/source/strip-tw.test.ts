import { describe, expect, it } from 'vitest';

import { stripped } from './plugin-harness';

/**
 * `vite.config.ts`'s `stripTw()` plugin, over source it is handed directly.
 *
 * Sixty lines of offset arithmetic that the built output cannot show. The call is
 * overwritten with spaces rather than cut out so the plugin can return no source
 * map and leave the next plugin's map correct, which holds only while every byte
 * keeps its offset and every line its number — and the client bundle is minified,
 * so both are gone before a test could read them.
 *
 * Measured, not assumed: rewrite the loop to cut the call out instead, in reverse
 * order so the remaining offsets stay valid, and `vite build` is green, all 90
 * `dist` tests pass, and four of the six below go red. (A one-byte error in the
 * blanking is caught harder still — it eats a quote and the build fails to parse —
 * so it is the *correct-looking* rewrite that only this file sees.)
 */
const IMPORT = "import { tw } from '#lib/tw';";

describe('a module that imports tw from #lib/tw', () => {
  it('blanks the call and keeps the class list', async () => {
    expect(await stripped(`${IMPORT}\nexport const A = tw('flex items-center');\n`)).toBe(`${IMPORT}\nexport const A =    'flex items-center' ;\n`);
  });

  it('leaves every byte at the offset it had', async () => {
    const code = `${IMPORT}\nexport const A = tw('flex items-center');\nexport const B = 'after';\n`;
    const output = await stripped(code);

    expect(output).toHaveLength(code.length);
    expect(output.indexOf("'after'")).toBe(code.indexOf("'after'"));
  });

  it('leaves every line at the number it had', async () => {
    const code = `${IMPORT}\nexport const A = tw(\n  'flex items-center',\n);\nexport const B = 2;\n`;
    const output = await stripped(code);

    expect(output.split('\n')).toHaveLength(code.split('\n').length);
    expect(output.split('\n').at(-2)).toBe('export const B = 2;');
  });

  // Two calls, because the loop rewrites `stripped` in place while reading
  // offsets taken from the original text: correct only while the lengths match.
  // One byte lost on the first call and the second one blanks the wrong span.
  it('blanks every call in the module, not just the first', async () => {
    const code = `${IMPORT}\nexport const A = tw('one two');\nexport const B = tw('three four');\n`;
    const output = await stripped(code);

    expect(output).toBe(`${IMPORT}\nexport const A =    'one two' ;\nexport const B =    'three four' ;\n`);
    expect(output).toHaveLength(code.length);
  });
});

describe('a module that does not', () => {
  // The marker is matched by name, without scope analysis — so what keeps a
  // same-named local out of it is the import check, and nothing else.
  it('leaves a tw imported from somewhere else alone', async () => {
    const code = "import { tw } from './tw';\nexport const A = tw('flex');\n";

    expect(await stripped(code)).toBe(code);
  });

  it('leaves a locally declared tw alone', async () => {
    const code = "const tw = list => list;\nexport const A = tw('flex');\n";

    expect(await stripped(code)).toBe(code);
  });
});
