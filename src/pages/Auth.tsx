import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import MetamaskLogo from '../assets/metamask-logo.svg';


const Auth = () => {
  const { account, connectWallet, loading, error } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    if (account) {
      navigate('/');
    }
  }, [account, navigate]);

  return (
    <div className='min-h-dvh flex flex-col items-center justify-center'>
      <div className='mb-10'>
        <div
          onClick={connectWallet}
          className='cursor-pointer border border-border px-8 py-4 rounded-full flex gap-5 items-center'>
          <img src={MetamaskLogo} className='w-5' />
          {loading ? "Waiting to confirm" : "Connect to Metamask"}
        </div>
        <p className='text-center mt-5 text-red-500'>{error ? error : ""}</p>
      </div>

      <div className='flex w-100 gap-2 items-center opacity-50'>
        <div className='border-b border-border flex-1'></div>
        <div>or</div>
        <div className='border-b border-border flex-1'></div>
      </div>

      <div className='mt-10 border border-border px-8 py-4 rounded-full'>
        web 3 auth providers
      </div>
    </div>
  )
};

export default Auth;