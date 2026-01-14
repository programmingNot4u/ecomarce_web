import { ChevronDownIcon, ChevronUpIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart, type CartItem as CartItemType } from '../../context/CartContext';
import { getMediaUrl } from '../../services/api';

interface CartItemProps {
    item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeFromCart } = useCart();
    const [isExpanded, setIsExpanded] = useState(false);
    const isBundle = item.type === 'bundle';

    return (
        <motion.li
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 mb-4 list-none"
        >
            <div className="flex gap-4">
                {/* Image */}
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-100">
                    <img
                        src={getMediaUrl(item.image)}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium text-gray-900 leading-snug pr-8 line-clamp-2">
                                {isBundle ? (
                                    <span>{item.name}</span>
                                ) : (
                                    <Link to={`/products/${item.id}`} className="hover:text-primary transition-colors">
                                        {item.name}
                                    </Link>
                                )}
                            </h3>
                            <button
                                onClick={() => removeFromCart(item.id, item.variantId)}
                                className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors absolute top-4 right-4"
                                aria-label="Remove item"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Price / Category */}
                        <div className="mt-1">
                            {item.originalPrice ? (
                                <div className="flex items-baseline gap-2">
                                    <p className="text-sm font-bold text-gray-900">৳ {item.price.toLocaleString()}</p>
                                    <p className="text-xs text-gray-400 line-through">৳ {item.originalPrice.toLocaleString()}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">৳ {item.price.toLocaleString()}</p>
                            )}

                            {item.variantInfo && (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {Object.entries(item.variantInfo).map(([key, value]) => (
                                        <span key={key} className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                            {key}: {value as string}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {isBundle && (
                            <div className="mt-2">
                                <span className="inline-flex items-center rounded-full bg-pink-500 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide shadow-sm">
                                    Combo
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Quantity Selector - Positioned bottom right of content area in mobile/desktop */}
                    <div className="flex justify-end mt-2 md:mt-0">
                        <div className="flex items-center bg-gray-100 rounded-md">
                            <button
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.variantId)}
                                className="p-2 text-gray-600 hover:text-black hover:bg-gray-200 rounded-l-md transition-colors"
                            >
                                <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                                className="p-2 text-gray-600 hover:text-black hover:bg-gray-200 rounded-r-md transition-colors"
                            >
                                <PlusIcon className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Divider, Bundles, Total */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
                {isBundle && item.bundleItems && (
                    <div className="w-full">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center text-xs font-medium text-pink-500 hover:text-pink-700 transition-colors"
                        >
                            {isExpanded ? (
                                <><ChevronUpIcon className="w-3 h-3 mr-1" /> Hide Items</>
                            ) : (
                                <><ChevronDownIcon className="w-3 h-3 mr-1" /> Show Items</>
                            )}
                        </button>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <ul className="mt-2 space-y-1 pl-2 border-l-2 border-gray-100 text-xs text-gray-600">
                                        {item.bundleItems.map((sub, idx) => (
                                            <li key={idx} className="line-clamp-1">{sub.name}</li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Total Price */}
                <div className="flex justify-end items-center w-full">
                    <p className="text-base font-bold text-gray-900">৳ {(item.price * item.quantity).toLocaleString()}.00</p>
                </div>
            </div>

            {/* Stock Warning (Optional placeholder based on ref image "Only x items left") */}
            {/* <div className="mt-2 flex items-center gap-2 text-xs text-orange-600 font-medium pb-2">
                <FireIcon className="w-4 h-4" />
                Only 6 items left in stock
            </div> */}
        </motion.li>
    );
}
