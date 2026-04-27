import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ethers } from 'ethers';
import TwitterABI from '../contracts/TwitterABI.json';


declare global {
    interface Window {
        ethereum: any;
    }
}

interface Web3ContextType {
    account: string | null;
    contract: ethers.Contract | null;
    connectWallet: () => Promise<void>;
    loading: boolean;
    error: string | null;
    isCorrectNetwork: boolean;
}

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111

const ensureSepoliaNetwork = async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
    } catch (switchError: any) {
        // 4902 = chain not added to the wallet
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: SEPOLIA_CHAIN_ID,
                        chainName: 'Sepolia Testnet',
                        nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                        rpcUrls: ['https://sepolia.infura.io/v3/'],
                        blockExplorerUrls: ['https://sepolia.etherscan.io'],
                    },
                ],
            });
        } else {
            throw switchError;
        }
    }
};

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const CONTRACT_ADDRESS = "0xBEf1fCe062D3ae0bB3e209Dd0B2158fC92a59e50";

export const Web3Provider = ({ children }: { children: ReactNode }) => {


    const [account, setAccount] = useState<string | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);

    const checkNetwork = async () => {
        if (!window.ethereum) return false;
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const correct = chainId.toLowerCase() === SEPOLIA_CHAIN_ID.toLowerCase();
        setIsCorrectNetwork(correct);
        return correct;
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            setError("Please install MetaMask");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Ensure we are on Sepolia before doing anything else
            await ensureSepoliaNetwork();
            setIsCorrectNetwork(true);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const signer = await provider.getSigner();

            const twitterContract = new ethers.Contract(CONTRACT_ADDRESS, TwitterABI, signer);

            setAccount(accounts[0]);
            setContract(twitterContract);
        } catch (err: any) {
            setError(err.message || "Failed to connect wallet");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkIfWalletIsConnected = async () => {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    connectWallet();
                }
            }
        };
        checkIfWalletIsConnected();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount(null);
                    setContract(null);
                    setIsCorrectNetwork(false);
                }
            });

            window.ethereum.on('chainChanged', () => {
                // Re-check network on chain change
                checkNetwork().then((correct) => {
                    if (!correct) {
                        // Clear contract since we're on wrong network
                        setContract(null);
                    }
                });
            });
        }
    }, []);

    return (
        <Web3Context.Provider value={{ account, contract, connectWallet, loading, error, isCorrectNetwork }}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (context === undefined) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
};
