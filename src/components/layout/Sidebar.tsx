import { Home, Bell, Mail, Hash, User, MoreHorizontal, Feather } from 'lucide-react';
import { useWeb3 } from '../../context/Web3Context';
import { TwitterLogo } from '../icons/TwitterLogo';


const Sidebar = () => {
    const { account } = useWeb3();

    const menuItems = [
        { icon: <Home size={28} />, label: "Home", active: true },
        { icon: <Hash size={28} />, label: "Explore" },
        { icon: <Bell size={28} />, label: "Notifications" },
        { icon: <Mail size={28} />, label: "Messages" },
        { icon: <User size={28} />, label: "Profile" },
    ];

    return (
        <div className="flex flex-col h-screen sticky top-0 px-4 py-2 border-r border-gray-800 w-20 xl:w-64">
            <div className="hover:bg-blue-900/20 p-3 rounded-full w-fit mb-2 cursor-pointer transition-colors duration-200">
                <TwitterLogo className="text-white fill-white" size={30} />
            </div>


            <nav className="flex flex-col space-y-1 mb-4">
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center space-x-4 p-3 hover:bg-white/10 rounded-full cursor-pointer transition-colors duration-200 w-fit xl:w-full group"
                    >
                        <span className={`${item.active ? 'font-bold' : ''}`}>{item.icon}</span>
                        <span className={`text-xl hidden xl:block ${item.active ? 'font-bold' : ''}`}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </nav>

            <button className="bg-twitter-blue text-white font-bold py-4 rounded-full text-lg hover:bg-twitter-blue-hover transition-colors duration-200 xl:w-full flex items-center justify-center">
                <Feather className="xl:hidden" size={24} />
                <span className="hidden xl:block">Post</span>
            </button>

            {account && (
                <div className="mt-auto mb-4 flex items-center space-x-3 p-3 hover:bg-white/10 rounded-full cursor-pointer transition-colors duration-200 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 shrink-0" />
                    <div className="hidden xl:flex flex-col overflow-hidden">
                        <span className="font-bold truncate text-sm">User</span>
                        <span className="text-gray-500 text-sm truncate">
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </span>
                    </div>
                    <MoreHorizontal className="hidden xl:block ml-auto text-gray-500" size={18} />
                </div>
            )}
        </div>
    );
};

export default Sidebar;
