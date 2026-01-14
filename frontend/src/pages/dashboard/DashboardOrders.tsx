import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceTemplate, type InvoiceData } from '../../components/InvoiceTemplate';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import api, { getMediaUrl } from '../../services/api';

interface Order {
    id: number | string;
    created_at: string;
    status: string;
    total_amount: number;
    items: any[];
    date: string;
    subtotal: number;
    shipping: number;
    fee: number;
    total: number;
    billingAddress: any;
    shippingAddress: any;
    email: string;
}

// Simple Modal Component for Order Details
const OrderDetailsModal = ({ order, onClose }: { order: Order, onClose: () => void }) => {
    if (!order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col pointer-events-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
                        <p className="text-sm text-gray-500">{new Date(order.created_at || order.date).toLocaleDateString()} • {order.status}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <span className="sr-only">Close</span>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Billing Address</h3>
                            {order.billingAddress ? (
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p className="font-semibold text-gray-900">{order.billingAddress.first_name || order.billingAddress.name} {order.billingAddress.last_name}</p>
                                    <p>{order.billingAddress.email}</p>
                                    <p>{order.billingAddress.phone}</p>
                                    <p>{order.billingAddress.street_address || order.billingAddress.street}</p>
                                    <p>{order.billingAddress.city}</p>
                                </div>
                            ) : <p className="text-sm text-gray-500">N/A</p>}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Shipping Address</h3>
                            {order.shippingAddress ? (
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p className="font-semibold text-gray-900">{order.shippingAddress.first_name || order.shippingAddress.name} {order.shippingAddress.last_name}</p>
                                    <p>{order.shippingAddress.phone}</p>
                                    <p>{order.shippingAddress.street_address || order.shippingAddress.street}</p>
                                    <p>{order.shippingAddress.city}</p>
                                </div>
                            ) : <p className="text-sm text-gray-500">N/A</p>}
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Order Items</h3>

                        {/* Desktop Table */}
                        <div className="hidden md:block border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {order.items.map((item: any) => {
                                        // Resolve Product Name
                                        const productName = item.product_details?.name || item.productDetails?.name || item.name || item.product_name || item.productName || "Product";

                                        // Resolve Product Image
                                        let productImage = item.image || item.product_image || item.productImage;
                                        if (!productImage && (item.product_details?.images || item.productDetails?.images)) {
                                            const imgs = item.product_details?.images || item.productDetails?.images;
                                            if (imgs && imgs.length > 0) {
                                                productImage = typeof imgs[0] === 'string' ? imgs[0] : imgs[0].image;
                                            }
                                        }

                                        return (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <img className="h-10 w-10 rounded-md object-cover" src={productImage} alt={productName} />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={productName}>{productName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">Tk {Number(item.price || item.unit_price || item.unitPrice || 0).toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{item.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">Tk {(Number(item.price || item.unit_price || item.unitPrice || 0) * Number(item.quantity || 1)).toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden space-y-4">
                            {order.items.map((item: any) => {
                                const productName = item.product_details?.name || item.productDetails?.name || item.name || item.product_name || item.productName || "Product";

                                let productImage = item.image || item.product_image || item.productImage;
                                if (!productImage && (item.product_details?.images || item.productDetails?.images)) {
                                    const imgs = item.product_details?.images || item.productDetails?.images;
                                    if (imgs && imgs.length > 0) {
                                        productImage = typeof imgs[0] === 'string' ? imgs[0] : imgs[0].image;
                                    }
                                }

                                return (
                                    <div key={item.id} className="flex gap-4 p-3 border border-gray-100 rounded-lg bg-gray-50">
                                        <div className="h-16 w-16 flex-shrink-0">
                                            <img className="h-16 w-16 rounded-md object-cover bg-white" src={productImage} alt={productName} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 line-clamp-2">{productName}</p>
                                            <div className="mt-1 flex items-baseline justify-between">
                                                <p className="text-sm text-gray-500">
                                                    {item.quantity} x Tk {Number(item.price || item.unit_price || item.unitPrice || 0).toLocaleString()}
                                                </p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    Tk {(Number(item.price || item.unit_price || item.unitPrice || 0) * Number(item.quantity || 1)).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end">
                        <div className="w-full sm:w-1/2 lg:w-1/3 bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>Tk {Number(order.subtotal || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping</span>
                                <span>Tk {Number(order.shipping || order.shipping_cost || order.shippingCost || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Fees/VAT</span>
                                <span>Tk {Number(order.fee || 0).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-900">
                                <span>Total</span>
                                <span>Tk {Number(order.total || order.total_amount || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

import { useProducts } from '../../context/ProductContext';

export default function DashboardOrders() {
    const { addToCart } = useCart();
    const { products } = useProducts(); // Get full product list from context
    const { showNotification } = useNotification();
    // const { user } = useAuth(); // Unused here if we trust API response
    const navigate = useNavigate();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
    const [pdfOrder, setPdfOrder] = useState<InvoiceData | null>(null);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    // API State
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders/');
                // Ensure we handle paginated response or list
                const data = response.data.results ? response.data.results : response.data;
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);



    const handleDownloadInvoice = async (order: any) => {
        setGeneratingPdfId(String(order.id));

        // Prepare initial items with standard data
        const initialItems = order.items.map((item: any) => {
            const liveProduct = item.product_details || item.productDetails;
            let productName = liveProduct?.name || item.name || item.product_name || item.productName || "Product";

            let productImage = "";
            if (liveProduct?.images && liveProduct.images.length > 0) {
                const firstImg = liveProduct.images[0];
                productImage = typeof firstImg === 'string' ? firstImg : firstImg.image;
            }
            if (!productImage) productImage = liveProduct?.image;
            if (!productImage) productImage = item.image || item.product_image || item.productImage;

            productImage = getMediaUrl(productImage) || "";

            return {
                id: item.id,
                name: productName,
                sku: String(liveProduct?.sku || item.product || item.id),
                price: Number(item.price || item.unit_price || item.unitPrice || 0),
                quantity: Number(item.quantity || 1),
                image: productImage
            };
        });

        // Fetch Base64 images for external URLs
        const itemsWithBase64 = await Promise.all(initialItems.map(async (item: any) => {
            if (item.image && item.image.startsWith('http')) {
                try {
                    const proxyUrl = `orders/proxy_image/?url=${encodeURIComponent(item.image)}`;
                    const response = await api.get(proxyUrl);
                    if (response.data.image) {
                        return { ...item, image: response.data.image };
                    }
                } catch (err) {
                    console.error("Failed to proxy image", err);
                }
            }
            return item;
        }));

        const invoiceData: InvoiceData = {
            orderId: String(order.id).replace('#', ''),
            date: order.created_at || order.date || order.createdAt,
            items: itemsWithBase64,
            subtotal: Number(order.subtotal || order.total_amount || 0),
            shipping: Number(order.shipping || order.shipping_cost || order.shippingCost || 0),
            fee: Number(order.fee || 0),
            total: Number(order.total || order.total_amount || 0),
            billingAddress: order.billingAddress || order.billing_address || order.shippingAddress || {},
            shippingAddress: order.shippingAddress || order.shipping_address || {}
        };

        setPdfOrder(invoiceData);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for render

            if (!invoiceRef.current) throw new Error('Invoice ref not found');

            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2,
                useCORS: true, // Still good to have
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice-${invoiceData.orderId}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            showNotification('Failed to download invoice. Please try again.', 'error');
        } finally {
            setGeneratingPdfId(null);
            setPdfOrder(null);
        }
    };

    const handleReorder = (order: any) => {
        if (!order.items || order.items.length === 0) return;

        order.items.forEach((item: any) => {
            const { quantity, ...productDetails } = item;

            // Try to find the up-to-date product in our context
            const productId = productDetails.product || productDetails.product_id || productDetails.id;
            const contextProduct = products.find(p => String(p.id) === String(productId));

            // Map backend fields to cart
            const cartItem = {
                // Determine ID: prefer product ID if it exists (so we link to the actual product), otherwise item ID
                id: productId,
                // Prefer partial/context data -> then order snapshot -> then fallback
                name: contextProduct?.name || productDetails.name || productDetails.product_name || productDetails.product_details?.name || "Product",
                image: contextProduct?.images?.[0] || contextProduct?.image || productDetails.image || productDetails.product_image || productDetails.product_details?.image,
                price: Number(contextProduct?.price || productDetails.price || productDetails.unit_price || 0),
                category: contextProduct?.category || productDetails.category || 'Reorder',
                description: contextProduct?.description || productDetails.description || productDetails.name,
                // Ensure variant info is preserved if available
                variant_info: productDetails.variant_info || productDetails.variantInfo,
                color: productDetails.color,
                size: productDetails.size
            };

            addToCart(cartItem, quantity);
        });

        navigate('/cart'); // Send to cart for review
    };

    if (isLoading) {
        return <div className="p-12 text-center text-gray-500">Loading your orders...</div>;
    }

    return (
        <div className="overflow-hidden bg-white">
            <div className="flow-root">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto min-w-full inline-block align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0 uppercase tracking-wider">Order</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Total</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {orders.length > 0 ? orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-gray-900 sm:pl-0">
                                        <a href="#" onClick={(e) => { e.preventDefault(); setViewingOrder(order); }} className="hover:underline hover:text-red-700">#{order.id}</a>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(order.created_at || order.date).toLocaleDateString()}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.status}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <span className="font-semibold text-red-600">Tk {(order.total || order.total_amount).toLocaleString()}</span>
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setViewingOrder(order)}
                                                className="bg-[#b91c1c] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-red-800 transition-colors"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => navigate(`/order-tracking?id=${String(order.id).replace('#', '')}&phone=${order.shippingAddress?.phone || order.billingAddress?.phone || ''}`)}
                                                className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition-colors"
                                            >
                                                Track
                                            </button>
                                            <button
                                                onClick={() => handleDownloadInvoice(order)}
                                                className="bg-[#b91c1c] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={generatingPdfId !== null}
                                            >
                                                {generatingPdfId === String(order.id) ? 'Downloading...' : 'Invoice'}
                                            </button>
                                            <button
                                                onClick={() => handleReorder(order)}
                                                className="bg-[#b91c1c] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-red-800 transition-colors"
                                            >
                                                Order Again
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                        No recent orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {orders.length > 0 ? orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Order ID</span>
                                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">#{order.id}</h3>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                ${order.status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                                        order.status.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            order.status.toLowerCase() === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-t border-b border-gray-50 mb-4">
                                <div className="text-sm">
                                    <span className="text-gray-500 block text-xs mb-0.5">Date</span>
                                    <span className="font-medium text-gray-700">{new Date(order.created_at || order.date).toLocaleDateString()}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-500 block text-xs mb-0.5">Total Amount</span>
                                    <span className="font-bold text-red-600 text-lg">Tk {(order.total || order.total_amount).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setViewingOrder(order)}
                                    className="col-span-1 flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => navigate(`/order-tracking?id=${String(order.id).replace('#', '')}&phone=${order.shippingAddress?.phone || order.billingAddress?.phone || ''}`)}
                                    className="col-span-1 flex justify-center items-center py-2.5 px-4 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                                >
                                    Track Order
                                </button>

                                <button
                                    onClick={() => handleDownloadInvoice(order)}
                                    disabled={generatingPdfId !== null}
                                    className="col-span-1 flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors disabled:opacity-50"
                                >
                                    {generatingPdfId === String(order.id) ? '...' : 'Invoice'}
                                </button>
                                <button
                                    onClick={() => handleReorder(order)}
                                    className="col-span-1 flex justify-center items-center py-2.5 px-4 bg-[#b91c1c] text-white rounded-lg text-sm font-medium hover:bg-red-800 transition-colors shadow-sm"
                                >
                                    Order Again
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p>No recent orders found.</p>
                        </div>
                    )}
                </div>



            </div>

            {/* View Order Modal */}
            {viewingOrder && <OrderDetailsModal order={viewingOrder} onClose={() => setViewingOrder(null)} />}

            {/* Hidden Invoice Template for PDF Generation */}
            {pdfOrder && (
                <div className="fixed left-[-9999px] top-0">
                    <InvoiceTemplate ref={invoiceRef} data={pdfOrder} />
                </div>
            )}
        </div>
    );
}
