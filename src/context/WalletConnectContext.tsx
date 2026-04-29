/**
 * WalletConnectContext.tsx
 * 
 * Unified Web3 authentication context supporting both MetaMask and WalletConnect.
 * This file replaces / augments the existing Web3Context so that the rest of
 * the app (Home, ProtectedRoute, Sidebar, TweetCard …) can remain unchanged –
 * they all call `useWeb3()` and receive the same shape as before, plus two
 * new helpers: `loginMethod` and `disconnect`.
 */

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    type ReactNode,
} from 'react';
import { ethers } from 'ethers';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import TwitterABI from '../contracts/TwitterABI.json';

// ─── Types ───────────────────────────────────────────────────────────────────

export type LoginMethod = 'metamask' | 'walletconnect' | null;

export interface Web3ContextType {
    account: string | null;
    contract: ethers.Contract | null;
    connectMetaMask: () => Promise<void>;
    connectWalletConnect: () => Promise<void>;
    /** legacy alias – still works for ProtectedRoute etc. */
    connectWallet: () => Promise<void>;
    disconnect: () => Promise<void>;
    loading: boolean;
    error: string | null;
    isCorrectNetwork: boolean;
    loginMethod: LoginMethod;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SEPOLIA_CHAIN_ID = 11155111; // decimal
const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';
const CONTRACT_ADDRESS = '0xE04922e9Fbaa53736436EF60C474546f249B714b';

/**
 * NOTE: Replace this with your own WalletConnect Cloud Project ID.
 * Get one for free at https://cloud.walletconnect.com
 */
const WC_PROJECT_ID = 'b56e18d47c72ab683b10814fe9495694';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ensureSepoliaMetaMask = async () => {
    await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    }).catch(async (switchError: any) => {
        if (switchError.code === 4902) {
            await (window as any).ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: SEPOLIA_CHAIN_ID_HEX,
                    chainName: 'Sepolia Testnet',
                    nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                    rpcUrls: ['https://rpc.sepolia.org'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io'],
                }],
            });
        } else {
            throw switchError;
        }
    });
};

// ─── Context ─────────────────────────────────────────────────────────────────

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export const Web3Provider = ({ children }: { children: ReactNode }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
    const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);

    // Keep a ref to the WalletConnect provider instance so we can reuse / disconnect it.
    const wcProviderRef = useRef<Awaited<ReturnType<typeof EthereumProvider.init>> | null>(null);

    // ── Helpers ──────────────────────────────────────────────────────────────

    const buildContract = (signer: ethers.Signer) =>
        new ethers.Contract(CONTRACT_ADDRESS, TwitterABI, signer);

    // ── MetaMask ─────────────────────────────────────────────────────────────

    const connectMetaMask = async () => {
        if (!(window as any).ethereum) {
            setError('MetaMask is not installed. Please install it and try again.');
            return;
        }
        try {
            setLoading(true);
            setError(null);

            await ensureSepoliaMetaMask();
            setIsCorrectNetwork(true);

            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const accounts: string[] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
            const signer = await provider.getSigner();

            setAccount(accounts[0]);
            setContract(buildContract(signer));
            setLoginMethod('metamask');

            // Persist choice
            localStorage.setItem('wt_login_method', 'metamask');
        } catch (err: any) {
            setError(err.message || 'Failed to connect MetaMask');
        } finally {
            setLoading(false);
        }
    };

    // ── WalletConnect ────────────────────────────────────────────────────────

    const getOrInitWCProvider = async () => {
        if (wcProviderRef.current) return wcProviderRef.current;

        const wc = await EthereumProvider.init({
            projectId: WC_PROJECT_ID,
            chains: [SEPOLIA_CHAIN_ID],
            showQrModal: true,
            metadata: {
                name: 'Web3 Twitter',
                description: 'Decentralised Twitter on Sepolia',
                url: window.location.origin,
                icons: [`${window.location.origin}/favicon.ico`],
            },
        });

        wcProviderRef.current = wc;
        return wc;
    };

    const connectWalletConnect = async () => {
        try {
            setLoading(true);
            setError(null);

            const wc = await getOrInitWCProvider();

            // Connect (shows QR modal)
            await wc.connect();

            const ethersProvider = new ethers.BrowserProvider(wc as any);
            const signer = await ethersProvider.getSigner();
            const addr = await signer.getAddress();

            // Verify network
            const network = await ethersProvider.getNetwork();
            const correct = Number(network.chainId) === SEPOLIA_CHAIN_ID;
            setIsCorrectNetwork(correct);

            setAccount(addr);
            setContract(buildContract(signer));
            setLoginMethod('walletconnect');

            localStorage.setItem('wt_login_method', 'walletconnect');

            // Listen for disconnect / account changes
            wc.on('disconnect', () => {
                setAccount(null);
                setContract(null);
                setLoginMethod(null);
                setIsCorrectNetwork(false);
                localStorage.removeItem('wt_login_method');
            });

            wc.on('accountsChanged', async (accounts: string[]) => {
                if (accounts.length === 0) {
                    setAccount(null);
                    setContract(null);
                } else {
                    const p = new ethers.BrowserProvider(wc as any);
                    const s = await p.getSigner();
                    setAccount(accounts[0]);
                    setContract(buildContract(s));
                }
            });

        } catch (err: any) {
            if (err?.message?.toLowerCase().includes('modal closed') || err?.message?.toLowerCase().includes('user rejected')) {
                setError('Connection cancelled');
            } else {
                setError(err.message || 'Failed to connect via WalletConnect');
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Disconnect ───────────────────────────────────────────────────────────

    const disconnect = async () => {
        if (loginMethod === 'walletconnect' && wcProviderRef.current) {
            try { await wcProviderRef.current.disconnect(); } catch { /* ignore */ }
            wcProviderRef.current = null;
        }
        setAccount(null);
        setContract(null);
        setLoginMethod(null);
        setIsCorrectNetwork(false);
        localStorage.removeItem('wt_login_method');
    };

    // ── Auto-reconnect on mount ──────────────────────────────────────────────

    useEffect(() => {
        const savedMethod = localStorage.getItem('wt_login_method') as LoginMethod;

        if (savedMethod === 'metamask') {
            // Only auto-reconnect if already permitted (no modal)
            if ((window as any).ethereum) {
                (window as any).ethereum
                    .request({ method: 'eth_accounts' })
                    .then((accounts: string[]) => {
                        if (accounts.length > 0) connectMetaMask();
                    })
                    .catch(() => { });
            }
        } else if (savedMethod === 'walletconnect') {
            // Silently try to restore WC session
            (async () => {
                try {
                    const wc = await getOrInitWCProvider();
                    if (wc.session) {
                        const ethersProvider = new ethers.BrowserProvider(wc as any);
                        const signer = await ethersProvider.getSigner();
                        const addr = await signer.getAddress();
                        const network = await ethersProvider.getNetwork();
                        setAccount(addr);
                        setContract(buildContract(signer));
                        setLoginMethod('walletconnect');
                        setIsCorrectNetwork(Number(network.chainId) === SEPOLIA_CHAIN_ID);
                    }
                } catch { /* session expired */ }
            })();
        }

        // MetaMask event listeners
        if ((window as any).ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (loginMethod !== 'metamask') return;
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount(null);
                    setContract(null);
                    setIsCorrectNetwork(false);
                    localStorage.removeItem('wt_login_method');
                }
            };
            const handleChainChanged = () => {
                if (loginMethod !== 'metamask') return;
                (window as any).ethereum.request({ method: 'eth_chainId' }).then((chainId: string) => {
                    const correct = chainId.toLowerCase() === SEPOLIA_CHAIN_ID_HEX.toLowerCase();
                    setIsCorrectNetwork(correct);
                    if (!correct) setContract(null);
                });
            };
            (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
            (window as any).ethereum.on('chainChanged', handleChainChanged);
            return () => {
                (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
                (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Legacy alias ─────────────────────────────────────────────────────────

    /** connectWallet is kept so that ProtectedRoute / old code still compiles */
    const connectWallet = connectMetaMask;

    return (
        <Web3Context.Provider
            value={{
                account,
                contract,
                connectMetaMask,
                connectWalletConnect,
                connectWallet,
                disconnect,
                loading,
                error,
                isCorrectNetwork,
                loginMethod,
            }}
        >
            {children}
        </Web3Context.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useWeb3 = () => {
    const ctx = useContext(Web3Context);
    if (!ctx) throw new Error('useWeb3 must be used within a Web3Provider');
    return ctx;
};
