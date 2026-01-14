import {
    ArrowRightIcon,
    ArrowTrendingDownIcon,
    ArrowTrendingUpIcon,
    BanknotesIcon,
    CurrencyDollarIcon,
    ShoppingBagIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';

export default function AdminDashboard() {
    const { orders } = useProducts();
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

    // --- Analytics Logic (Moved from Reports) ---
    const filteredOrders = useMemo(() => {
        const now = new Date();
        const past = new Date();
        if (dateRange === '7d') past.setDate(now.getDate() - 7);
        if (dateRange === '30d') past.setDate(now.getDate() - 30);
        if (dateRange === '90d') past.setDate(now.getDate() - 90);

        return orders.filter(o => new Date(o.date) >= past);
    }, [orders, dateRange]);

    const stats = useMemo(() => {
        const totalRevenue = filteredOrders.reduce((sum, o) => (o.paymentStatus === 'Paid' || o.status === 'Delivered' ? sum + o.total : sum), 0);
        const totalOrders = filteredOrders.length;
        const uniqueCustomers = new Set(filteredOrders.map(o => o.email)).size;
        // Mocking growth for demo
        const revenueGrowth = totalRevenue > 0 ? "+12.5%" : "0%";

        return [
            { name: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, change: revenueGrowth, changeType: 'positive', icon: CurrencyDollarIcon },
            { name: 'Total Orders', value: totalOrders.toString(), change: '+5%', changeType: 'positive', icon: ShoppingBagIcon },
            { name: 'Active Customers', value: uniqueCustomers.toString(), change: '+2%', changeType: 'positive', icon: UserGroupIcon },
            { name: 'Avg. Order Value', value: `৳${totalOrders ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0}`, change: '-1%', changeType: 'negative', icon: BanknotesIcon },
        ];
    }, [filteredOrders]);

    // Chart Data
    const chartData = useMemo(() => {
        const data: Record<string, number> = {};
        // Initialize last X days
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            data[key] = 0;
        }

        filteredOrders.forEach(o => {
            if (o.paymentStatus === 'Paid' || o.status === 'Delivered') {
                const key = new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (data[key] !== undefined) data[key] += o.total;
            }
        });
        return Object.entries(data).map(([date, val]) => ({ date, val }));
    }, [filteredOrders, dateRange]);

    // Top Products
    const topProducts = useMemo(() => {
        const counts: Record<string, number> = {};
        orders.forEach(o => {
            if (o.items && Array.isArray(o.items)) {
                o.items.forEach((i: any) => {
                    const name = i.name || i.product_name || 'Unknown Product';
                    counts[name] = (counts[name] || 0) + (i.quantity || 0);
                });
            }
        });
        return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5);
    }, [orders]);


    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Dashboard Overview
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Welcome back, here's what's happening with your store today.
                    </p>
                </div>
                {/* Date Filter */}
                <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                    {['7d', '30d', '90d'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setDateRange(r as any)}
                            className={`px-3 py-1 text-xs font-bold rounded-md uppercase transition-all ${dateRange === r ? 'bg-black text-white shadow' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            Last {r.replace('d', ' Days')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="relative overflow-hidden rounded-2xl bg-white px-4 pt-5 pb-12 shadow-sm border border-gray-100 sm:px-6 sm:pt-6 transition-all hover:shadow-md">
                        <dt>
                            <div className="absolute rounded-md bg-gray-900 p-3">
                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-1 sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                            <p className={`ml-2 flex items-baseline text-xs font-semibold ${item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {item.changeType === 'positive' ? <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> : <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />}
                                {item.change}
                            </p>
                        </dd>
                    </div>
                ))}
            </dl>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 bg-white shadow-sm rounded-2xl border border-gray-100 p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend</h3>
                    <div className="flex-1 min-h-[300px] w-full">
                        <LineChart data={chartData} />
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performers</h3>
                    <div className="space-y-6">
                        {topProducts.map(([name, count], idx) => (
                            <div key={name} className="flex items-center gap-3">
                                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                                    }`}>{idx + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{name}</span>
                                        <span className="text-xs font-bold text-gray-500">{count} sold</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-black rounded-full" style={{ width: `${(count / topProducts[0][1]) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {topProducts.length === 0 && <p className="text-gray-400 text-sm">No data yet.</p>}
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                    <Link to="/admin/orders" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
                        View All <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                </div>

                {/* Mobile Card View */}
                <div className="block sm:hidden divide-y divide-gray-100">
                    {filteredOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-mono font-bold text-gray-500">#{order.id}</span>
                                    <div className="font-bold text-gray-900">{order.customerName}</div>
                                </div>
                                <span className={`px-2 py-1 inline-flex text-[10px] uppercase font-bold rounded-full 
                                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">{new Date(order.date).toLocaleDateString()}</span>
                                <span className="font-bold text-gray-900">৳{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                    {filteredOrders.length === 0 && (
                        <div className="p-4 text-center text-sm text-gray-500">No recent orders found.</div>
                    )}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.slice(0, 5).map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-gray-900">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.customerName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">৳{order.total.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                                           ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Chart Component (SVG Copy)
const LineChart = ({ data }: { data: { date: string, val: number }[] }) => {
    if (!data.length) return <div className="h-full flex items-center justify-center text-gray-400 text-sm font-bold">No data available</div>;
    const max = Math.max(...data.map(d => d.val), 100);
    return (
        <div className="h-full w-full flex items-end justify-between gap-1 pt-8 px-2">
            {data.map((d, i) => (
                <div key={i} className="group relative flex-1 flex flex-col justify-end items-center h-full">
                    <div
                        className="w-full bg-indigo-500/80 hover:bg-indigo-600 rounded-t-sm transition-all relative"
                        style={{ height: `${(d.val / max) * 100}%` }}
                    >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap z-10 shadow-lg">
                            {d.date}: ৳{d.val.toLocaleString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
