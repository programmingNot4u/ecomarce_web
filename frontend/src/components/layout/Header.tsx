import { Bars3Icon, ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useMediaQuery } from '@react-hook/media-query';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import maryoneLogo from '../../assets/logos/maryone_logo.png';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';
import CartDrawer from './CartDrawer';
import MegaMenu from './MegaMenu';
import TopBar from './TopBar';

const Header = () => {
    const { theme } = useTheme(); // Use Theme Context
    const { scrollY } = useScroll();
    const isMobile = useMediaQuery('only screen and (max-width: 768px)');
    const navigationHook = useNavigate(); // Renamed to avoid conflict with 'navigation' array
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const { categories } = useProducts();
    const { isAuthenticated, user } = useAuth();

    // Derived navigation from dynamic categories
    const navigation = categories
        .filter(cat => cat.showInMenu === true || String(cat.showInMenu) === 'true')
        .map(cat => ({
            name: cat.name.toUpperCase(),
            href: `/category/${encodeURIComponent(cat.name).toLowerCase()}`,
            id: cat.id
        }));

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // State to track expanded mobile categories
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const toggleCategory = (id: string) => {
        setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Mobile Search Handler
    const handleMobileSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const query = (e.target as HTMLInputElement).value;
            if (query.trim()) {
                setMobileMenuOpen(false);
                navigationHook(`/shop?q=${encodeURIComponent(query)}`);
            }
        }
    };
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen || cartDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen, cartDrawerOpen]);

    // We define separate animation configurations for Mobile and Desktop to solve layout issues.

    // Desktop Configuration: Large offset (35vh), larger scale (2.5x), standard scroll distance (300px)
    const yDesktop = useTransform(scrollY, [0, 300], ["35vh", "0vh"]);
    const scaleDesktop = useTransform(scrollY, [0, 300], [2.5, 1]);
    const filterDesktop = useTransform(scrollY, [0, 300], ["invert(1) brightness(100)", "invert(0) brightness(1)"]);

    // Mobile Configuration: Smaller offset (22vh) to avoid overlap, smaller scale (1.5x) to fit screen, faster transition (150px)
    // This addresses the "cut off" and "misplaced" issues on mobile.
    const yMobile = useTransform(scrollY, [0, 150], ["22vh", "0vh"]);
    const scaleMobile = useTransform(scrollY, [0, 150], [1.5, 1]);
    const filterMobile = useTransform(scrollY, [0, 150], ["invert(1) brightness(100)", "invert(0) brightness(1)"]);

    const y = isMobile ? yMobile : yDesktop;
    const scale = isMobile ? scaleMobile : scaleDesktop;
    const filter = isMobile ? filterMobile : filterDesktop;

    // Logic:
    const shouldAnimate = isHomePage && theme.enableLogoAnimation; // Updated Logic

    // Hide floating logo when mobile menu is open to prevent overlap
    const logoOpacity = mobileMenuOpen ? 0 : 1;

    const logoStyle = shouldAnimate ? {
        y,
        x: "0px", // Explicitly 0
        scale,
        filter,
        opacity: logoOpacity,
        transformOrigin: "left center",
        zIndex: 60,
    } : {
        filter: "invert(0)",
        opacity: logoOpacity
    };

    // Determine Logo Source
    const logoSrc = (theme.logo && theme.logo !== 'text') ? theme.logo : maryoneLogo;

    return (
        <header className="bg-white sticky top-0 z-50">
            <TopBar />
            <nav className="mx-auto max-w-[1920px] px-6 md:px-20 border-b border-gray-100" aria-label="Top">
                <div className="flex w-full items-center justify-between py-6">
                    <div className="flex items-center">
                        {/* Mobile Menu Button - Left aligned */}
                        <div className="flex lg:hidden mr-4">
                            <button
                                type="button"
                                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                                onClick={() => setMobileMenuOpen(true)}
                            >
                                <span className="sr-only">Open main menu</span>
                                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>

                        <Link to="/" className="flex items-center gap-2 group">
                            <motion.img
                                src={logoSrc}
                                alt="Maryone"
                                style={logoStyle}
                                className="h-8 w-auto object-contain transition-all"
                            />
                        </Link>

                        {/* Mega Menu Integration */}
                        <div className="hidden ml-10 lg:block self-stretch">
                            {/* self-stretch is important if we rely on h-full in nav items */}
                            <MegaMenu />
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        {isAuthenticated ? (
                            <Link to="/account" className="hidden md:block text-sm font-medium text-gray-700 hover:text-gray-800">
                                {user?.name || "Account"}
                            </Link>
                        ) : (
                            <Link to="/login" className="hidden md:block text-sm font-medium text-gray-700 hover:text-gray-800">
                                Log in
                            </Link>
                        )}
                        <button
                            onClick={() => setCartDrawerOpen(true)}
                            className="group -m-2 flex items-center p-2"
                        >
                            <ShoppingBagIcon
                                className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
                                {useCart().totalItems}
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Cart Drawer Component */}
            <CartDrawer open={cartDrawerOpen} setOpen={setCartDrawerOpen} />


            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}

                            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm lg:hidden"
                        />

                        {/* Slide-out Menu Panel */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 left-0 z-[100] w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 lg:hidden"
                        >
                            <div className="flex items-center justify-between">
                                <Link to="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                                    <span className="sr-only">Maryone</span>
                                    <img
                                        className="h-8 w-auto"
                                        src={logoSrc}
                                        alt="Maryone"
                                    />
                                </Link>
                                <button
                                    type="button"
                                    className="-m-2.5 rounded-md p-2.5 text-gray-700"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="sr-only">Close menu</span>
                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                            <div className="mt-8 flow-root">
                                <div className="-my-6 divide-y divide-gray-500/10">
                                    {/* Mobile Search Bar */}
                                    <div className="py-6">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full rounded-md border-0 py-2.5 pr-10 pl-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-gray-50"
                                                placeholder="Search products..."
                                                onKeyDown={handleMobileSearch}
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 py-6">
                                        {categories.filter(cat => cat.showInMenu === true || String(cat.showInMenu) === 'true').map((cat) => (
                                            <div key={cat.id} className="border-b border-gray-100 last:border-0 pb-2">
                                                <div className="flex items-center justify-between">
                                                    <Link
                                                        to={`/category/${encodeURIComponent(cat.name).toLowerCase()}`}
                                                        className="block rounded-lg py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 uppercase tracking-widest flex-grow"
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        {cat.name}
                                                    </Link>
                                                    {cat.subCategories && cat.subCategories.length > 0 && (
                                                        <button
                                                            onClick={() => toggleCategory(cat.id)}
                                                            className="p-2 text-gray-500 hover:text-gray-900"
                                                        >
                                                            {expandedCategories[cat.id] ? (
                                                                <ChevronUpIcon className="h-5 w-5" />
                                                            ) : (
                                                                <ChevronDownIcon className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Subcategories */}
                                                <AnimatePresence>
                                                    {expandedCategories[cat.id] && cat.subCategories && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden pl-4 space-y-2"
                                                        >
                                                            {cat.subCategories.map(sub => (
                                                                <div key={sub.id} className="py-1">
                                                                    <Link
                                                                        to={`/category/${encodeURIComponent(sub.name).toLowerCase()}`}
                                                                        className="block py-3 text-sm font-medium text-gray-600 hover:text-primary uppercase tracking-wider pl-2 border-l-2 border-transparent hover:border-gray-200 transition-all"
                                                                        onClick={() => setMobileMenuOpen(false)}
                                                                    >
                                                                        {sub.name}
                                                                    </Link>
                                                                    {/* Level 3 */}
                                                                    {sub.subCategories && sub.subCategories.length > 0 && (
                                                                        <div className="pl-4 mt-1 border-l border-gray-200">
                                                                            {sub.subCategories.map(l3 => (
                                                                                <Link
                                                                                    key={l3.id}
                                                                                    to={`/category/${encodeURIComponent(l3.name).toLowerCase()}`}
                                                                                    className="block py-2 text-xs font-medium text-gray-500 hover:text-primary uppercase tracking-wide opacity-80"
                                                                                    onClick={() => setMobileMenuOpen(false)}
                                                                                >
                                                                                    {l3.name}
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="py-6">
                                        {isAuthenticated ? (
                                            <Link
                                                to="/account"
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Account
                                            </Link>
                                        ) : (
                                            <Link
                                                to="/login"
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Log in
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
