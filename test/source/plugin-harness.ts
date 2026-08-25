import type { PluginOption } from 'vite';

import { build } from 'vite';

import config from '../../vite.config';

/**
 * Reaches the `sitemap()`, `headers()` and `stripTw()` plugins through the config
 * `vite.config.ts` already default-exports, so none of them needs an export of
 * its own to be testable.
 *
 * `PluginOption` is `Plugin | { name: string } | false | null | undefined |
 * PluginOption[] | Promise<…>`, and nothing here narrows it: the value found is
 * handed straight back to `build`, whose `plugins` takes exactly that union. So
 * there is no assertion to get wrong — no `as`, no guard claiming `Plugin` on the
 * strength of a `name` alone — and a falsy or pending entry simply never matches.
 *
 * Nested because plugin factories return arrays: of the 68 named plugins the
 * config flattens to, `cloudflare()` contributes 18 and `tanstackStart()` 26, and
 * the three looked for here are single objects sitting between them. Three of
 * tanstack's names appear twice (`code-splitter:compile-{reference,virtual,shared}-file`),
 * so `find` taking the first match is not academic — `sitemap`, `headers` and
 * `strip-tw` are each unique, measured, and a collision would be a wrong plugin
 * rather than a missing one.
 */
const flatten = (value: PluginOption | PluginOption[]): PluginOption[] => {
  if (Array.isArray(value)) return value.flatMap(entry => flatten(entry));

  return [value];
};

const PLUGINS = flatten(config.plugins ?? []);

/**
 * One plugin out of the resolved config, by the `name` it declares.
 *
 * Throws rather than returning undefined: a plugin dropped from the array is the
 * failure these tests exist to catch, and a suite that skipped its assertions
 * instead of failing them would be silent about it.
 */
const plugin = (name: string): PluginOption => {
  const found = PLUGINS.find(entry => typeof entry === 'object' && entry !== null && 'name' in entry && entry.name === name);
  if (found === undefined) throw new Error(`vite.config.ts declares no plugin named '${name}'`);

  return found;
};

/** A module the build can start from, so nothing has to exist on disk. */
const ENTRY_ID = '\0source-test-entry.js';

const entry = (code: string): PluginOption => ({
  name: 'source-test-entry',
  // `pre`, because vite's own resolve plugin is ordered ahead of normal user
  // plugins and would resolve a specifier like `#lib/cn` off disk first.
  enforce: 'pre',
  // Everything the entry imports is external, so the graph is that one module
  // and a fixture can name any specifier it likes. `stripTw` reads the import's
  // source string off the AST and never resolves it, so nothing is lost.
  resolveId: id => (id === 'source-test-entry' ? ENTRY_ID : { id, external: true }),
  load: id => (id === ENTRY_ID ? code : null),
});

/**
 * Runs a real client build over the given plugins and nothing else, writing
 * nothing to disk.
 *
 * The bundler is what calls the hooks, so `applyToEnvironment` and a `transform`
 * filter are exercised rather than bypassed — which a hand-made `this` would not
 * be. It also means no `PluginContext` has to be stood up: `generateBundle`'s
 * `this` is typed as the full interface, and an object literal short of it is a
 * `TS2740`, not something a cast should paper over.
 *
 * Measured at ~20ms per call, against ~800ms to import `vite.config.ts` once.
 */
const run = async (code: string, plugins: PluginOption[]): Promise<[string, string][]> => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [entry(code), ...plugins],
    build: { write: false, minify: false, rolldownOptions: { input: 'source-test-entry' } },
  });

  const outputs = Array.isArray(result) ? result : [result];

  return outputs.flatMap(output =>
    'output' in output
      ? output.output.flatMap((item): [string, string][] => (item.type === 'asset' && typeof item.source === 'string' ? [[item.fileName, item.source]] : []))
      : [],
  );
};

/**
 * The one asset a plugin emits, by the plugin's name and the file's.
 *
 * Called inside each `it` rather than once in a `beforeAll`: a `beforeAll` that
 * throws reports its tests as **skipped**, not failed — measured, with
 * `sitemap()` taken out of the config, as `4 tests | 4 skipped`. The run is still
 * red at the file level, but a skipped test reads as a green one, and that is the
 * shape this repo's suites are built to avoid. At ~20ms a build, running one per
 * test is cheaper than the ambiguity.
 */
export const emittedFile = async (name: string, fileName: string): Promise<string> => {
  const assets = new Map(await run('export const entry = 1;\n', [plugin(name)]));
  const source = assets.get(fileName);
  if (source === undefined) throw new Error(`the ${name} plugin emitted ${[...assets.keys()].join(', ') || 'nothing'}, not ${fileName}`);

  return source;
};

/**
 * What `strip-tw` hands the next plugin in the chain, for one module.
 *
 * Captured from a plugin listed after it rather than by calling its handler: the
 * transform chain passes each plugin the previous one's exact output, so this is
 * the byte-for-byte result, and authoring a `transform` hook needs no context
 * stub the way calling one would.
 */
export const stripped = async (code: string): Promise<string> => {
  const seen: string[] = [];
  const capture: PluginOption = {
    name: 'source-test-capture',
    transform: (transformed, id) => {
      if (id === ENTRY_ID) seen.push(transformed);

      return null;
    },
  };

  await run(code, [plugin('strip-tw'), capture]);
  const [first] = seen;
  if (first === undefined) throw new Error('the entry module never reached the capturing transform');

  return first;
};
