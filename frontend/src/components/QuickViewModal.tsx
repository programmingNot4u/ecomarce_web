import { Dialog, Transition } from '@headlessui/react';
import { HeartIcon, MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { addToCart } from '../store/slices/cartSlice';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    hoverImage?: string;
    category: string;
    description?: string;
}

interface QuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
}

const QuickViewModal = ({ isOpen, onClose, product }: QuickViewModalProps) => {
    const dispatch = useDispatch();
    const { showNotification } = useNotification();
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');

    const handleAddToBag = () => {
        dispatch(addToCart({ ...product, quantity }));
        showNotification(`You added ${product.name} to your shopping bag.`, 'success');
        onClose();
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                                <div className="absolute right-0 top-0 pr-4 pt-4 z-10">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    {/* Image Section */}
                                    <div className="relative aspect-square md:aspect-auto h-full bg-gray-100">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-full w-full object-cover object-center"
                                        />
                                        <div className="absolute top-4 right-4">
                                             <HeartIcon className="h-6 w-6 text-gray-600 hover:text-black cursor-pointer" />
                                        </div>
                                    </div>

                                    {/* Details Section */}
                                    <div className="p-8 md:p-12 flex flex-col justify-center">
                                        <h2 className="text-2xl font-serif font-bold text-gray-900">{product.name}</h2>
                                        <p className="mt-4 text-xl font-medium text-gray-900">Tk {product.price.toFixed(2)}</p>
                                        
                                        <div className="mt-8">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
                                                <h3 className="text-sm font-medium text-gray-900">Size</h3>
                                            </div>
                                            
                                            <div className="mt-2 flex space-x-4">
                                                {/* Quantity Selector */}
                                                <div className="flex items-center border border-gray-300">
                                                    <button 
                                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                        className="p-3 hover:bg-gray-100"
                                                    >
                                                        <MinusIcon className="h-4 w-4" />
                                                    </button>
                                                    <input 
                                                        type="text" 
                                                        value={quantity} 
                                                        readOnly 
                                                        className="w-12 text-center border-none p-0 text-sm focus:ring-0"
                                                    />
                                                     <button 
                                                        onClick={() => setQuantity(quantity + 1)}
                                                        className="p-3 hover:bg-gray-100"
                                                    >
                                                        <PlusIcon className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                {/* Size Selector Mock */}
                                                <select 
                                                    className="block w-full border-gray-300 py-3 pl-3 pr-10 text-base focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                                                    value={selectedSize}
                                                    onChange={(e) => setSelectedSize(e.target.value)}
                                                >
                                                    <option>Choose an Option...</option>
                                                    <option>S</option>
                                                    <option>M</option>
                                                    <option>L</option>
                                                    <option>XL</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mt-8 space-y-3">
                                            <Link 
                                                to={`/products/${product.id}`}
                                                className="flex w-full items-center justify-center border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 uppercase tracking-wider"
                                                onClick={onClose}
                                            >
                                                View Details
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={handleAddToBag}
                                                className="flex w-full items-center justify-center border border-transparent bg-black px-8 py-3 text-base font-medium text-white hover:bg-gray-900 uppercase tracking-wider"
                                            >
                                                Add to Bag
                                            </button>
                                        </div>

                                        <div className="mt-6 text-xs text-center">
                                            <Link to="/find-in-store" className="font-bold text-gray-900 uppercase">Find in Store</Link>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default QuickViewModal;
