import { Dialog, Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, FunnelIcon, MagnifyingGlassIcon, Squares2X2Icon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import PriceRangeSlider from '../components/shop/PriceRangeSlider';
import SearchingLoader from '../components/ui/SearchingLoader';
import { type Category, useProducts } from '../context/ProductContext';

// Removed local mock data
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const sortOptions = [
  { name: 'Most Popular', value: 'popular' },
  { name: 'Best Rating', value: 'rating' },
  { name: 'Newest', value: 'date' },
  { name: 'Price: Low to High', value: 'price-asc' },
  { name: 'Price: High to Low', value: 'price-desc' },
];

const ShopPage = () => {
    const { category } = useParams();
    const [searchParams] = useSearchParams(); // Get URL params
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const { products, categories, brands } = useProducts(); // Dynamic Data
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [isSearching, setIsSearching] = useState(false); // Loading state

    // States for Functionality
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || ''); // Init from URL
    const [sortOption, setSortOption] = useState(sortOptions[0]);
    const [gridCols, setGridCols] = useState(4);
    
    // Filter States
    // Filter States
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const [brandSearch, setBrandSearch] = useState('');
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [stockStatus, setStockStatus] = useState({ onSale: false, inStock: false });

    // --- Dynamic Scope Logic ---
    
    // Helper: Find category node deeply
    const findCategoryDeep = (cats: Category[], slug: string): Category | null => {
        for (const cat of cats) {
            if (cat.name.toLowerCase() === slug || cat.name.toLowerCase() === slug.replace(/-/g, ' & ')) return cat;
            if (cat.subCategories) {
                const found = findCategoryDeep(cat.subCategories, slug);
                if (found) return found;
            }
        }
        return null;
    };

    // Helper: Get all descendant category names (for product filtering)
    const getAllCategoryNames = (cat: Category): string[] => {
        let names = [cat.name];
        if (cat.subCategories) {
            cat.subCategories.forEach(sub => {
                names = [...names, ...getAllCategoryNames(sub)];
            });
        }
        return names;
    };

    // 1. Determine "Base Scope" (Products relevant to current URL)
    // 1. Determine "Base Scope" (Products relevant to current URL)
    const activeCategorySlug = category ? decodeURIComponent(category).toLowerCase() : null;
    
    // Memoize baseProducts to prevent infinite effect loops
    const baseProducts = useMemo(() => {
        // Find category node (handle slugs)
        const findNode = (cats: Category[], slug: string): Category | null => {
             for (const cat of cats) {
                if (cat.name.toLowerCase() === slug || cat.name.toLowerCase() === slug.replace(/-/g, ' & ')) return cat;
                if (cat.subCategories) {
                    const found = findNode(cat.subCategories, slug);
                    if (found) return found;
                }
             }
             return null;
        };
        const activeNode = activeCategorySlug ? findNode(categories, activeCategorySlug) : null;
        
        // Get all valid sub-category names deeply
        const getNames = (cat: Category): string[] => {
            let names = [cat.name.toLowerCase()];
            if (cat.subCategories) {
                cat.subCategories.forEach(sub => {
                    names = [...names, ...getNames(sub)];
                });
            }
            return names;
        };
        const validNames = activeNode ? getNames(activeNode) : [];

        return products.filter(p => {
            // Filter by Status (Public View)
            if (p.status !== 'published' && p.status !== undefined) return false;

            if (!activeNode) return true; // Shop All
            // Loose matching: check if product category (lowercase) matches any valid name (lowercase)
            return validNames.includes(p.category.toLowerCase());
        });
    }, [category, categories, products]); // Only re-calc if URL, categories or products change

    const activeCategoryNode = useMemo(() => {
        if (!activeCategorySlug) return null;
        const findNode = (cats: Category[], slug: string): Category | null => {
             for (const cat of cats) {
                if (cat.name.toLowerCase() === slug || cat.name.toLowerCase() === slug.replace(/-/g, ' & ')) return cat;
                if (cat.subCategories) {
                    const found = findNode(cat.subCategories, slug);
                    if (found) return found;
                }
             }
             return null;
        };
        return findNode(categories, activeCategorySlug);
    }, [activeCategorySlug, categories]);

    // 2. Derive Sidebar Options
    const availableBrands = Array.from(new Set(baseProducts.map(p => p.brand).filter(Boolean)));
    const sidebarCategories = activeCategoryNode && activeCategoryNode.subCategories && activeCategoryNode.subCategories.length > 0
        ? activeCategoryNode.subCategories 
        : (!activeCategoryNode ? categories : []);

    // Sync URL Category to Filter State (Initial Selection)
    useEffect(() => {
        // Reset local filters when main category context changes
        setSelectedCategories([]);
    }, [category]); 

    // Sync URL Search Param
    useEffect(() => {
        const query = searchParams.get('q');
        if (query) setSearchQuery(query);
    }, [searchParams]);

    // Pagination State
    const [displayLimit, setDisplayLimit] = useState(12);
    const [loadingMore, setLoadingMore] = useState(false);

    // Handlers
    const handleCategoryToggle = (name: string) => {
        setSelectedCategories(prev => 
            prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
        );
    };

    const handleBrandToggle = (name: string) => {
        setSelectedBrands(prev => 
            prev.includes(name) ? prev.filter(b => b !== name) : [...prev, name]
        );
    };

    // Filter Logic (Applied ON TOP of Memoized Base Scope)
    useEffect(() => {
        setIsSearching(true);
        
        const timer = setTimeout(() => {
            let result = [...baseProducts]; 

            // 1. Search Query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                result = result.filter(p => 
                    p.name.toLowerCase().includes(query) || 
                    p.category.toLowerCase().includes(query)
                );
            }

            // 2. Filters
            // 2. Filters
            result = result.filter(p => {
                const priceVal = Number(String(p.price).replace(/[^0-9.-]+/g,""));
                return !isNaN(priceVal) && priceVal >= priceRange.min && priceVal <= priceRange.max;
            });

            if (selectedCategories.length > 0) {
                // Case-insensitive check
                result = result.filter(p => selectedCategories.some(cat => cat.toLowerCase() === p.category.toLowerCase()));
            }

            if (selectedBrands.length > 0) {
                 // Case-insensitive check
                result = result.filter(p => selectedBrands.some(brand => brand.toLowerCase() === p.brand.toLowerCase()));
            }

            if (stockStatus.onSale) result = result.filter(p => p.onSale);
            if (stockStatus.inStock) result = result.filter(p => p.inStock);

            // Sorting
            if (sortOption.value === 'price-asc') result.sort((a, b) => a.price - b.price);
            else if (sortOption.value === 'price-desc') result.sort((a, b) => b.price - a.price);
            else if (sortOption.value === 'rating') result.sort((a, b) => b.rating - a.rating);
            else if (sortOption.value === 'date') result.sort((a, b) => b.id - a.id);

            setFilteredProducts(result);
            setDisplayLimit(12);
            setIsSearching(false);
        }, 800); // Reduced delay for responsiveness
        
        return () => clearTimeout(timer);
    }, [searchQuery, sortOption, priceRange, selectedCategories, selectedBrands, stockStatus, baseProducts]);

    // Infinite Scroll & Filtered brands logic
    const visibleProducts = filteredProducts.slice(0, displayLimit);
    const hasMore = visibleProducts.length < filteredProducts.length;

    useEffect(() => {
        if (!hasMore) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setLoadingMore(true);
                setTimeout(() => {
                    setDisplayLimit(prev => prev + 12);
                    setLoadingMore(false);
                }, 500);
            }
        }, { threshold: 0.1 });
        const sentinel = document.getElementById('scroll-sentinel');
        if (sentinel) observer.observe(sentinel);
        return () => { if (sentinel) observer.unobserve(sentinel); };
    }, [hasMore, visibleProducts.length]);

    // Use availableBrands for the list, not global brands
    // But we need 'Brand' type mapping. 'availableBrands' is string[]. availableBrandObjects?
    const availableBrandObjects = brands.filter(b => availableBrands.includes(b.name));
    
    const filteredSidebarBrands = availableBrandObjects.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()));

    const SidebarContent = () => (
        <div className="space-y-10">
            {/* Price Filter */}
            <PriceRangeSlider 
                min={0} 
                max={1000000} 
                onChange={(min, max) => setPriceRange({ min, max })} 
            />

            {/* Categories - Dynamic Title */}
            <div>
                <h3 className="text-gray-900 font-medium mb-4">
                    {activeCategoryNode ? `${activeCategoryNode.name} Subcategories` : 'All Categories'}
                </h3>
                {sidebarCategories.length > 0 ? (
                    <ul className="space-y-3">
                        {sidebarCategories.map((cat) => (
                            <li key={cat.name} className="flex flex-col">
                                <div 
                                    className="flex items-center justify-between group cursor-pointer" 
                                    onClick={() => handleCategoryToggle(cat.name)}
                                >
                                    <div className={`text-sm ${selectedCategories.includes(cat.name) ? 'text-black font-medium' : 'text-gray-500 group-hover:text-black'}`}>
                                        {cat.name}
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${selectedCategories.includes(cat.name) ? 'border-black text-black' : 'border-gray-200 text-gray-400'}`}>
                                        {/* Dynamic Count: Use context-provided recursive count */}
                                        {cat.count}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                   <p className="text-sm text-gray-400 italic">No further categories</p>
                )}
            </div>

            {/* Brand Filter - Dynamic */}
            <div>
                <h3 className="text-gray-900 font-medium mb-4">Brand</h3>
                <div className="relative mb-4">
                    <input 
                        type="text" 
                        placeholder="Find a Brand" 
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="w-full rounded-full border border-gray-200 pl-4 pr-10 py-2 text-sm focus:border-black focus:ring-black"
                    />
                    <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                {/* Scrollable area only if many items */}
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                    {filteredSidebarBrands.length > 0 ? filteredSidebarBrands.map((brand) => (
                        <div key={brand.name} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id={`brand-${brand.name}`}
                                    type="checkbox"
                                    checked={selectedBrands.includes(brand.name)}
                                    onChange={() => handleBrandToggle(brand.name)}
                                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                />
                                <label htmlFor={`brand-${brand.name}`} className="ml-3 text-sm text-gray-600 flex items-center gap-2">
                                     {brand.image && <img src={brand.image} alt={brand.name} className="h-4 w-4 object-contain" /> } 
                                     {!brand.image && brand.logo && <span className="font-serif italic font-bold text-xs">{brand.name}</span>}
                                     {brand.name}
                                </label>
                            </div>
                            <span className="text-xs text-gray-400 border border-gray-200 px-1.5 rounded-full">
                                {baseProducts.filter(p => p.brand === brand.name).length}
                            </span>
                        </div>
                    )) : (
                        <div className="text-sm text-gray-400">No brands found.</div>
                    )}
                </div>
            </div>

            {/* Stock Status */}
            <div>
                <h3 className="text-gray-900 font-medium mb-4">Filter By Stock status</h3>
                <div className="space-y-3">
                    <div className="flex items-center">
                        <input
                            id="stock-sale"
                            type="checkbox"
                            checked={stockStatus.onSale}
                            onChange={(e) => setStockStatus(prev => ({ ...prev, onSale: e.target.checked }))}
                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <label htmlFor="stock-sale" className="ml-3 text-sm text-gray-600">On sale</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="stock-instock"
                            type="checkbox"
                            checked={stockStatus.inStock}
                            onChange={(e) => setStockStatus(prev => ({ ...prev, inStock: e.target.checked }))}
                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <label htmlFor="stock-instock" className="ml-3 text-sm text-gray-600">In stock</label>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white">
            {/* Mobile Filter Dialog */}
            <Transition.Root show={mobileFiltersOpen} as={Fragment}>
                <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-40 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                                <div className="flex items-center justify-between px-4 mb-6">
                                    <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                                    <button
                                        type="button"
                                        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                                        onClick={() => setMobileFiltersOpen(false)}
                                    >
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                                <div className="px-4">
                                    <SidebarContent />
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            <main className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col border-b border-gray-200 pb-6 pt-12 gap-6">
                     <div className='flex items-center justify-between'> 
                        <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-900 capitalize">
                            {category ? decodeURIComponent(category) : 'Shop All'}
                        </h1>
                         <button
                            type="button"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500 lg:hidden"
                            onClick={() => setMobileFiltersOpen(true)}
                        >
                            <span className="sr-only">Filters</span>
                            <FunnelIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                     </div>

                    {/* Controls Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                        <div className="relative w-full md:max-w-xs">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-full border-gray-300 pl-10 focus:border-black focus:ring-black sm:text-sm py-2.5 bg-gray-50"
                            />
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                            <Menu as="div" className="relative inline-block text-left">
                                <div>
                                    <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                                        Sort By: {sortOption.name}
                                        <ChevronDownIcon className="-mr-1 ml-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </Menu.Button>
                                </div>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="py-1">
                                            {sortOptions.map((option) => (
                                                <Menu.Item key={option.name}>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => setSortOption(option)}
                                                            className={classNames(
                                                                option.name === sortOption.name ? 'font-medium text-gray-900' : 'text-gray-500',
                                                                active ? 'bg-gray-100' : '',
                                                                'block w-full text-left px-4 py-2 text-sm'
                                                            )}
                                                        >
                                                            {option.name}
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            ))}
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                            <div className="hidden lg:flex items-center border-l border-gray-300 pl-4 ml-4">
                                <button type="button" className={`p-2 hover:text-gray-500 ${gridCols === 3 ? 'text-black' : 'text-gray-400'}`} onClick={() => setGridCols(3)}>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm7 0a1 1 0 011-1h4a1 1 0 011 1v12a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z" /></svg>
                                </button>
                                <button type="button" className={`p-2 hover:text-gray-500 ${gridCols === 4 ? 'text-black' : 'text-gray-400'}`} onClick={() => setGridCols(4)}>
                                    <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pb-24 pt-6">
                    <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-4">
                        {/* Desktop Sidebar */}
                        <div className="hidden lg:block">
                            <SidebarContent />
                        </div>

                        {/* Product Grid */}
                        <div className="lg:col-span-3">
                             <div className="mb-4 text-sm text-gray-500 flex justify-between items-center">
                                <span>{filteredProducts.length} RESULTS</span>
                             </div>
                             
                             {isSearching ? (
                                 <SearchingLoader />
                             ) : filteredProducts.length > 0 ? (
                                 <>
                                    <motion.div 
                                        initial="hidden"
                                        animate="show"
                                        variants={{
                                            hidden: { opacity: 0 },
                                            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                                        }}
                                        className={`grid grid-cols-2 gap-x-px gap-y-px bg-gray-200 border border-gray-200 sm:grid-cols-2 ${
                                            gridCols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
                                        } xl:gap-x-px`}
                                    >
                                        {visibleProducts.map((product) => (
                                            <motion.div 
                                                key={product.id}
                                                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                                                className="bg-white p-4"
                                            >
                                                <ProductCard product={product} />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                    
                                    {/* Pagination Sentinel */}
                                    {hasMore && (
                                        <div id="scroll-sentinel" className="py-10 flex justify-center w-full">
                                            {loadingMore ? (
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                                                    Loading more...
                                                </div>
                                            ) : (
                                               <div className="h-10" /> 
                                            )}
                                        </div>
                                    )}
                                 </>
                             ) : (
                                 <div className="text-center py-24 text-gray-500 bg-gray-50 rounded-lg">
                                     <p className="text-lg mb-2">No products found matching your filters.</p>
                                     <button 
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategories([]);
                                            setSelectedBrands([]);
                                            setPriceRange({ min: 0, max: 1000000 });
                                            setStockStatus({ onSale: false, inStock: false });
                                        }}
                                        className="text-black font-medium underline hover:text-gray-700"
                                     >
                                         Clear all filters
                                     </button>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ShopPage;
