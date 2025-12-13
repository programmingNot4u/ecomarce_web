import {
    ArrowTrendingUpIcon,
    CurrencyDollarIcon,
    ShoppingBagIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

const stats = [
  { name: 'Total Revenue', value: '$45,231.89', change: '+20.1%', changeType: 'positive', icon: CurrencyDollarIcon },
  { name: 'Total Orders', value: '2,300', change: '+15.2%', changeType: 'positive', icon: ShoppingBagIcon },
  { name: 'Total Customers', value: '4,500', change: '+5.4%', changeType: 'positive', icon: UserGroupIcon },
  { name: 'Growth Rate', value: '12.5%', change: '-2.3%', changeType: 'negative', icon: ArrowTrendingUpIcon },
];

const recentOrders = [
    { id: '#ORD-7829', customer: 'Alice Smith', date: 'Today, 2:34 PM', total: '$120.00', status: 'Processing' },
    { id: '#ORD-7828', customer: 'Bob Jones', date: 'Today, 1:12 PM', total: '$54.50', status: 'Shipped' },
    { id: '#ORD-7827', customer: 'Charlie Brown', date: 'Yesterday', total: '$320.00', status: 'Delivered' },
    { id: '#ORD-7826', customer: 'Diana Prince', date: 'Yesterday', total: '$85.00', status: 'Cancelled' },
    { id: '#ORD-7825', customer: 'Evan Wright', date: 'Oct 24', total: '$210.25', status: 'Delivered' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard Overview
        </h2>
        <p className="mt-1 text-sm text-gray-500">
            Welcome back, here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-black p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {recentOrders.map((order) => (
                              <tr key={order.id}>
                                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{order.total}</td>
                                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                          ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                                          {order.status}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
               <div className="mt-4 text-right">
                  <a href="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all orders &rarr;</a>
              </div>
          </div>
          
          {/* Quick Actions / Chart Placeholder */}
           <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center text-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 w-full text-left">Sales Overview</h3>
              <div className="h-64 w-full bg-gray-50 rounded-md flex items-center justify-center border-2 border-dashed border-gray-200">
                  <span className="text-gray-400">Chart Visualization Placeholder</span>
              </div>
           </div>
      </div>
    </div>
  );
}
