export default function AdminOrders() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">Orders</h1>
        <div className="flex justify-end gap-x-3">
             <button type="button" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Export</button>
             <button type="button" className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Create Order</button>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg p-12 text-center">
        <p className="text-gray-500">Order management interface coming soon.</p>
      </div>
    </div>
  );
}
