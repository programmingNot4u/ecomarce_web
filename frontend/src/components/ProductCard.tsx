import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Product } from '../mocks/products';



const ProductCard = ({ product }: { product: Product }) => {
    const { addToCart } = useCart();
    // Placeholder for wishlist state - local only for now as per plan
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsAdding(true);
        addToCart(product);
        setTimeout(() => setIsAdding(false), 1000);
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsWishlisted(!isWishlisted);
    };

    return (
        <motion.div 
            className="group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="relative w-full overflow-hidden bg-gray-100 aspect-[3/4]">
                <Link to={`/products/${product.id}`}>
                    <div className="relative h-full w-full">
                         {/* Default Image */}
                        <motion.img
                            src={product.image}
                            alt={product.name}
                            className="absolute inset-0 h-full w-full object-cover object-center"
                            animate={{ opacity: isHovered && product.hoverImage ? 0 : 1 }}
                            transition={{ duration: 0.3 }}
                        />
                        {/* Hover Image */}
                        {product.hoverImage && (
                            <motion.img
                                src={product.hoverImage}
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

                {/* Quick Add Overlay on Hover */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        animate={{ 
                            backgroundColor: isAdding ? '#16a34a' : '#000000', // green-600 vs black
                        }}
                        className="w-full py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-lg text-white flex items-center justify-center overflow-hidden relative"
                    >
                        <AnimatePresence mode="wait">
                            {isAdding ? (
                                <motion.div
                                    key="added"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    Added
                                </motion.div>
                            ) : (
                                <motion.span
                                    key="add"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Add to Bag
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>
            <div className="mt-4 flex flex-col">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    <Link to={`/products/${product.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                    </Link>
                </h3>
                <p className="mt-1 text-sm text-gray-500 font-medium">Tk {product.price.toFixed(2)}</p>
            </div>
        </motion.div>
    );
};

export default ProductCard;
