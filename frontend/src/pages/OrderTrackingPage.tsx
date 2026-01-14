import { CheckIcon, XCircleIcon } from '@heroicons/react/20/solid';
import Lottie from 'lottie-react';
import React, { useState } from 'react';
import deliveryAnimation from '../assets/lottie_animations/deleverying.json';
import homeDeliveryAnimation from '../assets/lottie_animations/home_delevery.json';
import processingAnimation from '../assets/lottie_animations/processing.json';
import { type Order } from '../context/ProductContext';

const steps = [
    { id: 'Pending', name: 'Order Placed', description: 'We have received your order.' },
    { id: 'Processing', name: 'Processing', description: 'Your order is being prepared.' },
    { id: 'Shipped', name: 'Shipped', description: 'Your order has left our facility.' },
    { id: 'Delivered', name: 'Delivered', description: 'Package arrived at your address.' },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

import { useSearchParams } from 'react-router-dom';
import api from '../services/api'; // Import API wrapper

const OrderTrackingPage = () => {
    // Remove direct ProductContext usage for search
    // const { orders } = useProducts(); 
    const [searchParams] = useSearchParams();
    const [orderId, setOrderId] = useState(searchParams.get('id') || '');
    const [phone, setPhone] = useState(searchParams.get('phone') || '');
    const [foundOrder, setFoundOrder] = useState<Order | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchOrder = async (id: string, ph: string) => {
        setIsLoading(true);
        setError('');
        try {
            const res = await api.get('/orders/track/', {
                params: { id, phone: ph }
            });
            setFoundOrder(res.data);
        } catch (err: any) {
            console.error(err);
            setFoundOrder(null);
            setError(err.response?.data?.error || 'Order not found.');
        } finally {
            setIsLoading(false);
            setHasSearched(true);
        }
    };

    // Auto-search if params are present on mount
    React.useEffect(() => {
        const idParam = searchParams.get('id');
        const phoneParam = searchParams.get('phone');
        if (idParam && phoneParam) {
            setOrderId(idParam);
            setPhone(phoneParam);
            fetchOrder(idParam, phoneParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetchOrder(orderId, phone);
    };

    const getStepStatus = (stepId: string, currentStatus: string) => {
        const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        const currentIndex = statusOrder.indexOf(currentStatus);
        const stepIndex = statusOrder.indexOf(stepId);

        if (currentStatus === 'Cancelled') return 'cancelled';
        if (stepIndex < currentIndex) return 'complete';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    return (
        <div className="bg-white min-h-screen pt-12 pb-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Track Your Order
                    </h1>
                    <p className="mt-4 text-gray-500">
                        Enter your order ID and email address to see the current status of your shipment.
                    </p>
                </div>

                {!foundOrder ? (
                    <div className="mt-12 mx-auto max-w-lg bg-gray-50 p-8 rounded-lg shadow-sm border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="order-id" className="block text-sm font-medium text-gray-700">
                                    Order ID
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        id="order-id"
                                        className="block w-full rounded-md border-gray-300 focus:border-black focus:ring-black sm:text-sm py-3 px-4"
                                        placeholder="e.g. 123456"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="tel"
                                        id="phone"
                                        className="block w-full rounded-md border-gray-300 focus:border-black focus:ring-black sm:text-sm py-3 px-4"
                                        placeholder="e.g. +8801..."
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {hasSearched && !foundOrder && (
                                <div className="text-red-600 text-sm text-center">
                                    <div className="text-red-600 text-sm text-center">
                                        {error || "Order not found. Please check your details and try again."}
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full flex justify-center rounded-md border border-transparent bg-black py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors"
                            >
                                Track Order
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="mt-12 mx-auto max-w-4xl">
                        <div className="mb-6 flex justify-end">
                            <button onClick={() => { setFoundOrder(null); setHasSearched(false); setOrderId(''); setEmail(''); }} className="text-sm text-gray-500 underline hover:text-black">
                                Track another order
                            </button>
                        </div>

                        {/* Order Details Header */}
                        <div className="bg-gray-50 px-4 py-5 sm:px-6 rounded-t-lg border border-gray-200 flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <h3 className="text-lg leading-6 font-bold text-gray-900">Order #{foundOrder.id}</h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">Placed on {new Date(foundOrder.date).toLocaleDateString()}</p>
                                {foundOrder.trackingNumber && (
                                    <p className="mt-1 text-sm font-mono text-gray-700">Tracking #: {foundOrder.trackingNumber}</p>
                                )}
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${foundOrder.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                foundOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                {foundOrder.status}
                            </span>
                        </div>

                        {/* Timeline */}
                        <div className="border border-t-0 border-gray-200 rounded-b-lg p-8">
                            {/* Status Animations */}
                            {(foundOrder.status === 'Shipped' || foundOrder.status === 'Processing' || foundOrder.status === 'Delivered') && (
                                <div className="flex justify-center mb-8">
                                    <div className="h-80 w-80">
                                        <Lottie
                                            animationData={
                                                foundOrder.status === 'Delivered' ? homeDeliveryAnimation :
                                                    foundOrder.status === 'Shipped' ? deliveryAnimation :
                                                        processingAnimation
                                            }
                                            loop={true}
                                        />
                                    </div>
                                </div>
                            )}

                            {foundOrder.status === 'Cancelled' ? (
                                <div className="text-center py-8">
                                    <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Order Cancelled</h3>
                                    <p className="mt-1 text-sm text-gray-500">This order has been cancelled.</p>
                                </div>
                            ) : (
                                <nav aria-label="Progress">
                                    <ol role="list" className="overflow-hidden">
                                        {steps.map((step, stepIdx) => {
                                            const status = getStepStatus(step.id, foundOrder.status);

                                            return (
                                                <li key={step.name} className={classNames(stepIdx !== steps.length - 1 ? 'pb-10' : '', 'relative')}>
                                                    {status === 'complete' ? (
                                                        <>
                                                            {stepIdx !== steps.length - 1 ? (
                                                                <div className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-black" aria-hidden="true" />
                                                            ) : null}
                                                            <div className="group relative flex items-start">
                                                                <span className="flex h-9 items-center">
                                                                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black group-hover:bg-gray-800 transition-colors">
                                                                        <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                                                    </span>
                                                                </span>
                                                                <span className="ml-4 flex min-w-0 flex-col">
                                                                    <span className="text-sm font-medium text-black">{step.name}</span>
                                                                    <span className="text-sm text-gray-500">{step.description}</span>
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : status === 'current' ? (
                                                        <>
                                                            {stepIdx !== steps.length - 1 ? (
                                                                <div className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-300" aria-hidden="true" />
                                                            ) : null}
                                                            <div className="group relative flex items-start" aria-current="step">
                                                                <span className="flex h-9 items-center" aria-hidden="true">
                                                                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white">
                                                                        <span className="h-2.5 w-2.5 rounded-full bg-black" />
                                                                    </span>
                                                                </span>
                                                                <span className="ml-4 flex min-w-0 flex-col">
                                                                    <span className="text-sm font-bold text-black">{step.name}</span>
                                                                    <span className="text-sm text-gray-500">{step.description}</span>
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {stepIdx !== steps.length - 1 ? (
                                                                <div className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-300" aria-hidden="true" />
                                                            ) : null}
                                                            <div className="group relative flex items-start">
                                                                <span className="flex h-9 items-center" aria-hidden="true">
                                                                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                                                                        <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                                                                    </span>
                                                                </span>
                                                                <span className="ml-4 flex min-w-0 flex-col">
                                                                    <span className="text-sm font-medium text-gray-500">{step.name}</span>
                                                                    <span className="text-sm text-gray-500">{step.description}</span>
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </nav>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTrackingPage;
