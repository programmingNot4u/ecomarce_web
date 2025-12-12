import { ArrowRightIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, total } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 bg-white">
                <div className="text-center">
                    <h2 className="text-3xl font-serif mb-4 text-gray-900">Your Bag is Empty</h2>
                    <p className="text-gray-500 mb-8">Looks like you haven't made your choice yet.</p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-sm font-bold uppercase tracking-wider text-white bg-black hover:bg-gray-800 transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-10 text-center uppercase tracking-wider">Shopping Bag</h1>

                <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
                    <section className="lg:col-span-8">
                        <ul role="list" className="border-t border-b border-gray-200 divide-y divide-gray-200">
                            {cart.map((product) => (
                                <motion.li 
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    key={product.id} 
                                    className="flex py-6 sm:py-10"
                                >
                                    <div className="flex-shrink-0">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-24 w-24 rounded-none object-cover object-center sm:h-32 sm:w-32 bg-gray-100"
                                        />
                                    </div>

                                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                            <div>
                                                <div className="flex justify-between">
                                                    <h3 className="text-lg font-medium text-gray-900 uppercase">
                                                        <Link to={`/products/${product.id}`}>{product.name}</Link>
                                                    </h3>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                                                <p className="mt-2 text-sm font-bold text-gray-900">Tk {product.price.toFixed(2)}</p>
                                            </div>

                                            <div className="mt-4 sm:mt-0 sm:pr-9">
                                                <div className="flex items-center border border-gray-300 w-fit">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(product.id, Math.max(1, product.quantity - 1))}
                                                        className="p-2 hover:bg-gray-100"
                                                    >
                                                        <MinusIcon className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm">{product.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                                        className="p-2 hover:bg-gray-100"
                                                    >
                                                        <PlusIcon className="h-3 w-3" />
                                                    </button>
                                                </div>

                                                <div className="absolute right-0 top-0">
                                                    <button
                                                        type="button"
                                                        className="-m-2 inline-flex p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        onClick={() => removeFromCart(product.id)}
                                                    >
                                                        <span className="sr-only">Remove</span>
                                                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    </section>

                    {/* Order Summary */}
                    <section className="mt-16 bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-4 lg:mt-0 lg:p-8">
                        <h2 className="text-lg font-medium text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-4">Order Summary</h2>

                        <dl className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-600">Subtotal</dt>
                                <dd className="text-sm font-medium text-gray-900">Tk {total.toFixed(2)}</dd>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                <dt className="text-base font-bold text-gray-900">Order Total</dt>
                                <dd className="text-base font-bold text-gray-900">Tk {total.toFixed(2)}</dd>
                            </div>
                            <p className="text-xs text-gray-400">Shipping and taxes calculated at checkout.</p>
                        </dl>

                        <div className="mt-6">
                            <Link
                                to="/checkout"
                                className="w-full flex items-center justify-center rounded-none bg-black px-4 py-4 text-base font-bold text-white shadow-sm hover:bg-gray-800 transition-colors uppercase tracking-widest"
                            >
                                Input Shipping Details
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
