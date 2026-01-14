import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Link } from 'react-router-dom';
import orderSuccessAnimation from '../assets/lottie_animations/order_Success.lottie';

import { useLocation } from 'react-router-dom';

const OrderSuccessPage = () => {
    const location = useLocation();
    const { orderId, phone } = location.state || {}; // Retrieve passed state

    return (
        <div className="bg-gray-50 min-h-screen pt-20 pb-12 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center animate-fadeIn">
                <div className="flex flex-col items-center">
                    <div className="h-40 w-40">
                        <DotLottieReact
                            src={orderSuccessAnimation}
                            loop={true}
                            autoplay
                        />
                    </div>
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                        Thank you for your order!
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Your order has been successfully placed. We've sent a confirmation email to your inbox.
                    </p>
                </div>

                <div className="py-4 border-t border-b border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Order Number</p>
                    <p className="text-xl font-bold text-gray-900">#{orderId || 'Unknown'}</p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        to={`/order-tracking?id=${orderId}&phone=${phone || ''}`}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
                    >
                        Track Order
                    </Link>
                    <Link
                        to="/shop"
                        className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
