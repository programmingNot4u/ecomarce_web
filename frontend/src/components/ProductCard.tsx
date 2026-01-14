import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Product } from '../mocks/products';
import { getMediaUrl } from '../services/api';



import { useProducts } from '../context/ProductContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }: { product: Product }) => {
    const { addToCart } = useCart();
    const { campaigns } = useProducts();

    // Check for active campaigns
    const activeFlashSale = campaigns.find(c => c.type === 'flash_sale' && c.status === 'active' && c.campaign_products?.some(cp => cp.product === product.id));
    const activeBundle = campaigns.find(c => c.type === 'bundle' && c.status === 'active' && c.campaign_products?.some(cp => cp.product === product.id));

    const { isInWishlist, addToWishlist, removeFromWishlistByProductId } = useWishlist();
    const isWishlisted = isInWishlist(product.id);
    const [isHovered, setIsHovered] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const navigate = useNavigate();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();

        // If product has variants, redirect to PDP to choose options
        if (product.variants && product.variants.length > 0) {
            navigate(`/products/${product.id}`);
            return;
        }

        setIsAdding(true);
        addToCart(product);
        setTimeout(() => setIsAdding(false), 1000);
    };

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Stop navigation
        if (isWishlisted) {
            await removeFromWishlistByProductId(product.id);
        } else {
            await addToWishlist(product);
        }
    };

    // Theme
    const { theme } = useTheme();
    const style = theme.cardStyle || 'minimal';

    // Hover Animation Variant from Global
    const variants = {
        minimal: {},
        modern: { y: isHovered ? -5 : 0 },
        glass: {},
        border: {}
    };

    // Style Specific Classes
    const containerClasses = {
        minimal: "group relative h-full flex flex-col",
        modern: "group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100",
        glass: "group relative bg-white/60 backdrop-blur-xl border border-white/60 shadow-lg rounded-2xl overflow-hidden hover:bg-white/80 transition-all h-full flex flex-col ring-1 ring-black/5",
        border: "group relative border-2 border-gray-200 p-3 rounded-lg hover:border-black transition-colors h-full flex flex-col"
    };

    const imageContainerClasses = {
        minimal: "relative w-full overflow-hidden bg-gray-100 aspect-[3/4]",
        modern: "relative w-full overflow-hidden bg-gray-100 aspect-[4/5]",
        glass: "relative w-full overflow-hidden rounded-xl bg-gray-100/50 aspect-[3/4] mb-3",
        border: "relative w-full overflow-hidden bg-gray-100 aspect-[3/4] rounded-md"
    };

    return (
        <motion.div
            className={containerClasses[style]}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, ...variants[style] }}
        >
            <div className={imageContainerClasses[style]}>
                <Link to={`/products/${product.id}`}>
                    <div className="relative h-full w-full">
                        {/* Default Image */}
                        <motion.img
                            src={getMediaUrl(product.image)}
                            alt={product.name}
                            className="absolute inset-0 h-full w-full object-cover object-center"
                            animate={{ opacity: isHovered && product.hoverImage ? 0 : 1 }}
                            transition={{ duration: 0.3 }}
                        />
                        {/* Hover Image */}
                        {product.hoverImage && (
                            <motion.img
                                src={getMediaUrl(product.hoverImage)}
                                alt={product.name}
                                className="absolute inset-0 h-full w-full object-cover object-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isHovered ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </div>
                </Link>

                <button
                    onClick={handleToggleWishlist}
                    className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10"
                >
                    {isWishlisted ? (
                        <HeartIconSolid className="h-5 w-5 text-red-500" />
                    ) : (
                        <HeartIcon className="h-5 w-5 text-gray-900" />
                    )}
                </button>

                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10 pointer-events-none">
                    {activeFlashSale && (
                        <div className="bg-white/90 backdrop-blur-sm px-2 py-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-black">Flash</span>
                        </div>
                    )}
                    {activeBundle && !activeFlashSale && (
                        <div className="bg-black/90 backdrop-blur-sm px-2 py-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-white">Bundle</span>
                        </div>
                    )}
                    {product.salePrice && product.salePrice < product.price && !activeFlashSale && (
                        <div className="bg-red-600 px-2 py-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-white">Sale</span>
                        </div>
                    )}
                </div>

                {/* Quick Add Overlay */}
                <div className={`hidden lg:block absolute inset-x-0 bottom-0 p-4 transition-transform duration-300 z-10 
                    ${style === 'minimal'
                        ? 'translate-y-full lg:group-hover:translate-y-0'
                        : (isHovered ? 'translate-y-0' : 'translate-y-full')}
                `}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        animate={{
                            backgroundColor: isAdding ? theme.colors.accent : theme.colors.primary, // Use theme colors
                            color: theme.colors.background === '#ffffff' ? '#ffffff' : '#000000' // Simple contrast check
                        }}
                        className="w-full py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-lg text-white flex items-center justify-center overflow-hidden relative rounded-none"
                    >
                        <AnimatePresence mode="wait">
                            {isAdding ? (
                                <motion.div key="added" initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-2">
                                    Added
                                </motion.div>
                            ) : (
                                <motion.span key="add" initial={{ y: 20 }} animate={{ y: 0 }}>
                                    {product.variants && product.variants.length > 0 ? 'Choose Options' : 'Add to Bag'}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>

            {/* Product Info */}
            <div
                style={{ fontFamily: 'var(--font-card)' }}
                className={`
                flex-1 flex flex-col
                ${style === 'minimal' ? 'mt-4' : ''}
                ${style === 'modern' ? 'p-4 pt-5' : ''}
                ${style === 'glass' ? 'p-4 pt-5' : ''}
                ${style === 'border' ? 'mt-3 p-1' : ''}
            `}>
                <div>
                    <h3 className={`font-bold text-gray-900 uppercase tracking-wide
                        ${style === 'minimal' ? 'text-xs sm:text-sm' : 'text-sm sm:text-base mb-1'}
                    `} style={{ fontFamily: 'inherit' }}>
                        <Link to={`/products/${product.id}`}>
                            <span aria-hidden="true" className="absolute inset-0" />
                            {product.name}
                        </Link>
                    </h3>

                    {/* Brand or Category (Optional - showing for non-minimal) */}
                    {style !== 'minimal' && (
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-2">{product.category}</p>
                    )}

                    <div className="mt-1 flex items-baseline gap-2">
                        {product.salePrice && product.salePrice < product.price ? (
                            <>
                                <span className="text-xs sm:text-sm font-medium text-red-600">Tk {product.salePrice.toLocaleString()}</span>
                                <span className="text-[10px] sm:text-xs text-gray-400 line-through">Tk {product.price.toLocaleString()}</span>
                            </>
                        ) : (
                            <span className="text-xs sm:text-sm font-medium text-gray-900">Tk {product.price.toLocaleString()}</span>
                        )}
                    </div>
                </div>

                {/* Mobile Add to Cart Button */}
                <div className="mt-3 lg:hidden relative z-10 mt-auto">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        animate={{
                            backgroundColor: isAdding ? theme.colors.accent : theme.colors.primary,
                            color: theme.colors.background === '#ffffff' ? '#ffffff' : '#000000'
                        }}
                        className="w-full py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors shadow-sm text-white flex items-center justify-center rounded-md"
                    >
                        <AnimatePresence mode="wait">
                            {isAdding ? (
                                <motion.div key="added" initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-2">
                                    Added
                                </motion.div>
                            ) : (
                                <motion.span key="add" initial={{ y: 20 }} animate={{ y: 0 }}>
                                    {product.variants && product.variants.length > 0 ? 'Choose Options' : 'Add to Bag'}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
