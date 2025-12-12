import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceTemplate, type InvoiceData } from '../../components/InvoiceTemplate';
import { useCart } from '../../context/CartContext';

// Simple Modal Component for Order Details
const OrderDetailsModal = ({ order, onClose }: { order: any, onClose: () => void }) => {
    if (!order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col pointer-events-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Order {order.id}</h2>
                        <p className="text-sm text-gray-500">{order.date} • {order.status}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <span className="sr-only">Close</span>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Billing Address</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p className="font-semibold text-gray-900">{order.billingAddress.name}</p>
                                <p>{order.billingAddress.email}</p>
                                <p>{order.billingAddress.phone}</p>
                                <p>{order.billingAddress.street}</p>
                                <p>{order.billingAddress.city}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Shipping Address</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.phone}</p>
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Order Items</h3>
                        <div className="border rounded-lg overflow-hidden">
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
                                    {order.items.map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <img className="h-10 w-10 rounded-md object-cover" src={item.image} alt={item.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={item.name}>{item.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">Tk {item.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{item.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">Tk {item.price * item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end">
                        <div className="w-full sm:w-1/2 lg:w-1/3 bg-gray-50 p-4 rounded-lg space-y-2">
                             <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>Tk {order.subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping</span>
                                <span>Tk {order.shipping}</span>
                            </div>
                             <div className="flex justify-between text-sm text-gray-600">
                                <span>Fees/VAT</span>
                                <span>Tk {(order.fee || (order.total - order.subtotal - order.shipping)).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-900">
                                <span>Total</span>
                                <span>Tk {order.total?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function DashboardOrders() {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [pdfOrder, setPdfOrder] = useState<InvoiceData | null>(null);
    const [viewingOrder, setViewingOrder] = useState<any | null>(null);

    useEffect(() => {
        const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        setOrders(storedOrders);
    }, []);

    const handleDownloadInvoice = async (order: any) => {
        setGeneratingPdfId(order.id);
        
        // Prepare invoice data
        const invoiceData: InvoiceData = {
            orderId: order.id.replace('#', ''),
            date: order.date,
            items: order.items.map((item: any) => ({
                id: item.id,
                name: item.name,
                sku: item.id.toString(), // Assuming SKU is ID for now
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            subtotal: order.subtotal,
            shipping: order.shipping,
            fee: order.fee || 0,
            total: order.total,
            billingAddress: order.billingAddress,
            shippingAddress: order.shippingAddress
        };

        setPdfOrder(invoiceData);
        
        try {
            // Wait for render
            await new Promise(resolve => setTimeout(resolve, 500));

            if (!invoiceRef.current) throw new Error('Invoice ref not found');

            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2,
                useCORS: true,
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
            alert('Failed to download invoice. Please try again.');
        } finally {
            setGeneratingPdfId(null);
            setPdfOrder(null);
        }
    };

    const handleReorder = (order: any) => {
        // Add all items from the order to cart
        if (!order.items || order.items.length === 0) return;

        order.items.forEach((item: any) => {
            // Strip quantity from the product definition passed to addToCart
            // because items in order have 'quantity', but addToCart second arg controls it.
            // Also ensure we pass all known fields.
            const { quantity, ...productDetails } = item;
            
            addToCart({
                ...productDetails,
                // Ensure required fields for Product interface if missing
                category: productDetails.category || 'Reorder',
                description: productDetails.description || productDetails.name,
            }, quantity);
        });
        
        // Redirect to bucket/cart or checkout? User flow standard is Cart usually to review, but previously logic was checkout.
        // Let's go to Cart this time to let user verify "accuracy".
        // Actually code said navigate('/checkout'), I'll stick to it unless user specifically asked to change flow.
        navigate('/checkout');
    };
  
    return (
      <div className="overflow-hidden bg-white">
        <div className="flow-root">
            {/* Desktop Table View */}
            <div className="overflow-x-auto min-w-full inline-block align-middle">
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
                             <a href="#" onClick={(e) => { e.preventDefault(); setViewingOrder(order); }} className="hover:underline hover:text-red-700">{order.id}</a>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.date}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.status}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                             <span className="font-semibold text-red-600">Tk {order.total.toLocaleString()}</span> for {order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} items
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
                                    onClick={() => handleDownloadInvoice(order)}
                                    className="bg-[#b91c1c] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={generatingPdfId !== null}
                                >
                                    {generatingPdfId === order.id ? 'Downloading...' : 'Download Invoice'}
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
