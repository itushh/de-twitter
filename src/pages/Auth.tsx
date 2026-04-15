import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { TwitterLogo } from '../components/icons/TwitterLogo';


const Auth = () => {
  const { account, connectWallet, loading, error } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    if (account) {
      navigate('/');
    }
  }, [account, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Left side - Splash image area */}
      <div className="flex-1 bg-linear-to-br from-gray-900 to-black flex items-center justify-center p-8 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />

        <TwitterLogo size={350} className="text-white relative z-10 opacity-90 hidden lg:block" />
        <TwitterLogo size={150} className="text-white relative z-10 opacity-90 lg:hidden" />
      </div>

      {/* Right side - Login area */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 md:px-16 max-w-2xl">
        <TwitterLogo size={45} className="mb-10 text-white" />


        <h1 className="text-5xl md:text-7xl font-black mb-12 tracking-tight text-center">Happening Now</h1>
        <h2 className="text-3xl font-bold mb-8 text-center">Join the decentralized conversation today.</h2>

        <div className="space-y-4 w-full max-w-sm mx-auto">
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full bg-twitter-blue hover:bg-twitter-blue-hover text-black font-bold py-3 px-6 rounded-full flex items-center justify-center space-x-2 transition-all duration-200 transform active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Connect MetaMask</span>
            )}
          </button>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="mt-16">
          <h3 className="text-xl font-bold mb-4 text-center">Already have a wallet?</h3>
          <button
            onClick={connectWallet}
            className="w-full border border-gray-700 hover:bg-blue-900/10 text-blue-400 font-bold py-3 px-6 rounded-full transition-all duration-200"
          >
            Sign In with Web3
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-8">
          By connecting, you agree to the Terms of Service and Privacy Policy, including Cookie Use.
        </p>
      </div>
    </div>
  );
};

export default Auth;