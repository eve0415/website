export interface AppRoute {
  [key: string]: string;
}

export interface AppManifest {
  pages: { [key: string]: string[] };
}

export interface BuildManifest {
  polyfillFiles: string[];
  devFiles: string[];
  lowPriorityFiles: string[];
  rootMainFiles: string[];
  pages: {
    '/_app': string[];
    '/_error': string[];
    [key: string]: string[];
  };
  ampFirstPages: string[];
}

export interface MiddlewareManifest {
  sortedMiddleware: string[];
  middleware: {
    '/'?: {
      env: string[];
      files: string[];
      name: string;
      page: string;
      matchers: {
        regexp: string;
        originalSource: string;
      }[];
      wasm: {
        name: string;
        filePath: string;
      }[];
      assets: {
        name: string;
        filePath: string;
      }[];
    };
  };
  functions: {};
  version: number;
}

export interface BundleAnalysis {
  global: {
    app: number;
    pages: number;
  };
  routes: {
    app: { route: string; size: number }[];
    pages: { route: string; size: number }[];
  };
  middleware: number;
}
