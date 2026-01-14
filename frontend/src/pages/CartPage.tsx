import { ArrowRightIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CartItem from '../components/cart/CartItem';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const { cart, total } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-md mx-auto"
                >
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBagIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-3xl font-serif font-medium mb-3 text-gray-900">Your Bag is Empty</h2>
                    <p className="text-gray-500 mb-8 font-light">Looks like you haven't made your choice yet.</p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-sm font-bold uppercase tracking-widest text-white bg-black hover:bg-zinc-800 transition-all duration-300"
                    >
                        Start Shopping
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-10 border-b border-gray-100 pb-6">
                    <h1 className="text-4xl font-serif font-medium text-gray-900 tracking-tight">Shopping Bag</h1>
                    <span className="text-gray-500 font-light">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                    <div className="lg:col-span-8">
                        <ul className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {cart.map((product) => (
                                    <CartItem key={product.id} item={product} />
                                ))}
                            </AnimatePresence>
                        </ul>
                    </div>

                    {/* Order Summary */}
                    <section className="lg:col-span-4 mt-16 lg:mt-0">
                        <div className="bg-gray-50 px-6 py-8 sm:p-8 lg:p-10 sticky top-24 rounded-sm">
                            <h2 className="text-lg font-medium text-gray-900 uppercase tracking-widest mb-6">Order Summary</h2>

                            <dl className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">Subtotal</dt>
                                    <dd className="text-sm font-medium text-gray-900">৳ {total.toLocaleString()}</dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                    <dt className="text-base font-bold text-gray-900">Order Total</dt>
                                    <dd className="text-xl font-serif font-bold text-gray-900">৳ {total.toLocaleString()}</dd>
                                </div>
                                <p className="text-xs text-gray-500 pt-2">Shipping costs and taxes calculated at checkout.</p>
                            </dl>

                            <div className="mt-8">
                                <Link
                                    to="/checkout"
                                    className="w-full flex items-center justify-center bg-black px-6 py-4 text-sm font-bold text-white shadow-sm hover:bg-zinc-800 transition-colors uppercase tracking-widest group"
                                >
                                    Proceed to Checkout
                                    <ArrowRightIcon className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <div className="mt-6 flex justify-center">
                                    <Link to="/shop" className="text-xs font-medium text-gray-500 hover:text-black uppercase tracking-wider underline underline-offset-4 transition-colors">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
