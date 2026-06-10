/**
 * Error thrown by the `sudo rm -rf` terminal easter egg to trigger the BSOD.
 *
 * Lives in its own module so the global error boundary (BSODError, eager in
 * the entry chunk) can `instanceof`-check it without importing the Terminal
 * command registry, which would drag every command-output component into the
 * entry bundle.
 */
export class SudoRmRfError extends Error {
  constructor() {
    super('SYSTEM_DIAGNOSTIC_FAILURE');
    this.name = 'SudoRmRfError';
  }
}
