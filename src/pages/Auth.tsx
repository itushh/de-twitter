import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import MetamaskLogo from '../assets/metamask-logo.svg';
import WalletConnectLogo from '../assets/walletconnect-logo.svg';
import { TwitterLogo } from '../components/icons/TwitterLogo';
import { Loader2 } from 'lucide-react';


const Auth = () => {
  const { account, connectMetaMask, connectWalletConnect, loading, error } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    if (account) navigate('/');
  }, [account, navigate]);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 min-h-dvh">
      {/* Logo (mobile only) */}
      <div className="lg:hidden mb-10">
        <TwitterLogo className="text-twitter-blue fill-twitter-blue" size={48} />
      </div>

      <div className="w-full max-w-sm">
        <h1 className="text-3xl sm:text-4xl mb-2 text-center">
          Join <span className='opacity-50 font-serif'>d</span>Twitter
        </h1>
        <p className="text-gray-400 mb-10 text-base text-center">
          'cause nobody deserves to delete your tweets!
        </p>

        {/* ── MetaMask button ── */}
        <button
          id="btn-connect-metamask"
          onClick={connectMetaMask}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 px-6 rounded-full hover:bg-gray-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mb-4"
        >
          {loading
            ? <Loader2 size={20} className="animate-spin text-orange-500" />
            : <img src={MetamaskLogo} className="w-5 h-5" alt="MetaMask" />
          }
          Continue with MetaMask
        </button>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        {/* ── WalletConnect button ── */}
        <button
          id="btn-connect-walletconnect"
          onClick={connectWalletConnect}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-[#3b99fc]/10 border border-[#3b99fc]/40 text-[#3b99fc] font-bold py-3 px-6 rounded-full hover:bg-[#3b99fc]/20 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? <Loader2 size={20} className="animate-spin" />
            : <img src={WalletConnectLogo} className="w-5 h-5" alt="WalletConnect" />
          }
          Continue with WalletConnect
        </button>

        {/* ── Error ── */}
        {error && (
          <p className="mt-5 text-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-4">
            {error}
          </p>
        )}

        <p className="mt-10 text-gray-600 text-xs text-center leading-relaxed">
          By connecting, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default Auth;