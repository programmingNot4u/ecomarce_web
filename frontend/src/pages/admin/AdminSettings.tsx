import {
    BellIcon,
    BuildingStorefrontIcon,
    CreditCardIcon,
    DevicePhoneMobileIcon,
    MegaphoneIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import api from '../../services/api';

type SettingsTab = 'general' | 'notifications' | 'security' | 'billing' | 'meta' | 'sms';

export default function AdminSettings() {
    const { settings, updateSettings, toggleNotification } = useAdmin();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState<any>({});

    // Fetch SMS Settings
    const { data: smsData, isLoading: smsLoading, isError: smsIsError, error: smsError } = useQuery({
        queryKey: ['smsSettings'],
        queryFn: async () => {
            const res = await api.get('sms-settings/config/');
            return res.data;
        },
        enabled: activeTab === 'sms',
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch Marketing Settings
    const { data: marketingData, isLoading: marketingLoading } = useQuery({
        queryKey: ['marketingSettings'],
        queryFn: async () => {
            const res = await api.get('marketing-settings/');
            return res.data;
        },
        enabled: activeTab === 'meta',
        staleTime: 5 * 60 * 1000,
    });

    const [metaPixelId, setMetaPixelId] = useState('');
    const [marketingId, setMarketingId] = useState<number | null>(null);
    const [smsConfig, setSmsConfig] = useState<any>({
        apiUrl: '',
        apiKey: '',
        senderId: '',
        messageTemplate: '',
        isActive: true
    });

    // Sync state for SMS
    useEffect(() => {
        if (smsData) {
            console.log('SMS Data Received:', smsData);
            setSmsConfig({
                apiUrl: smsData.apiUrl || '',
                apiKey: smsData.apiKey || '',
                senderId: smsData.senderId || '',
                messageTemplate: smsData.messageTemplate || '',
                isActive: smsData.isActive ?? true
            });
        }
    }, [smsData]);

    // Sync state for Marketing
    useEffect(() => {
        if (marketingData) {
            setMetaPixelId(marketingData.meta_pixel_id || '');
            setMarketingId(marketingData.id);
        }
    }, [marketingData]);

    const handleMarketingSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        try {
            const payload = { meta_pixel_id: metaPixelId };

            if (marketingId) {
                await api.patch(`marketing-settings/${marketingId}/`, payload);
            } else {
                await api.post('marketing-settings/', payload);
            }
            showSuccess('Meta configuration saved successfully.');
            queryClient.invalidateQueries({ queryKey: ['marketingSettings'] });
        } catch (error: any) {
            console.error('Error saving marketing settings:', error);
            if (error.response && error.response.status === 400) {
                setErrors(error.response.data);
            } else {
                alert('An unexpected error occurred.');
            }
        }
    };

    const handleSmsSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('sms-settings/config/', smsConfig);
            showSuccess('SMS configuration saved successfully.');
            queryClient.invalidateQueries({ queryKey: ['smsSettings'] });
        } catch (error) {
            console.error('Error saving SMS settings:', error);
            showSuccess('Failed to save settings.');
        }
    };

    const tabs = [
        { id: 'general', name: 'General', icon: BuildingStorefrontIcon, description: 'Store details and preferences' },
        { id: 'notifications', name: 'Notifications', icon: BellIcon, description: 'Manage email and SMS alerts' },
        { id: 'security', name: 'Security', icon: ShieldCheckIcon, description: 'Password and authentication' },
        { id: 'billing', name: 'Billing', icon: CreditCardIcon, description: 'Payment methods and invoices' },
        { id: 'meta', name: 'Meta Config', icon: MegaphoneIcon, description: 'Meta Pixel and integrations' },
        { id: 'sms', name: 'SMS / OTP', icon: DevicePhoneMobileIcon, description: 'SMS Gateway Configuration' },
    ];

    const handleGeneralSave = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        updateSettings({
            storeName: formData.get('store-name') as string,
            websiteUrl: formData.get('website') as string,
            currency: formData.get('currency') as string,
            description: formData.get('about') as string,
        });
        showSuccess('General settings saved successfully.');
    };

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            {successMessage && (
                <div className="fixed top-4 right-4 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 shadow-sm z-50 flex items-center animate-in fade-in slide-in-from-top-2">
                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                    {successMessage}
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-2xl font-serif font-bold text-gray-900">Settings</h1>
                <p className="mt-2 text-sm text-gray-500">Manage your store configuration and preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="lg:w-64 flex-shrink-0 w-full overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                    <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 min-w-max">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as SettingsTab)}
                                className={`
                                    scroll-ml-4 snap-start flex items-center px-4 py-2.5 lg:px-3 lg:py-3 text-sm font-medium rounded-full lg:rounded-xl transition-all whitespace-nowrap lg:w-full border lg:border-transparent
                                    ${activeTab === tab.id
                                        ? 'bg-black text-white shadow-md border-black'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}
                                `}
                            >
                                <tab.icon className={`flex-shrink-0 -ml-1 mr-2 lg:mr-3 h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                <div className="text-left">
                                    <span className="block">{tab.name}</span>
                                </div>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content Panel */}
                <div className="flex-1">
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">

                        {/* GENERAL SETTINGS */}
                        {activeTab === 'general' && (
                            <form onSubmit={handleGeneralSave} className="px-4 py-6 sm:p-8">
                                <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div className="sm:col-span-4">
                                        <label htmlFor="store-name" className="block text-sm font-medium leading-6 text-gray-900">Store Name</label>
                                        <div className="mt-2">
                                            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-black sm:max-w-md">
                                                <input type="text" name="store-name" id="store-name" className="block flex-1 border-0 bg-transparent py-2.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" defaultValue={settings.storeName} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-4">
                                        <label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">Website URL</label>
                                        <div className="mt-2">
                                            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-black sm:max-w-md">
                                                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">https://</span>
                                                <input type="text" name="website" id="website" className="block flex-1 border-0 bg-transparent py-2.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" defaultValue={settings.websiteUrl} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="currency" className="block text-sm font-medium leading-6 text-gray-900">Store Currency</label>
                                        <div className="mt-2">
                                            <select id="currency" name="currency" defaultValue={settings.currency} className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:max-w-xs sm:text-sm sm:leading-6">
                                                <option>BDT (৳)</option>
                                                <option>USD ($)</option>
                                                <option>EUR (€)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="about" className="block text-sm font-medium leading-6 text-gray-900">Store Description</label>
                                        <div className="mt-2">
                                            <textarea id="about" name="about" rows={3} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" defaultValue={settings.description} />
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-gray-600">Brief description for SEO and metadata.</p>
                                    </div>
                                </div>
                                <div className="mt-8 flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-8">
                                    <button type="submit" className="w-full sm:w-auto rounded-lg bg-black px-4 py-3 sm:py-2 text-sm font-bold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-transform active:scale-95">Save Changes</button>
                                </div>
                            </form>
                        )}

                        {/* NOTIFICATIONS SETTINGS */}
                        {activeTab === 'notifications' && (
                            <div className="px-4 py-6 sm:p-8">
                                <div className="space-y-12">
                                    <div className="border-b border-gray-900/10 pb-12">
                                        <h2 className="text-base font-semibold leading-7 text-gray-900">Email Notifications</h2>
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Select which events trigger an email to the admin team.</p>

                                        <div className="mt-6 space-y-6">
                                            {[
                                                { key: 'orderReceived', label: 'New Order Received' },
                                                { key: 'lowStock', label: 'Low Stock Alert' },
                                                { key: 'newReview', label: 'New Customer Review' },
                                                { key: 'dailyReport', label: 'Daily Performance Report' }
                                            ].map((item: any) => (
                                                <div key={item.key} className="relative flex gap-x-3">
                                                    <div className="flex h-6 items-center">
                                                        <input
                                                            id={item.key}
                                                            name={item.key}
                                                            type="checkbox"
                                                            checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                                                            onChange={() => { toggleNotification(item.key); showSuccess('Preference updated'); }}
                                                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                                        />
                                                    </div>
                                                    <div className="text-sm leading-6">
                                                        <label htmlFor={item.key} className="font-medium text-gray-900">{item.label}</label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECURITY SETTINGS */}
                        {activeTab === 'security' && (
                            <div className="px-4 py-6 sm:p-8">
                                <h2 className="text-base font-semibold leading-7 text-gray-900 mb-6">Change Password</h2>
                                <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                                    <div className="sm:col-span-4">
                                        <label className="block text-sm font-medium leading-6 text-gray-900">Current Password</label>
                                        <div className="mt-2">
                                            <input type="password" className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                    <div className="sm:col-span-4">
                                        <label className="block text-sm font-medium leading-6 text-gray-900">New Password</label>
                                        <div className="mt-2">
                                            <input type="password" className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 border-t border-gray-900/10 pt-8">
                                    <h2 className="text-base font-semibold leading-7 text-gray-900">Two-Factor Authentication</h2>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { updateSettings({ security: { twoFactorEnabled: !settings.security.twoFactorEnabled } }); showSuccess(`2FA ${!settings.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}`); }}
                                            className={`rounded-md px-2.5 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-inset transition-colors ${settings.security.twoFactorEnabled ? 'bg-black text-white ring-black hover:bg-gray-800' : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'}`}
                                        >
                                            {settings.security.twoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BILLING (Placeholder) */}
                        {activeTab === 'billing' && (
                            <div className="px-4 py-6 sm:p-8 flex flex-col items-center justify-center text-center py-20">
                                <CreditCardIcon className="h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">Billing Management</h3>
                                <p className="text-sm text-gray-500 max-w-sm mt-2">Manage your subscription plan and payment methods. This feature is coming soon.</p>
                            </div>
                        )}

                        {/* META CONFIG */}
                        {activeTab === 'meta' && (
                            marketingLoading ? (
                                <div className="p-8 text-center text-gray-500">Loading settings...</div>
                            ) : (
                                <form onSubmit={handleMarketingSave} className="px-4 py-6 sm:p-8">
                                    <h2 className="text-base font-semibold leading-7 text-gray-900 mb-6">Meta Integration</h2>
                                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                        <div className="sm:col-span-4">
                                            <label htmlFor="pixel-id" className="block text-sm font-medium leading-6 text-gray-900">Meta Pixel ID</label>
                                            <div className="mt-2">
                                                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-black sm:max-w-md">
                                                    <input
                                                        type="text"
                                                        name="pixel-id"
                                                        id="pixel-id"
                                                        className="block flex-1 border-0 bg-transparent py-2.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                                        value={metaPixelId}
                                                        onChange={(e) => setMetaPixelId(e.target.value)}
                                                        placeholder="e.g. 1234567890"
                                                    />
                                                </div>
                                                {errors.meta_pixel_id && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.meta_pixel_id}</p>
                                                )}
                                                <p className="mt-2 text-sm text-gray-500">Enter <strong>only the Pixel ID</strong> (e.g. 159...). Do not paste the full script code.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-8">
                                        <button type="submit" className="w-full sm:w-auto rounded-lg bg-black px-4 py-3 sm:py-2 text-sm font-bold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-transform active:scale-95">Save Changes</button>
                                    </div>
                                </form>
                            )
                        )}

                        {/* SMS SETTINGS */}
                        {activeTab === 'sms' && (
                            smsLoading ? (
                                <div className="p-8 text-center text-gray-500">Loading configuration...</div>
                            ) : smsIsError ? (
                                <div className="p-8 text-center text-red-500">
                                    Error loading settings: {String(smsError)}
                                    <br />
                                    <button onClick={() => queryClient.invalidateQueries({ queryKey: ['smsSettings'] })} className="mt-2 text-blue-500 underline">Retry</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSmsSave} className="px-4 py-6 sm:p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-base font-semibold leading-7 text-gray-900">SMS Gateway Configuration</h2>
                                        <div className="flex items-center">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={smsConfig.isActive}
                                                    onChange={(e) => setSmsConfig({ ...smsConfig, isActive: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                                <span className="ml-3 text-sm font-medium text-gray-900">{smsConfig.isActive ? 'Active' : 'Inactive'}</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                        <div className="sm:col-span-6">
                                            <label className="block text-sm font-medium leading-6 text-gray-900">API URL</label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                    value={smsConfig.apiUrl || ''}
                                                    onChange={(e) => setSmsConfig({ ...smsConfig, apiUrl: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-6">
                                            <label className="block text-sm font-medium leading-6 text-gray-900">API Key</label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                    value={smsConfig.apiKey || ''}
                                                    onChange={(e) => setSmsConfig({ ...smsConfig, apiKey: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label className="block text-sm font-medium leading-6 text-gray-900">Sender ID (Optional)</label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                    value={smsConfig.senderId || ''}
                                                    onChange={(e) => setSmsConfig({ ...smsConfig, senderId: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-6">
                                            <label className="block text-sm font-medium leading-6 text-gray-900">Message Template</label>
                                            <div className="mt-2">
                                                <textarea
                                                    rows={3}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                    value={smsConfig.messageTemplate || ''}
                                                    onChange={(e) => setSmsConfig({ ...smsConfig, messageTemplate: e.target.value })}
                                                />
                                                <p className="mt-1 text-sm text-gray-500">Use <code>{'{otp}'}</code> as a placeholder for the OTP code.</p>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-8">
                                            <button type="submit" className="w-full sm:w-auto rounded-lg bg-black px-4 py-3 sm:py-2 text-sm font-bold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-transform active:scale-95">Save Configuration</button>
                                        </div>
                                    </div>
                                </form>
                            )
                        )}

                    </div>
                </div>
            </div>
        </div >
    );
}
