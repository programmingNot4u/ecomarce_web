import { CheckIcon } from '@heroicons/react/20/solid';
import React, { useState } from 'react';

const steps = [
  { name: 'Order Placed', description: 'We have received your order.', status: 'complete' },
  { name: 'Processing', description: 'Your order is being prepared.', status: 'current' },
  { name: 'Shipped', description: 'Your order has left our facility.', status: 'upcoming' },
  { name: 'Delivered', description: 'Package arrived at your address.', status: 'upcoming' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const OrderTrackingPage = () => {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [isTracking, setIsTracking] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        if(orderId && email) {
            setIsTracking(true);
        }
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

                {!isTracking ? (
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
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Billing Email
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="email"
                                        id="email"
                                        className="block w-full rounded-md border-gray-300 focus:border-black focus:ring-black sm:text-sm py-3 px-4"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

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
                        {/* Order Details Header */}
                         <div className="bg-gray-50 px-4 py-5 sm:px-6 rounded-t-lg border border-gray-200 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Order #{orderId || '123456'}</h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">Placed on January 22, 2024</p>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                Processing
                            </span>
                        </div>
                        
                        {/* Timeline */}
                        <div className="border border-t-0 border-gray-200 rounded-b-lg p-8">
                             <nav aria-label="Progress">
                                <ol role="list" className="overflow-hidden">
                                    {steps.map((step, stepIdx) => (
                                    <li key={step.name} className={classNames(stepIdx !== steps.length - 1 ? 'pb-10' : '', 'relative')}>
                                        {step.status === 'complete' ? (
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
                                        ) : step.status === 'current' ? (
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
                                                <span className="text-sm font-medium text-black">{step.name}</span>
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
                                    ))}
                                </ol>
                            </nav>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTrackingPage;
