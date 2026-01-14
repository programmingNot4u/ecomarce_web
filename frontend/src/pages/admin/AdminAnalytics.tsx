import {
    ArrowDownTrayIcon,
    ArrowPathIcon,
    ArrowTrendingUpIcon,
    BanknotesIcon,
    BuildingStorefrontIcon,
    ChartBarIcon,
    TagIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';

// --- Helper Components ---
const CurrencyInput = ({ label, value, onChange, icon: Icon, prefix = '৳', hint }: any) => (
    <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide flex justify-between">
            {label}
            {hint && <span className="text-gray-400 font-normal normal-case">{hint}</span>}
        </label>
        <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {Icon ? <Icon className="h-4 w-4 text-gray-400" /> : <span className="text-gray-500 sm:text-sm">{prefix}</span>}
            </div>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="block w-full rounded-lg border-gray-300 pl-10 focus:border-black focus:ring-black sm:text-sm py-2.5 transition-shadow"
                placeholder="0.00"
            />
        </div>
    </div>
);

const ResultRow = ({ label, value, isNegative = false, highlight = false, subValue }: any) => (
    <div className={`flex justify-between items-center py-3 border-b border-gray-100 last:border-0 ${highlight ? 'bg-gray-50 -mx-4 px-4 rounded-lg' : ''}`}>
        <span className={`text-sm ${highlight ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{label}</span>
        <div className="text-right">
            <div className={`font-mono font-medium ${isNegative ? 'text-red-600' : highlight ? 'text-black' : 'text-gray-900'}`}>
                {isNegative && '- '}৳{Math.abs(value).toLocaleString()}
            </div>
            {subValue && <div className="text-xs text-gray-400 mt-0.5">{subValue}</div>}
        </div>
    </div>
);

const SensitivityMatrix = ({ basePrice, baseCost, calculateProfit }: { basePrice: number, baseCost: number, calculateProfit: (p: number, c: number) => number }) => {
    const pricePoints = [0.9, 1.0, 1.1]; // -10%, 0%, +10%
    const costPoints = [0.9, 1.0, 1.1]; // -10%, 0%, +10%

    return (
        <div className="overflow-x-auto">
             <table className="min-w-full text-xs text-center border-collapse">
                 <thead>
                     <tr>
                         <th className="p-2 border border-gray-100 bg-gray-50 text-gray-400 font-medium">Cost \ Price</th>
                         {pricePoints.map(p => (
                             <th key={p} className="p-2 border border-gray-100 bg-gray-50 font-bold text-gray-900">
                                 {p === 1 ? 'Current' : `${p > 1 ? '+' : ''}${Math.round((p-1)*100)}%`}
                                 <div className="text-[10px] text-gray-400 font-normal">৳{(basePrice * p).toFixed(0)}</div>
                             </th>
                         ))}
                     </tr>
                 </thead>
                 <tbody>
                     {costPoints.map(c => (
                         <tr key={c}>
                             <td className="p-2 border border-gray-100 bg-gray-50 font-bold text-gray-900 text-left">
                                 {c === 1 ? 'Current' : `${c > 1 ? '+' : ''}${Math.round((c-1)*100)}%`}
                                 <div className="text-[10px] text-gray-400 font-normal">৳{(baseCost * c).toFixed(0)}</div>
                             </td>
                             {pricePoints.map(p => {
                                 const profit = calculateProfit(basePrice * p, baseCost * c);
                                 return (
                                     <td key={p} className={`p-2 border border-gray-100 font-mono font-bold ${profit >= 0 ? 'text-emerald-600 bg-emerald-50/30' : 'text-red-600 bg-red-50/30'}`}>
                                         ৳{profit.toFixed(0)}
                                     </td>
                                 );
                             })}
                         </tr>
                     ))}
                 </tbody>
             </table>
        </div>
    );
};

export default function AdminAnalytics() {
    // --- Core Inputs ---
    const [costPrice, setCostPrice] = useState(1200);
    const [sellingPrice, setSellingPrice] = useState(2500);
    const [shippingCost, setShippingCost] = useState(80);
    const [marketingCost, setMarketingCost] = useState(200); // Per unit assumption
    const [discount, setDiscount] = useState(0); // Fixed amount
    const [taxRate, setTaxRate] = useState(0); // Percent

    // Calculation Logic
    const calculateStats = (p: number, c: number, ship: number, mkt: number, disc: number, tax: number) => {
        const netRevenue = p - disc;
        const taxAmount = netRevenue * (tax / 100);
        const totalVariableCost = c + ship + mkt + taxAmount;
        const unitProfit = netRevenue - totalVariableCost;
        const margin = netRevenue > 0 ? (unitProfit / netRevenue) * 100 : 0;
        const roi = totalVariableCost > 0 ? (unitProfit / totalVariableCost) * 100 : 0;
        
        return { netRevenue, totalVariableCost, unitProfit, margin, roi, taxAmount };
    };

    const stats = useMemo(() => 
        calculateStats(sellingPrice, costPrice, shippingCost, marketingCost, discount, taxRate),
    [costPrice, sellingPrice, shippingCost, marketingCost, discount, taxRate]);

    const handleExport = () => {
        // Simple CSV Export
        const headers = "Metric,Value\n";
        const rows = [
            `Selling Price,${sellingPrice}`,
            `Cost Price,${costPrice}`,
            `Net Profit,${stats.unitProfit}`,
            `Margin,${stats.margin.toFixed(2)}%`,
            `ROI,${stats.roi.toFixed(2)}%`
        ].join('\n');
        
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Profit_Report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="flex justify-between items-center h-16">
                         <div className="flex items-center gap-3">
                             <div className="bg-black text-white p-2 rounded-lg">
                                 <ChartBarIcon className="h-5 w-5" />
                             </div>
                             <div>
                                 <h1 className="text-lg font-bold text-gray-900 leading-none">Profit Intelligence</h1>
                                 <p className="text-xs text-gray-500 mt-1">Enterprise Unit Economics & Pricing Strategy</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <button onClick={handleExport} className="p-2 text-gray-500 hover:text-black transition-colors" title="Export CSV">
                                <ArrowDownTrayIcon className="w-5 h-5" />
                            </button>
                         </div>
                     </div>
                 </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Data Entry */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* 1. Production & Cost */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <TagIcon className="w-4 h-4 text-gray-500" /> Variable Costs
                                </h3>
                                <span className="text-xs font-mono text-gray-400">PER UNIT</span>
                            </div>
                            <div className="p-5 space-y-5">
                                <CurrencyInput label="Purchase Cost" value={costPrice} onChange={setCostPrice} hint="COGS" />
                                <div className="grid grid-cols-2 gap-4">
                                    <CurrencyInput label="Shipping" value={shippingCost} onChange={setShippingCost} icon={TruckIcon} />
                                    <CurrencyInput label="Marketing" value={marketingCost} onChange={setMarketingCost} icon={BuildingStorefrontIcon} hint="CPA" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Pricing Strategy */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <BanknotesIcon className="w-4 h-4 text-gray-500" /> Pricing Strategy
                                </h3>
                            </div>
                            <div className="p-5 space-y-5">
                                <CurrencyInput label="Selling Price (MRP)" value={sellingPrice} onChange={setSellingPrice} />
                                <div className="grid grid-cols-2 gap-4">
                                    <CurrencyInput label="Discount" value={discount} onChange={setDiscount} label="Total Discount (৳)" />
                                    <CurrencyInput label="Tax Rate (%)" value={taxRate} onChange={setTaxRate} prefix="" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Results & Breakdown */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Main KPI Card */}
                        <div className="bg-black text-white rounded-2xl p-8 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <ArrowTrendingUpIcon className="w-32 h-32" />
                            </div>
                            
                            <div className="relative z-10">
                                <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Net Unit Profit</h4>
                                <div className={`text-4xl md:text-5xl font-black tracking-tight mb-6 ${stats.unitProfit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                    {stats.unitProfit >= 0 ? '+' : '-'}৳{Math.abs(stats.unitProfit).toFixed(2)}
                                </div>

                                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
                                    <div>
                                        <div className="text-xs text-white/50 mb-1">Margin</div>
                                        <div className={`text-xl font-bold ${stats.margin > 30 ? 'text-emerald-400' : stats.margin > 0 ? 'text-white' : 'text-red-400'}`}>
                                            {stats.margin.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/50 mb-1">ROI</div>
                                        <div className="text-xl font-bold text-blue-400">{stats.roi.toFixed(1)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/50 mb-1">Net Revenue</div>
                                        <div className="text-xl font-bold text-white">৳{stats.netRevenue.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Breakdown Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Financial Breakdown</h3>
                                <div className="space-y-1">
                                    <ResultRow label="Selling Price" value={sellingPrice} />
                                    <ResultRow label="Discount" value={discount} isNegative />
                                    <ResultRow label="Net Revenue" value={stats.netRevenue} highlight />
                                    <div className="h-4"></div>
                                    <ResultRow label="COGS (Product)" value={costPrice} isNegative />
                                    <ResultRow label="Shipping" value={shippingCost} isNegative />
                                    <ResultRow label="Marketing (CPA)" value={marketingCost} isNegative />
                                    <ResultRow label={`Tax (${taxRate}%)`} value={stats.taxAmount} isNegative />
                                    <div className="h-4"></div>
                                    <ResultRow label="Total Unit Cost" value={stats.totalVariableCost} isNegative subValue={`${Math.round((stats.totalVariableCost/stats.netRevenue)*100)}% of Revenue`} />
                                    <div className="border-t border-black my-2"></div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="font-bold text-lg text-gray-900">Net Profit</span>
                                        <span className={`font-bold text-xl ${stats.unitProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            ৳{stats.unitProfit.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Sensitivity Matrix */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                        <ArrowPathIcon className="w-4 h-4" /> Sensitivity Analysis
                                    </h3>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Net Profit Impact</span>
                                </div>
                                <div className="p-0">
                                    <SensitivityMatrix 
                                        basePrice={sellingPrice} 
                                        baseCost={costPrice} 
                                        calculateProfit={(p, c) => calculateStats(p, c, shippingCost, marketingCost, discount, taxRate).unitProfit} 
                                    />
                                    <div className="p-4 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
                                        Shows potential profit if costs or prices fluctuate by 10%.
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
