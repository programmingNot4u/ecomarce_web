import { CheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';

export default function BundleWidget({ productId }: { productId: number }) {
    const { campaigns, products } = useProducts();
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const bundle = campaigns.find(c =>
        c.type === 'bundle' &&
        c.status === 'active' &&
        c.campaign_products?.some(cp => cp.product === productId)
    );

    if (!bundle || !bundle.campaign_products || bundle.campaign_products.length < 2) return null;

    const bundleProducts = bundle.campaign_products
        .map(cp => products.find(p => p.id === cp.product))
        .filter(p => p !== undefined) as any[];

    if (bundleProducts.length < 2) return null;

    const totalPrice = bundleProducts.reduce((sum, p) => sum + p.price, 0);
    const bundlePrice = totalPrice - bundle.discountValue;

    const handleAddBundle = () => {
        setIsAdded(true);

        // Add each product individually (Frequently Bought Together behavior)
        bundleProducts.forEach(product => {
            addToCart(product);
        });

        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <section className="mt-8 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded-sm mb-1 inline-block">
                        Bundle & Save
                    </span>
                    <h3 className="text-base font-bold text-gray-900">Frequently Bought Together</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Get this look and save <span className="text-green-600 font-bold">Tk {bundle.discountValue.toLocaleString()}</span></p>
                </div>

                <div className="text-right hidden sm:block">
                    <div className="flex items-baseline gap-2 justify-end">
                        <span className="text-lg font-bold text-gray-900">Tk {bundlePrice.toLocaleString()}</span>
                        <span className="text-xs text-gray-400 line-through">Tk {totalPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-4">
                {/* Visual Chain */}
                <div className="flex items-center gap-2 flex-1 w-full justify-center sm:justify-start overflow-x-auto pb-2 sm:pb-0">
                    {bundleProducts.map((p, idx) => (
                        <div key={p.id} className="flex items-center gap-2 shrink-0">
                            <div className="group relative w-16 h-20 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            </div>

                            {idx < bundleProducts.length - 1 && (
                                <div className="flex-shrink-0 text-gray-300">
                                    <PlusIcon className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Mobile Price & Action */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 border-gray-100 pt-4 lg:pt-0">
                    <div className="sm:hidden flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">Tk {bundlePrice.toLocaleString()}</span>
                        <span className="text-xs text-gray-400 line-through">Tk {totalPrice.toLocaleString()}</span>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddBundle}
                        className="w-full lg:w-56 bg-primary text-white px-4 py-3 rounded-md font-bold text-xs uppercase tracking-wide hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                    >
                        <AnimatePresence mode="wait">
                            {isAdded ? (
                                <motion.div
                                    key="added"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2"
                                >
                                    <CheckIcon className="w-4 h-4" />
                                    Added to Cart
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="add"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2"
                                >
                                    Add Bundle to Cart
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>

            {/* List Details */}
            <div className="mt-3 space-y-1">
                {bundleProducts.map(p => (
                    <div key={p.id} className="flex items-center gap-2 text-[10px] text-gray-500">
                        <CheckIcon className="w-3 h-3 text-green-500" />
                        <span><span className="font-semibold text-gray-700">{p.name}</span> - Tk {p.price.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
