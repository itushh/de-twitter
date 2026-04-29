/**
 * Web3Context.tsx
 *
 * Re-exports everything from WalletConnectContext so that all existing
 * imports like `import { useWeb3 } from '../context/Web3Context'` continue
 * to work without any changes.
 */
export { Web3Provider, useWeb3 } from './WalletConnectContext';
export type { Web3ContextType, LoginMethod } from './WalletConnectContext';
