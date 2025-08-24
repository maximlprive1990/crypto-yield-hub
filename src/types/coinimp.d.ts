
export {};

declare global {
  interface Window {
    _client?: any;
    Client?: any;
    miningClient?: any;
    miningClientInitialized?: boolean;
  }
}
