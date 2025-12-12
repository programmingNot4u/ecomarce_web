import { ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../mocks/products'; // Using mock products for now

const WishlistPage = () => {
    // In a real app, you'd fetch this from a WishlistContext or Redux store
    // For now, we'll just simulate a wishlist with the first 4 products
    const wishlistItems = products.slice(0, 4);
    const { addToCart } = useCart();

    return (
        <div className="bg-white min-h-screen pt-12 pb-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-900 mb-10">My Wishlist</h1>

                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                        {wishlistItems.map((product) => (
                            <div key={product.id} className="group relative flex flex-col">
                                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80 relative">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                                    />
                                    <button 
                                        className="absolute top-2 right-2 p-2 bg-white rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                                        aria-label="Remove from wishlist"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="mt-4 flex justify-between flex-1">
                                    <div>
                                        <h3 className="text-sm text-gray-700">
                                            <Link to={`/product/${product.id}`}>
                                                <span aria-hidden="true" className="absolute inset-0" />
                                                {product.name}
                                            </Link>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">Tk {product.price.toLocaleString()}</p>
                                </div>
                                <div className="mt-4">
                                     <button
                                        onClick={() => addToCart(product, 1)}
                                        className="w-full flex items-center justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 transition-colors z-10 relative"
                                    >
                                        <ShoppingBagIcon className="h-4 w-4 mr-2" />
                                        Add to Bag
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg mb-6">Your wishlist is currently empty.</p>
                        <Link 
                            to="/shop" 
                            className="inline-block bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
