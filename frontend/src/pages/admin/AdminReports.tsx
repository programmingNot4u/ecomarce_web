import {
    ArrowDownTrayIcon,
    ArrowPathIcon,
    ChartBarIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    CreditCardIcon,
    CubeIcon,
    DocumentTextIcon,
    FunnelIcon,
    PrinterIcon,
    Squares2X2Icon,
    TagIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

type ReportType = 'sales_ledger' | 'product_velocity' | 'inventory_audit';
type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

export default function AdminReports() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<ReportType>('sales_ledger');
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Parameters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    // Update title for Print Header
    useEffect(() => {
        const titleMap: Record<string, string> = {
            'sales_ledger': 'Sales Ledger',
            'product_velocity': 'Product Velocity',
            'inventory_audit': 'Inventory Audit'
        };
        document.title = `${titleMap[activeTab] || 'Report'} - ${theme.textSnippets.contact_messenger || 'Admin'}`;
        return () => { document.title = 'Admin Panel'; };
    }, [activeTab, theme]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Map frontend report type to API endpoint
                // sales_ledger -> /reports/sales_ledger/
                // product_velocity -> /reports/product_velocity/
                // inventory_audit -> /reports/inventory_audit/

                const params: any = {};
                if (startDate) params.start_date = startDate;
                if (endDate) params.end_date = endDate;
                if (statusFilter !== 'all') params.status = statusFilter;

                // Pagination param for inventory_audit
                if (activeTab === 'inventory_audit') {
                    params.page = page;
                }

                const response = await api.get(`/reports/${activeTab}/`, { params });

                if (response.data.results) {
                    // Paginated response
                    setData(response.data.results);
                    setTotalItems(response.data.count);
                    setTotalPages(Math.ceil(response.data.count / 20)); // Assuming page size 20 from backend
                } else {
                    // Non-paginated response
                    setData(response.data);
                    setTotalItems(response.data.length);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Failed to fetch report data", error);
                // Optional: show error toast
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(fetchData, 300);
        return () => clearTimeout(debounce);
    }, [activeTab, startDate, endDate, statusFilter, page]);

    // Reset pagination when filters change or tab changes
    useEffect(() => {
        setPage(1);
    }, [activeTab, startDate, endDate, statusFilter]);

    // Sorting
    const reportData = useMemo(() => {
        if (!sortConfig) return data;
        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    // Summary Metrics
    const summaryMetrics = useMemo(() => {
        if (activeTab === 'sales_ledger') {
            const totalRevenue = reportData.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0);
            return [
                { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, icon: CreditCardIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Total Orders', value: reportData.length, icon: DocumentTextIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Avg. Value', value: `৳${reportData.length ? Math.round(totalRevenue / reportData.length).toLocaleString() : 0}`, icon: ChartBarIcon, color: 'text-purple-600', bg: 'bg-purple-50' }
            ];
        }
        if (activeTab === 'product_velocity') {
            const totalSold = reportData.reduce((sum, r) => sum + (r.sold || 0), 0);
            const totalRevenue = reportData.reduce((sum, r) => sum + (r.revenue || 0), 0);
            return [
                { label: 'Units Sold', value: totalSold.toLocaleString(), icon: CubeIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Revenue Generated', value: `৳${totalRevenue.toLocaleString()}`, icon: CreditCardIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Active Products', value: reportData.length, icon: TagIcon, color: 'text-pink-600', bg: 'bg-pink-50' }
            ];
        }
        if (activeTab === 'inventory_audit') {
            const lowStock = reportData.filter(r => r.stock < 5).length;
            const totalValue = reportData.reduce((sum, r) => sum + (r.value || 0), 0);
            return [
                { label: 'Value (Visible)', value: `৳${totalValue.toLocaleString()}`, icon: CreditCardIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Total SKUs', value: totalItems > 0 ? totalItems : reportData.length, icon: Squares2X2Icon, color: 'text-gray-600', bg: 'bg-gray-100' },
                { label: 'Stock Alerts (Page)', value: lowStock, icon: ArrowPathIcon, color: 'text-red-600', bg: 'bg-red-50' }
            ];
        }
        return [];
    }, [reportData, activeTab]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const handlePrint = () => window.print();

    const handleExport = () => {
        const headers = Object.keys(reportData[0] || {}).join(',');
        const rows = reportData.map(row => Object.values(row).join(',')).join('\n');
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\\n" + rows;
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `${activeTab}_report.csv`);
        document.body.appendChild(link).click();
        document.body.removeChild(link);
    };

    const setDateRange = (type: '7D' | '30D' | 'Month') => {
        const end = new Date();
        let start = new Date();
        if (type === '7D') start.setDate(end.getDate() - 7);
        if (type === '30D') start.setDate(end.getDate() - 30);
        if (type === 'Month') { start = new Date(end.getFullYear(), end.getMonth(), 1); }
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    // Get dynamic branding logo
    const getLogo = () => {
        if (theme.adminLogo) return theme.adminLogo; // Specific admin logo
        if (theme.logo && theme.logo !== 'text') return theme.logo; // Main logo if image
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20 font-sans text-gray-900 print:bg-white print:pb-0">
            {/* Top Navigation Bar - Hidden on Print */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <h1 className="text-xl font-bold tracking-tight text-gray-900">Reports</h1>
                            <nav className="flex space-x-1 overflow-x-auto no-scrollbar py-1 max-w-[50vw] sm:max-w-none">
                                {[
                                    { id: 'sales_ledger', name: 'Sales Ledger' },
                                    { id: 'product_velocity', name: 'Product Velocity' },
                                    { id: 'inventory_audit', name: 'Inventory Audit' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id as ReportType); setSortConfig(null); setStatusFilter('all'); setPage(1); }}
                                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                                            ? 'bg-black text-white shadow-md ring-1 ring-black/5'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="md:hidden">
                                {/* Mobile Tab Dropdown could go here, or just rely on horiz scroll above */}
                            </div>
                            <button onClick={handleExport} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Export CSV">
                                <ArrowDownTrayIcon className="h-5 w-5" />
                            </button>
                            <button onClick={handlePrint} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Print Report">
                                <PrinterIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:w-full print:max-w-none">

                {/* Print Letterhead - Visible Only on Print */}
                <div className="hidden print:flex flex-col mb-8 border-b-2 border-black pb-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-serif font-bold text-black uppercase tracking-widest">{activeTab.replace('_', ' ')}</h1>
                            <p className="text-sm text-gray-500 mt-2 font-mono">
                                Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                            </p>
                            {(startDate || endDate) && (
                                <p className="text-xs text-gray-400 mt-1">Period: {startDate || 'Start'} to {endDate || 'Present'}</p>
                            )}
                        </div>
                        <div className="text-right">
                            {/* Dynamic Logo Logic */}
                            {getLogo() ? (
                                <img src={getLogo()!} alt="Logo" className="h-12 object-contain ml-auto mb-2" />
                            ) : (
                                <div className="text-2xl font-bold tracking-tighter uppercase">{theme.textSnippets.contact_messenger || 'Store Admin'}</div>
                            )}
                            <div className="text-[10px] text-gray-400 uppercase tracking-widest px-1">Confidential Internal Report</div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4 print:mb-8">
                    {summaryMetrics.map((metric, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow
                             print:shadow-none print:border print:border-gray-200 print:rounded-lg print:p-4">
                            <div className="flex justify-between items-start mb-4 print:mb-2">
                                <div className={`p-3 rounded-xl ${metric.bg} print:bg-transparent print:p-0`}>
                                    <metric.icon className={`h-6 w-6 ${metric.color} print:text-black print:h-4 print:w-4`} />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-md print:hidden">
                                    {activeTab === 'sales_ledger' ? 'Current View' : 'Real-time'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 tracking-tight print:text-xl">{metric.value}</h3>
                                <p className="text-sm font-medium text-gray-500 mt-1 print:text-xs uppercase">{metric.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Controls Toolbar - Hidden on Print */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-3 sm:p-2 rounded-xl border border-gray-200 shadow-sm print:hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2 w-full px-1 sm:px-2">
                        <div className="flex items-center gap-2 mb-1 sm:mb-0">
                            <FunnelIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs font-bold text-gray-400 uppercase mr-2 border-r border-gray-200 pr-2 h-4 leading-4">Filters</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1 sm:flex-none h-9 sm:h-8 text-xs border-gray-200 rounded-lg focus:ring-black focus:border-black" placeholder="From" />
                            <span className="text-gray-300">-</span>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-1 sm:flex-none h-9 sm:h-8 text-xs border-gray-200 rounded-lg focus:ring-black focus:border-black" placeholder="To" />
                        </div>

                        {activeTab !== 'product_velocity' && (
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full sm:w-auto sm:flex-1 h-9 sm:h-8 text-xs border-gray-200 rounded-lg focus:ring-black focus:border-black pl-2 pr-8 sm:ml-2">
                                <option value="all">Status: All</option>
                                {activeTab === 'sales_ledger' && (
                                    <>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </>
                                )}
                                {activeTab === 'inventory_audit' && (
                                    <>
                                        <option value="Low Stock">Low Stock</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                        <option value="In Stock">In Stock</option>
                                    </>
                                )}
                            </select>
                        )}
                    </div>

                    <div className="flex gap-1 pr-2 w-full sm:w-auto justify-start sm:justify-end overflow-x-auto pb-1 sm:pb-0">
                        {['7D', '30D', 'Month'].map((range: any) => (
                            <button key={range} onClick={() => setDateRange(range)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors whitespace-nowrap flex-shrink-0">
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* The Data Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] print:shadow-none print:border-0 print:rounded-none relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    )}

                    {/* Mobile Card View */}
                    <div className="block sm:hidden divide-y divide-gray-100">
                        {reportData.map((row, idx) => (
                            <div key={idx} className="p-4 bg-white space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1">
                                        {/* Primary Value (Name/Product) */}
                                        <div className="font-bold text-sm text-gray-900 line-clamp-2">
                                            {row.product || row.name || `Record #${idx + 1}`}
                                        </div>
                                        {/* Secondary Date/ID */}
                                        {(row.date || row.order_id) && (
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                {row.date} {row.order_id ? `• #${row.order_id}` : ''}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        {/* Primary Metric (Total/Revenue) */}
                                        <div className="font-bold text-gray-900 font-mono">
                                            {typeof row.total === 'number' ? `৳${row.total.toLocaleString()}` :
                                                typeof row.revenue === 'number' ? `৳${row.revenue.toLocaleString()}` :
                                                    typeof row.value === 'number' ? `৳${row.value.toLocaleString()}` : ''}
                                        </div>
                                        {/* Status Badge if exists */}
                                        {row.status && (
                                            <div className={`text-[10px] font-bold uppercase tracking-wider mt-1
                                                ${row.status === 'Delivered' || row.status === 'In Stock' ? 'text-emerald-600' :
                                                    row.status === 'Pending' || row.status === 'Low Stock' ? 'text-amber-600' :
                                                        'text-red-500'}
                                            `}>
                                                {row.status}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Secondary Details Grid */}
                                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-50">
                                    {Object.entries(row).map(([key, val]) => {
                                        if (['name', 'product', 'date', 'order_id', 'total', 'revenue', 'value', 'status'].includes(key)) return null;
                                        return (
                                            <div key={key}>
                                                <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>{' '}
                                                <span className="font-medium text-gray-700">{val as any}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50 print:bg-white print:border-black print:border-b-2">
                                    {(reportData.length > 0) ? Object.keys(reportData[0]).map((k) => (
                                        <th
                                            key={k}
                                            onClick={() => requestSort(k)}
                                            className={`
                                                group px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-colors select-none
                                                print:px-2 print:py-2 print:text-black print:font-bold
                                                ${['total', 'revenue', 'value', 'price', 'items', 'sold', 'stock'].includes(k) ? 'text-right' : ''}
                                            `}
                                        >
                                            <div className={`flex items-center gap-1.5 ${['total', 'revenue', 'value', 'price', 'items', 'sold', 'stock'].includes(k) ? 'justify-end' : ''}`}>
                                                {k.replace('_', ' ')}
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                                    {sortConfig?.key === k ? (
                                                        sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />
                                                    ) : <ChevronDownIcon className="h-3 w-3 text-gray-300" />}
                                                </span>
                                            </div>
                                        </th>
                                    )) : <th className="px-6 py-4">Status</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 print:divide-gray-200">
                                {reportData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors group print:hover:bg-white text-gray-700">
                                        {Object.entries(row).map(([cellKey, val]: [string, any], cIdx) => (
                                            <td key={cIdx} className={`px-6 py-4 text-sm print:px-2 print:py-2 print:text-xs 
                                                ${['total', 'revenue', 'value', 'price', 'items', 'sold', 'stock'].includes(cellKey) ? 'text-right font-medium' : ''}
                                                ${['name', 'product', 'customer', 'supplier'].includes(cellKey) ? 'whitespace-normal min-w-[200px] max-w-[300px]' : 'whitespace-nowrap'}
                                            `}>
                                                {(() => {
                                                    // Use local consts instead of 'key' var to avoid any shadowing confusion
                                                    if (['name', 'product'].includes(cellKey)) {
                                                        return <span className="line-clamp-2" title={val}>{val}</span>;
                                                    }
                                                    if (cellKey === 'status') {
                                                        const colors = {
                                                            'Delivered': 'bg-emerald-100 text-emerald-800',
                                                            'In Stock': 'bg-emerald-100 text-emerald-800',
                                                            'Pending': 'bg-amber-100 text-amber-800',
                                                            'Low Stock': 'bg-amber-100 text-amber-800',
                                                            'Cancelled': 'bg-rose-100 text-rose-800',
                                                            'Out of Stock': 'bg-rose-100 text-rose-800'
                                                        };
                                                        // @ts-ignore
                                                        const colorClass = colors[val] || 'bg-gray-100 text-gray-600';
                                                        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colorClass} print:bg-transparent print:p-0 print:text-black`}>{val}</span>;
                                                    }
                                                    if (['total', 'revenue', 'value', 'price'].includes(cellKey) && typeof val === 'number') {
                                                        return <span className="font-mono text-gray-900 print:font-sans">৳{val.toLocaleString()}</span>;
                                                    }
                                                    if (cellKey === 'customer') return <span className="font-medium text-gray-900">{val}</span>;
                                                    if (cellKey === 'date') return <span className="text-gray-500">{val}</span>;
                                                    return val;
                                                })()}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {reportData.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={10}>
                                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <FunnelIcon className="h-6 w-6 text-gray-300" />
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-900">No records found</h3>
                                                <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Try adjusting your date range or status filters to see more data.</p>
                                                <button
                                                    onClick={() => { setStartDate(''); setEndDate(''); setStatusFilter('all'); }}
                                                    className="mt-4 text-xs font-bold text-black border-b border-black hover:opacity-75 print:hidden"
                                                >
                                                    Clear all filters
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls - Below Table, Hidden on Print */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 print:hidden rounded-b-2xl -mt-8 pt-6 pb-4">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to <span className="font-medium">{Math.min(page * 20, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    {/* Simplified Page Numbers */}
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                                        disabled={page === totalPages}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Next</span>
                                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}

                {/* Print Branding Footer */}
                <div className="hidden print:flex justify-between items-center pt-8 border-t border-gray-200 mt-auto">
                    <p className="text-[10px] text-gray-400">© {new Date().getFullYear()} {theme.textSnippets.contact_messenger || 'MARYONÉ'}. All rights reserved.</p>
                    <p className="text-[10px] text-gray-400">Page 1</p>
                </div>
            </main>
        </div>
    );
}
