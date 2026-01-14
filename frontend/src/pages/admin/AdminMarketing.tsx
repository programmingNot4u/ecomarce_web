import { Dialog, Transition } from '@headlessui/react';
import {
    ChartBarIcon,
    CheckCircleIcon,
    ChevronRightIcon,
    FunnelIcon,
    GiftIcon,
    MagnifyingGlassIcon,
    MegaphoneIcon,
    PencilSquareIcon,
    PlusIcon,
    TagIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Fragment, useEffect, useMemo, useState as useReactState, useState } from 'react';
import { useProducts, type Campaign, type Coupon } from '../../context/ProductContext';

// Helper Component for Duration
const DurationTimer = ({ startDate, endDate, status }: { startDate: string, endDate: string, status: string }) => {
    const [timeLeft, setTimeLeft] = useReactState<string>('');

    useEffect(() => {
        if (status !== 'active') {
            setTimeLeft('');
            return;
        }

        const calculate = () => {
            const end = new Date(endDate).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('Ended');
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
        };

        calculate();
        const interval = setInterval(calculate, 1000);
        return () => clearInterval(interval);
    }, [endDate, status]);

    return (
        <div className="flex flex-col">
            <span className="text-gray-900">{startDate} - {endDate}</span>
            {status === 'active' && timeLeft && (
                <span className="text-xs font-mono font-bold text-indigo-600 mt-0.5">({timeLeft})</span>
            )}
        </div>
    );
};

export default function AdminMarketing() {
    const { campaigns, addCampaign, updateCampaign, deleteCampaign, coupons, addCoupon, updateCoupon, deleteCoupon, products, categories, getProductsByCategory } = useProducts();
    const [showWizard, setShowWizard] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'coupons'>('overview');
    const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);

    // Wizard State
    const [wizardStep, setWizardStep] = useState(1);
    const [offerType, setOfferType] = useState<'coupon' | 'flash_sale' | 'bundle' | 'loyalty'>('coupon');

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        code: '', // For coupons
        discountType: 'percentage' as 'percentage' | 'fixed',
        discountValue: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        selectedProducts: [] as { id: number; discountType: 'percentage' | 'fixed'; discountValue: number }[],
        minPurchase: 0,
        usageLimit: 0,
        description: ''
    });

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredProducts = useMemo(() => {
        let baseList = products;

        // Apply Category Filter (Recursive via Context)
        if (selectedCategory !== 'All') {
            baseList = getProductsByCategory(selectedCategory);
        }

        // Apply Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            return baseList.filter(p => p.name.toLowerCase().includes(lowerQuery));
        }

        return baseList;
    }, [products, searchQuery, selectedCategory, getProductsByCategory]);

    const toggleProductSelection = (productId: number) => {
        setFormData(prev => {
            const exists = prev.selectedProducts.find(sp => sp.id === productId);
            if (exists) {
                return { ...prev, selectedProducts: prev.selectedProducts.filter(sp => sp.id !== productId) };
            } else {
                // Add with default/global discount values
                return {
                    ...prev,
                    selectedProducts: [
                        ...prev.selectedProducts,
                        { id: productId, discountType: prev.discountType, discountValue: prev.discountValue }
                    ]
                };
            }
        });
    };

    const updateProductDiscount = (productId: number, field: 'discountType' | 'discountValue', value: any) => {
        setFormData(prev => ({
            ...prev,
            selectedProducts: prev.selectedProducts.map(sp =>
                sp.id === productId ? { ...sp, [field]: value } : sp
            )
        }));
    };

    const handleNext = () => setWizardStep(prev => prev + 1);
    const handleBack = () => setWizardStep(prev => prev - 1);

    const handleSubmit = () => {
        if (offerType === 'coupon') {
            const newCoupon: Coupon = {
                id: editingCampaignId || Date.now().toString(),
                code: formData.code.toUpperCase(),
                type: formData.discountType,
                value: Number(formData.discountValue),
                minPurchase: Number(formData.minPurchase),
                usageLimit: Number(formData.usageLimit),
                usedCount: 0,
                expiryDate: formData.endDate,
                status: 'active'
            };
            if (editingCampaignId) {
                updateCoupon(editingCampaignId, newCoupon);
            } else {
                addCoupon(newCoupon);
            }
        } else {
            // Campaign
            const today = new Date().toISOString().split('T')[0];
            const isActive = formData.startDate <= today && formData.endDate >= today;

            const campaignData = {
                name: formData.name,
                type: offerType,
                startDate: formData.startDate,
                endDate: formData.endDate,
                status: isActive ? 'active' : 'scheduled',
                discountValue: Number(formData.discountValue),
                campaign_products: formData.selectedProducts.map(sp => ({
                    product: sp.id,
                    discount_type: sp.discountType,
                    discount_value: Number(sp.discountValue)
                })),
                description: formData.description
            };

            if (editingCampaignId) {
                updateCampaign(editingCampaignId, campaignData);
            } else {
                const newCampaign: Campaign = {
                    id: Date.now().toString(),
                    ...campaignData,
                    status: campaignData.status as any
                };
                addCampaign(newCampaign);
            }
        }
        setShowWizard(false);
        resetForm();
    };

    const handleEditCampaign = (campaign: Campaign) => {
        setEditingCampaignId(campaign.id);
        setOfferType(campaign.type);
        setFormData({
            name: campaign.name,
            code: '',
            discountType: 'percentage', // Default, will be overridden often by product specific
            discountValue: campaign.discountValue || 0,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            selectedProducts: (campaign.campaign_products || []).map(cp => ({
                id: cp.product,
                discountType: cp.discount_type,
                discountValue: cp.discount_value
            })),
            minPurchase: 0,
            usageLimit: 0,
            description: campaign.description || ''
        });
        setWizardStep(1);
        setShowWizard(true);
    };

    // Allow editing coupons too? Maybe later, focus on campaign for now as valid request.

    const resetForm = () => {
        setEditingCampaignId(null);
        setWizardStep(1);
        setOfferType('coupon');
        setFormData({
            name: '',
            code: '',
            discountType: 'percentage',
            discountValue: 0,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            selectedProducts: [],
            minPurchase: 0,
            usageLimit: 0,
            description: ''
        });
    };

    // Stats
    const activeCoupons = coupons.filter(c => c.status === 'active').length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Marketing Hub</h1>
                    <p className="mt-1 text-sm text-gray-500">Create offers, manage campaigns, and track performance.</p>
                </div>
                <button
                    onClick={() => setShowWizard(true)}
                    className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-gray-800 transition-all hover:scale-105"
                >
                    <PlusIcon className="h-5 w-5" />
                    Create Offer
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 overflow-x-auto no-scrollbar pb-1">
                <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Overview</button>
                <button onClick={() => setActiveTab('campaigns')} className={`whitespace-nowrap pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'campaigns' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Campaigns</button>
                <button onClick={() => setActiveTab('coupons')} className={`whitespace-nowrap pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'coupons' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Coupons</button>
            </div>

            {/* Content Area */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat Cards */}
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-purple-100 text-sm font-medium mb-1">Active Coupons</p>
                                <h3 className="text-3xl font-bold">{activeCoupons}</h3>
                            </div>
                            <TagIcon className="h-8 w-8 text-purple-200 opacity-50" />
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-xs text-purple-100">+2 created this week</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-pink-100 text-sm font-medium mb-1">Live Campaigns</p>
                                <h3 className="text-3xl font-bold">{activeCampaigns}</h3>
                            </div>
                            <MegaphoneIcon className="h-8 w-8 text-pink-200 opacity-50" />
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-xs text-pink-100">Flash Sale ending in 4h</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">Total Conversion</p>
                                <h3 className="text-3xl font-bold text-gray-900">3.2%</h3>
                            </div>
                            <ChartBarIcon className="h-8 w-8 text-gray-300" />
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-1 text-xs text-green-600 font-bold">
                            <CheckCircleIcon className="h-4 w-4" /> Optimization Good
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center items-center text-center cursor-pointer hover:bg-gray-50"
                        onClick={() => setShowWizard(true)}
                    >
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                            <PlusIcon className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">New Promotion</h3>
                        <p className="text-xs text-gray-400 mt-1">Start a new campaign</p>
                    </div>
                </div>
            )}

            {activeTab === 'campaigns' && (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {campaigns.map(c => (
                                    <tr key={c.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{c.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                            {(c.type === 'unknown' ? 'Unknown Type' : (c.type || '').replace('_', ' '))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                        ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                                    `}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <DurationTimer startDate={c.startDate} endDate={c.endDate} status={c.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => updateCampaign(c.id, { status: c.status === 'active' ? 'disabled' : 'active' })} className="text-indigo-600 hover:text-indigo-900 mr-2" title={c.status === 'active' ? 'Pause' : 'Activate'}>
                                                {c.status === 'active' ? <XMarkIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                                            </button>
                                            <button onClick={() => handleEditCampaign(c)} className="text-blue-600 hover:text-blue-900 mr-2" title="Edit">
                                                <PencilSquareIcon className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => deleteCampaign(c.id)} className="text-red-600 hover:text-red-900" title="Delete">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {campaigns.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No active campaigns.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="sm:hidden grid grid-cols-1 gap-4">
                        {campaigns.map(c => (
                            <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{c.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider capitalize">
                                                {(c.type || 'unknown').replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide
                                        ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                                    `}>
                                        {c.status}
                                    </span>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                    <div className="text-sm text-gray-700">
                                        <DurationTimer startDate={c.startDate} endDate={c.endDate} status={c.status} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                                    <button
                                        onClick={() => updateCampaign(c.id, { status: c.status === 'active' ? 'disabled' : 'active' })}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-colors ${c.status === 'active' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                    >
                                        {c.status === 'active' ? 'Pause' : 'Activate'}
                                    </button>
                                    <button onClick={() => handleEditCampaign(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <PencilSquareIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => deleteCampaign(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {campaigns.length === 0 && (
                            <div className="text-center text-gray-500 py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                                No active campaigns found. Start by creating one!
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'coupons' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map(c => (
                        <div key={c.id} className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 relative">
                            <div className="absolute top-4 right-4">
                                <button onClick={() => deleteCoupon(c.id)} className="text-gray-300 hover:text-red-500"><XMarkIcon className="h-5 w-5" /></button>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <TagIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Code</p>
                                    <h3 className="text-xl font-mono font-bold text-gray-900 tracking-wider">{c.code}</h3>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Discount:</span>
                                    <span className="font-bold text-green-600">{c.type === 'percentage' ? `${c.value}%` : `$${c.value}`} OFF</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Usage:</span>
                                    <span>{c.usedCount} / {c.usageLimit || '∞'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Expires:</span>
                                    <span>{c.expiryDate}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => { setShowWizard(true); setOfferType('coupon'); }}
                    >
                        <PlusIcon className="h-8 w-8 mb-2" />
                        <span className="font-bold">Create Coupon</span>
                    </div>
                </div>
            )}


            {/* WIZARD MODAL */}
            <Transition.Root show={showWizard} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => { }}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-full h-[100dvh] sm:h-[80vh] sm:max-w-5xl flex flex-col">
                                    {/* Header */}
                                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{editingCampaignId ? 'Edit Offer' : 'Create New Offer'}</h3>
                                            <p className="text-sm text-gray-500">Step {wizardStep} of 4</p>
                                        </div>
                                        <button onClick={() => setShowWizard(false)} className="text-gray-400 hover:text-gray-600">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                                        {/* FORM SIDE */}
                                        <div className="w-full lg:w-1/2 p-6 overflow-y-auto border-r border-gray-200">
                                            {/* STEP 1: TYPE */}
                                            {wizardStep === 1 && (
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-bold mb-4">Select Campaign Type</h4>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {[
                                                            { id: 'coupon', name: 'Coupon Code', desc: 'Customers enter a code at checkout', icon: TagIcon },
                                                            { id: 'flash_sale', name: 'Flash Sale', desc: 'Time-limited discount on products', icon: MegaphoneIcon },
                                                            { id: 'bundle', name: 'Product Bundle', desc: 'Buy X get Y or Group Discount', icon: GiftIcon },
                                                            { id: 'loyalty', name: 'Loyalty Reward', desc: 'Exclusive for VIP customers', icon: CheckCircleIcon },
                                                        ].map((type) => (
                                                            <div
                                                                key={type.id}
                                                                onClick={() => setOfferType(type.id as any)}
                                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                                                    ${offerType === type.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}
                                                `}
                                                            >
                                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${offerType === type.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                                    <type.icon className="h-6 w-6" />
                                                                </div>
                                                                <div>
                                                                    <h5 className={`font-bold ${offerType === type.id ? 'text-indigo-900' : 'text-gray-900'}`}>{type.name}</h5>
                                                                    <p className="text-sm text-gray-500">{type.desc}</p>
                                                                </div>
                                                                <div className={`ml-auto h-5 w-5 rounded-full border flex items-center justify-center ${offerType === type.id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                                                    {offerType === type.id && <div className="h-2 w-2 rounded-full bg-white" />}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 2: DETAILS */}
                                            {wizardStep === 2 && (
                                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                                    <h4 className="text-lg font-bold">Offer Details</h4>

                                                    {offerType === 'coupon' && (
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-1">Coupon Code</label>
                                                            <input
                                                                type="text"
                                                                value={formData.code}
                                                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                                className="w-full rounded-lg border-gray-300 focus:border-black focus:ring-black uppercase font-mono tracking-wider"
                                                                placeholder="SUMMER25"
                                                            />
                                                        </div>
                                                    )}

                                                    {offerType !== 'coupon' && (
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-1">Campaign Name</label>
                                                            <input
                                                                type="text"
                                                                value={formData.name}
                                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                                className="w-full rounded-lg border-gray-300 focus:border-black focus:ring-black"
                                                                placeholder="Summer Flash Sale"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-1">Discount Type</label>
                                                            <select
                                                                value={formData.discountType}
                                                                onChange={e => setFormData({ ...formData, discountType: e.target.value as any })}
                                                                className="w-full rounded-lg border-gray-300 focus:border-black focus:ring-black"
                                                            >
                                                                <option value="percentage">Percentage (%)</option>
                                                                <option value="fixed">Fixed Amount ($)</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-1">Value</label>
                                                            <input
                                                                type="number"
                                                                value={formData.discountValue}
                                                                onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                                                className="w-full rounded-lg border-gray-300 focus:border-black focus:ring-black"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Purchase ($)</label>
                                                        <input
                                                            type="number"
                                                            value={formData.minPurchase}
                                                            onChange={e => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                                                            className="w-full rounded-lg border-gray-300 focus:border-black focus:ring-black"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-1">Usage Limit (0 for unlimited)</label>
                                                        <input
                                                            type="number"
                                                            value={formData.usageLimit}
                                                            onChange={e => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                                            className="w-full rounded-lg border-gray-300 focus:border-black focus:ring-black"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 3: SCHEDULE */}
                                            {wizardStep === 3 && (
                                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                                    <h4 className="text-lg font-bold">Schedule & Targeting</h4>
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-1">Date Range</label>
                                                        <div className="flex flex-col sm:flex-row items-center gap-2">
                                                            <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="rounded-lg border-gray-300 w-full" />
                                                            <span className="hidden sm:inline text-gray-400">to</span>
                                                            <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="rounded-lg border-gray-300 w-full" />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-700 mb-2">Apply to Specific Products</label>

                                                        {/* Search & Filter Bar */}
                                                        <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                                            <div className="relative flex-1">
                                                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search products..."
                                                                    value={searchQuery}
                                                                    onChange={e => setSearchQuery(e.target.value)}
                                                                    className="pl-9 w-full rounded-lg border-gray-300 text-sm focus:border-black focus:ring-black"
                                                                />
                                                            </div>
                                                            <div className="relative w-full sm:w-1/3">
                                                                <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                <select
                                                                    value={selectedCategory}
                                                                    onChange={e => setSelectedCategory(e.target.value)}
                                                                    className="pl-9 w-full rounded-lg border-gray-300 text-sm focus:border-black focus:ring-black appearance-none"
                                                                >
                                                                    <option value="All">All Items</option>
                                                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {/* Product List */}
                                                        <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                                                            {filteredProducts.map(p => {
                                                                const isSelected = formData.selectedProducts.find(sp => sp.id === p.id);
                                                                return (
                                                                    <div key={p.id} className={`p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-indigo-50' : ''}`}>
                                                                        <div className="flex items-center gap-3">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!!isSelected}
                                                                                onChange={() => toggleProductSelection(p.id)}
                                                                                className="rounded text-indigo-600 focus:ring-indigo-600"
                                                                            />
                                                                            <img src={p.images[0]} className="w-10 h-10 rounded object-cover border border-gray-200" alt="" />
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                                                                <p className="text-xs text-gray-500">{p.category_name || 'Uncategorized'} • ${p.price}</p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Individual Discount Inputs */}
                                                                        {isSelected && (
                                                                            <div className="mt-3 ml-8 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                                                                                <div className="relative w-24">
                                                                                    <select
                                                                                        value={isSelected.discountType}
                                                                                        onChange={e => updateProductDiscount(p.id, 'discountType', e.target.value)}
                                                                                        className="w-full text-xs rounded border-gray-300 py-1 pr-6 focus:border-indigo-500 focus:ring-indigo-500"
                                                                                    >
                                                                                        <option value="percentage">% Off</option>
                                                                                        <option value="fixed">$ Off</option>
                                                                                    </select>
                                                                                </div>
                                                                                <div className="relative w-24">
                                                                                    <input
                                                                                        type="number"
                                                                                        value={isSelected.discountValue}
                                                                                        onChange={e => updateProductDiscount(p.id, 'discountValue', Number(e.target.value))}
                                                                                        className="w-full text-xs rounded border-gray-300 py-1 focus:border-indigo-500 focus:ring-indigo-500"
                                                                                        placeholder="Value"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                            {filteredProducts.length === 0 && (
                                                                <div className="p-8 text-center text-gray-500 text-sm">No products found matching your search.</div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-2 text-right">{formData.selectedProducts.length} products selected</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 4: REVIEW */}
                                            {wizardStep === 4 && (
                                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                                    <h4 className="text-lg font-bold text-center">Ready to Launch?</h4>
                                                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                                            <span className="text-gray-500">Type</span>
                                                            <span className="font-bold capitalize">{(offerType || '').replace('_', ' ')}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                                            <span className="text-gray-500">Name/Code</span>
                                                            <span className="font-bold">{formData.code || formData.name}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                                            <span className="text-gray-500">Discount</span>
                                                            <span className="font-bold text-green-600">
                                                                {formData.discountType === 'percentage' ? `${formData.discountValue}%` : `$${formData.discountValue}`} OFF
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Duration</span>
                                                            <span className="font-bold">{formData.startDate} - {formData.endDate}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* PREVIEW SIDE */}
                                        <div className="hidden lg:flex w-1/2 bg-gray-100 items-center justify-center p-8 border-l border-gray-200 relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                                            <div className="w-[320px] bg-white rounded-[2.5rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden relative">
                                                {/* Mobile Notch */}
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>

                                                {/* Mobile Content Simulation */}
                                                <div className="h-[600px] w-full bg-gray-50 overflow-y-auto">
                                                    {/* Header */}
                                                    <div className="h-16 bg-white flex items-center justify-center border-b border-gray-100 pt-6">
                                                        <span className="font-serif font-bold">MARYONÉ</span>
                                                    </div>

                                                    <div className="p-4 space-y-4">
                                                        {/* BANNER PREVIEW */}
                                                        {(offerType === 'flash_sale' || offerType === 'bundle') && (
                                                            <div className="bg-black text-white p-4 rounded-lg text-center relative overflow-hidden">
                                                                <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-400 rounded-full blur-xl opacity-20"></div>
                                                                <p className="text-xs uppercase tracking-widest text-gray-300 mb-1">{(offerType || '').replace('_', ' ')}</p>
                                                                <h3 className="text-xl font-serif font-bold mb-1">{formData.name || 'Summer Sale'}</h3>
                                                                <p className="text-2xl font-bold text-yellow-400">
                                                                    {formData.discountValue > 0 ? (formData.discountType === 'percentage' ? `${formData.discountValue}% OFF` : `$${formData.discountValue} OFF`) : 'Special Offer'}
                                                                </p>
                                                                <button className="mt-3 bg-white text-black px-4 py-1 text-xs font-bold rounded-full">Shop Now</button>
                                                            </div>
                                                        )}

                                                        {/* COUPON PREVIEW */}
                                                        {offerType === 'coupon' && (
                                                            <div className="border-2 border-dashed border-indigo-300 bg-indigo-50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                                                                <p className="text-indigo-900 font-bold mb-1 text-sm">You've got a coupon!</p>
                                                                <div className="bg-white border border-indigo-200 px-4 py-2 rounded font-mono font-bold text-indigo-700 tracking-wider mb-2">
                                                                    {formData.code || 'CODE'}
                                                                </div>
                                                                <p className="text-xs text-indigo-500">
                                                                    Get {formData.discountValue > 0 ? (formData.discountType === 'percentage' ? `${formData.discountValue}%` : `$${formData.discountValue}`) : ''} off your order.
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* PRODUCT CARD MOCK */}
                                                        <div className="bg-white p-3 rounded-xl shadow-sm">
                                                            <div className="h-32 bg-gray-200 rounded-lg mb-2 relative">
                                                                {formData.discountValue > 0 && (
                                                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                                        -{formData.discountType === 'percentage' ? `${formData.discountValue}%` : `$${formData.discountValue}`}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="h-3 w-3/4 bg-gray-200 rounded mb-1"></div>
                                                            <div className="h-3 w-1/2 bg-gray-200 rounded mb-3"></div>
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex gap-2">
                                                                    <div className="h-4 w-12 bg-gray-900 rounded"></div>
                                                                    <div className="h-4 w-8 bg-gray-200 rounded line-through opacity-50"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-8 text-center">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Preview</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                                        {wizardStep > 1 ? (
                                            <button onClick={handleBack} className="text-gray-600 font-bold text-sm hover:text-black">Back</button>
                                        ) : (
                                            <div></div>
                                        )}

                                        {wizardStep < 4 ? (
                                            <button onClick={handleNext} className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 flex items-center gap-2">
                                                Next Step <ChevronRightIcon className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <button onClick={handleSubmit} className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-200">
                                                Launch Offer 🚀
                                            </button>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
}
