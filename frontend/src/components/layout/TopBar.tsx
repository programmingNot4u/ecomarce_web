import { HeartIcon, MagnifyingGlassIcon, MapPinIcon, ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { RootState } from '../../store/store';

const TopBar = () => {
    const { theme } = useTheme();
    const totalQuantity = useSelector((state: RootState) => state.cart.totalQuantity);
    const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/shop?q=${encodeURIComponent(query)}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="bg-white border-b border-gray-100 hidden sm:block">
            <div className="mx-auto max-w-[1920px] px-6 md:px-20 h-10 flex items-center justify-between space-x-8">
                
                {/* Help Text */}
                <div className="hidden lg:flex items-center text-xs font-medium text-gray-500">
                    <span>{theme.textSnippets?.header_help_text || "Need Help? Call Us:"}</span>
                    <span className="ml-2 text-gray-900">{theme.textSnippets?.contact_phone || "09613660321"}</span>
                </div>
                
                {/* Search Bar - Functional and Aesthetic */}
                <div className="flex items-center border-b border-gray-200 focus-within:border-black transition-colors duration-300 pb-1 w-64 group">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search products..." 
                        className="border-none p-0 ml-2 text-sm w-full focus:ring-0 focus:outline-none placeholder:text-gray-400 text-gray-900 bg-transparent font-medium" 
                    />
                </div>

                <div className="flex items-center space-x-4">
                     <div className="flex items-center text-xs font-medium text-gray-600 cursor-pointer hover:text-black">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>BGD</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                     <Link to={isAuthenticated ? "/account" : "/login"} className="text-gray-600 hover:text-black">
                        <UserIcon className="h-5 w-5" />
                    </Link>
                     <div className="relative">
                        <Link to="/account/wishlist" className="text-gray-600 hover:text-black">
                             <HeartIcon className="h-5 w-5" />
                             {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-accent text-[10px] text-white flex items-center justify-center rounded-full">
                                    {wishlistCount}
                                </span>
                             )}
                        </Link>
                    </div>
                    <div className="relative">
                        <Link to="/cart" className="text-gray-600 hover:text-black">
                            <ShoppingBagIcon className="h-5 w-5" />
                            {totalQuantity > 0 && (
                                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-accent text-[10px] text-white flex items-center justify-center rounded-full">
                                    {totalQuantity}
                                </span>
                             )}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
