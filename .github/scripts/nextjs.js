// @ts-check

/**
 * @param {{core: import('@actions/core')}} param0
 */
module.exports = async ({ core }) => {
  const { readFileSync, existsSync, writeFileSync } = require('fs');
  const { cwd } = require('process');
  const { join } = require('path');
  const { default: prettyBytes } = await import('pretty-bytes');
  const { gzipSizeFromFileSync } = await import('gzip-size');

  /** @type {{[key: string]: string} | null} */
  const appRoutes = existsSync('.next/app-path-routes-manifest.json')
    ? JSON.parse(readFileSync('.next/app-path-routes-manifest.json', 'utf8'))
    : null;

  /** @type {import('./nextjs.d.ts').AppManifest | null} */
  const appManifest = appRoutes ? JSON.parse(readFileSync('.next/app-build-manifest.json', 'utf8')) : null;

  /** @type {import('./nextjs.d.ts').BuildManifest} */
  const buildManifest = JSON.parse(readFileSync('.next/build-manifest.json', 'utf8'));

  /** @type {import('./nextjs.d.ts').MiddlewareManifest | null} */
  const middlewareManifest = existsSync('.next/server/middleware-manifest.json')
    ? JSON.parse(readFileSync('.next/server/middleware-manifest.json', 'utf8'))
    : null;

  /** @type {import('./nextjs.js').BundleAnalysis | null} */
  const analysis = existsSync('analysis/analysis.json')
    ? JSON.parse(readFileSync('analysis/analysis.json', 'utf8'))
    : null;

  const globalSize = getFileSize(buildManifest.pages['/_app']);
  const appGlobal = appManifest ? Object.values(appManifest.pages).flatMap(v => v) : [];
  const appGlobalSize = appManifest
    ? getFileSize([
        ...new Set(
          appGlobal.filter(
            a => (appGlobal.filter(s => a === s)?.length ?? 0) == Object.values(appManifest.pages).length
          )
        ),
      ])
    : 0;

  const pageRouterPages = Object.entries(buildManifest.pages ?? {})
    .filter(([key]) => key !== '/_app')
    .map(([key, value]) => {
      const routeSize = getFileSize(value.filter(a => !buildManifest.pages['/_app'].includes(a)));

      return {
        route: key === '/_error' ? '/404' : key,
        size: routeSize,
        js: routeSize + globalSize,
      };
    });
  const appRouterPages = appManifest
    ? Object.entries(appRoutes ?? {}).map(([key, value]) => {
        if (key.endsWith('route')) return { route: value, size: 0, js: 0 };
        return {
          route: value,
          size: getFileSize([appManifest.pages[key][appManifest.pages[key].length - 1]]),
          js: getFileSize(appManifest.pages[key]),
        };
      })
    : [];

  const middlewareSize = middlewareManifest?.middleware['/']
    ? getFileSize(middlewareManifest.middleware['/'].files)
    : 0;

  writeFileSync(
    'analysis.json',
    JSON.stringify({
      global: {
        app: appGlobalSize,
        pages: globalSize,
      },
      routes: {
        app: appRouterPages,
        pages: pageRouterPages,
      },
      middleware: middlewareSize,
    })
  );

  if (!analysis) return;

  const detectedRoutes = [
    ...Object.values(appRoutes ?? []),
    ...Object.keys(buildManifest.pages),
    '/404',
  ].filter(r => r);

  const results = {
    global: {
      app: {
        size: appGlobalSize,
        diff: appGlobalSize - analysis.global.app,
        increase: Math.sign(appGlobalSize - analysis.global.app) === 1,
      },
      pages: {
        size: globalSize,
        diff: globalSize - analysis.global.pages,
        increase: Math.sign(globalSize - analysis.global.pages) === 1,
      },
    },
    routes: {
      app: appRouterPages
        ?.filter(({ route }) => detectedRoutes.find(a => a === route))
        .map(({ route, size, js }) => ({
          route,
          size,
          before: analysis.routes.app.find(a => a.route === route)?.size ?? 0,
          js,
        }))
        .filter(({ before, size }) => before === size)
        .sort(),
      pages: pageRouterPages
        ?.filter(({ route }) => detectedRoutes.find(a => a === route))
        .map(({ route, size, js }) => ({
          route,
          size,
          before: analysis.routes.pages.find(a => a.route === route)?.size ?? 0,
          js,
        }))
        .filter(({ before, size }) => before === size)
        .sort(),
      changes: {
        app: appRouterPages
          ?.filter(({ route }) => detectedRoutes.find(a => a === route))
          .map(({ route, size, js }) => ({
            route,
            size,
            before: analysis.routes.app.find(a => a.route === route)?.size ?? 0,
            js,
          }))
          .filter(({ before, size }) => before !== size)
          .sort(),
        pages: pageRouterPages
          ?.filter(({ route }) => detectedRoutes.find(a => a === route))
          .map(({ route, size, js }) => ({
            route,
            size,
            before: analysis.routes.pages.find(a => a.route === route)?.size ?? 0,
            js,
          }))
          .filter(({ before, size }) => before !== size)
          .sort(),
      },
      new: {
        app: appRouterPages
          ?.filter(({ route }) => !detectedRoutes.find(a => a === route))
          .map(({ route, size, js }) => ({
            route,
            size,
            before: analysis.routes.app.find(a => a.route === route)?.size ?? 0,
            js,
          }))
          .sort(),
        pages: pageRouterPages
          ?.filter(({ route }) => !detectedRoutes.find(a => a === route))
          .map(({ route, size, js }) => ({
            route,
            size,
            before: analysis.routes.pages.find(a => a.route === route)?.size ?? 0,
            js,
          }))
          .sort(),
      },
    },
    middleware: {
      size: middlewareSize,
      diff: middlewareSize - analysis.middleware,
      increase: Math.sign(middlewareSize - analysis.middleware) === 1,
    },
  };
  const globalChanged = results.global.app.diff || results.global.pages.diff;
  const globalIncreased = results.global.app.increase || results.global.pages.increase;

  const newPages = [...results.routes.new.app, ...results.routes.new.pages].sort();
  const changedPages = [...results.routes.changes.app, ...results.routes.changes.pages].sort();
  const pages = [...results.routes.app, ...results.routes.pages].sort();

  const title = ['# Next.js Bundle Analysis', ''];

  if (!globalChanged && !results.middleware.diff && !newPages.length && !changedPages.length) {
    core.setOutput(
      'body',
      [...title, 'This PR introduced no changes to the JavaScript bundle! 🙌'].join('\n')
    );
    return;
  }

  core.setOutput(
    'body',
    [
      ...title,
      `## ${globalChanged ? (globalIncreased ? '⚠️' : '🎉') : ''} First Load JS shared by all ${
        globalChanged ? (globalIncreased ? 'Increased' : 'Decreased') : ''
      }`,
      '',
      '| Route | Size (compressed) |',
      '| --- | --- |',
      `| \`pages\` | ${prettyBytes(results.global.pages.size)} ${
        globalChanged
          ? `(${renderStatusIndicator(analysis.global.pages, results.global.pages.size)}${prettyBytes(
              results.global.pages.diff,
              { signed: true }
            )})`
          : ''
      } |`,
      appManifest
        ? `| \`app\` | ${prettyBytes(results.global.app.size)} ${
            globalChanged
              ? `(${renderStatusIndicator(analysis.global.app, results.global.app.size)}${prettyBytes(
                  results.global.app.diff,
                  { signed: true }
                )})`
              : ''
          } |`
        : '',
      '',
      '<details>',
      '<summary>Details</summary>',
      '',
      'The **global bundle** is the javascript bundle that loads alongside every page. It is in its own category because its impact is much higher - an increase to its size means that every page on your website loads slower, and a decrease means every page loads faster.  ',
      'Any third party scripts you have added directly to your app using the `<script>` tag are not accounted for in this analysis',
      '</details>',
      '',
      '## Pages',
      '',
      ...(newPages.length
        ? [
            '### New',
            '',
            '| Route | Size (compressed) | First Load JS |',
            '| --- | --- | --- |',
            ...(newPages.map(
              ({ route, size, js }) => `| \`${route}\` | ${prettyBytes(size)} | ${prettyBytes(js)} |`
            ) ?? []),
            '',
          ]
        : []),
      '',
      ...(changedPages.length
        ? [
            `### ${changedPages.length} Page${changedPages.length > 1 ? 's' : ''} Changed Size`,
            '',
            '| Route | Size (compressed) | First Load JS |',
            '| --- | --- | --- |',
            ...(changedPages.map(
              ({ route, size, before, js }) =>
                `| \`${route}\` | ${prettyBytes(size)} ${diffSize(before, size)} | ${prettyBytes(js)} |`
            ) ?? []),
            '',
          ]
        : []),
      '',
      '<details>',
      '<summary><strong>Unchanged Routes</strong></summary>',
      '<br />',
      '',
      '| Route | Size (compressed) | First Load JS |',
      '| --- | --- | --- |',
      ...(pages.map(
        ({ route, size, before, js }) =>
          `| \`${route}\` | ${prettyBytes(size)} ${diffSize(before, size)} | ${prettyBytes(js)} |`
      ) ?? []),
      '</details>',
      '',
      ...(middlewareManifest?.middleware['/']
        ? [
            '## Middleware',
            `Size (compressed): ${prettyBytes(results.middleware.size)} ${
              results.middleware.diff
                ? `(${results.middleware.increase ? '+' : ''}${prettyBytes(results.middleware.diff)})`
                : ''
            }`,
          ]
        : []),
    ]
      .map(s => s.trim())
      .join('\n')
      .trimEnd()
  );

  /**
   * @param {string[]} path
   * @returns {number}
   */
  function getFileSize(path) {
    return path
      .map(p => gzipSizeFromFileSync(join(cwd(), '.next', p)))
      .reduce((acc, val) => {
        acc += val;
        return acc;
      }, 0);
  }

  /**
   * @param {number} before
   * @param {number} after
   * @returns {string}
   */
  function diffSize(before, after) {
    if (before === after) return '';

    return `(${renderStatusIndicator(before, after)}${prettyBytes(after - before, { signed: true })})`;
  }

  /**
   * @param {number} before
   * @param {number} after
   * @returns {string}
   */
  function renderStatusIndicator(before, after) {
    const change = ((after - before) / after) * 100;

    if (change > 0 && change < 20) return '🟡 ';
    if (change >= 20) return '🔴 ';
    if (change < 0.01 && change > -0.01) return '';
    return '🟢 ';
  }
};
