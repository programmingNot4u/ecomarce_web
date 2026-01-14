import { forwardRef } from 'react';
import fullLogo from '../assets/logos/full_logo.png';

export interface InvoiceData {
  orderId: string;
  date: string;
  items: Array<{
    id: number;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  shipping: number;
  fee: number;
  total: number;
  billingAddress: {
    name: string;
    street: string;
    city: string;
    phone: string;
    email: string;
  };
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    phone: string;
  };
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, { data: InvoiceData }>(({ data }, ref) => {
  return (
    <div ref={ref} className="bg-white p-10 max-w-[800px] mx-auto text-sm text-gray-800" style={{ width: '800px', minHeight: '1100px' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
        </div>
        <div className="text-right text-gray-600 text-xs">
          <img src={fullLogo} alt="MARYONÉ.shop" className="h-12 object-contain ml-auto" />
        </div>
      </div>

      {/* Bill To / Ship To / Invoice Info */}
      <div className="grid grid-cols-3 gap-8 mb-12">
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Bill to</h3>
          <div className="text-gray-600 space-y-1 text-xs">
            <p className="font-bold">{data.billingAddress.name}</p>
            <p>{data.billingAddress.street}</p>
            <p>{data.billingAddress.city}</p>
            <p>{data.billingAddress.email}</p>
            <p>{data.billingAddress.phone}</p>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Ship to</h3>
          <div className="text-gray-600 space-y-1 text-xs">
            <p className="font-bold">{data.shippingAddress.name}</p>
            <p>{data.shippingAddress.street}</p>
            <p>{data.shippingAddress.city}</p>
            <p>{data.shippingAddress.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="mb-2">
            <span className="font-bold text-xl text-gray-900 block">Invoice no: {data.orderId.replace('#', '')}</span>
          </div>
          <p className="mb-1"><span className="font-bold">Order date:</span> {new Date(data.date).toLocaleDateString()}</p>
          <p><span className="font-bold">Payment method:</span> Cash on delivery</p>
        </div>
      </div>

      {/* Table */}
      <div className="mb-8">
        <table className="w-full text-left">
          <thead className="border-b-2 border-gray-100">
            <tr>
              <th className="py-2 font-bold text-gray-600 text-xs w-12">S.No</th>
              <th className="py-2 font-bold text-gray-600 text-xs w-16">Image</th>
              <th className="py-2 font-bold text-gray-600 text-xs w-24">SKU</th>
              <th className="py-2 font-bold text-gray-600 text-xs">Product</th>
              <th className="py-2 font-bold text-gray-600 text-xs text-center w-20">Quantity</th>
              <th className="py-2 font-bold text-gray-600 text-xs text-right w-24">Unit price</th>
              <th className="py-2 font-bold text-gray-600 text-xs text-right w-24">Total price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.items.map((item, index) => (
              <tr key={item.id}>
                <td className="py-4 text-gray-500">{index + 1}</td>
                <td className="py-4">
                  <img src={item.image} alt="" className="w-8 h-8 object-cover rounded bg-gray-100" crossOrigin="anonymous" />
                </td>
                <td className="py-4 text-gray-500">{item.sku}</td>
                <td className="py-4 text-blue-600 font-medium max-w-[200px]">{item.name}</td>
                <td className="py-4 text-center text-gray-500">{item.quantity}</td>
                <td className="py-4 text-right text-gray-500">{item.price}৳</td>
                <td className="py-4 text-right text-gray-900 font-medium">{(item.price * item.quantity)}৳</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Totals */}
      <div className="flex justify-end border-t border-gray-100 pt-8">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-gray-600 text-xs">
            <span>Subtotal</span>
            <span>{data.subtotal.toLocaleString()}৳</span>
          </div>
          <div className="flex justify-between text-gray-600 text-xs">
            <span>Shipping</span>
            <span>{data.shipping}৳ via Flat rate</span>
          </div>
          <div className="flex justify-between text-gray-600 text-xs">
            <span>Fee</span>
            <span>{data.fee}৳ via COD Charge</span>
          </div>
          <div className="flex justify-between text-gray-900 font-bold text-lg border-t border-gray-100 pt-3 mt-3">
            <span>Total</span>
            <span>{data.total.toLocaleString()}৳</span>
          </div>
        </div>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';
