// Stub for react-dom/server in browser test environment
// SSR utilities are not needed for client-side component tests

export const renderToString = () => '';
export const renderToStaticMarkup = () => '';
export const renderToPipeableStream = () => ({ pipe: () => {}, abort: () => {} });
export const renderToReadableStream = () => Promise.resolve(new ReadableStream());

// Default export for CommonJS interop
export default {
  renderToString,
  renderToStaticMarkup,
  renderToPipeableStream,
  renderToReadableStream,
};
