// import { EyeIcon } from '@heroicons/react/24/outline'; // Removed unused icon
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardAccountDetails() {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        last_name: '',
        email: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name.replace('-', '_')]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });

        // Password validation removed

        try {
            // Update profile
            await updateUser({
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email
            });

            // Update password if provided (requires separate endpoint usually, but check implementation)
            // Since our 'me' endpoint uses standard serializer, it handles password if active.
            // UserSerializer in backend handles password hashing if provided.
            // Update password logic removed as per request (OTP based system)

            setMessage({ text: "Account details updated successfully.", type: 'success' });
        } catch (error) {
            console.error(error);
            setMessage({ text: "Failed to update account.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="max-w-4xl space-y-8" onSubmit={handleSubmit}>

            {message.text && (
                <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                        First name <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="first-name"
                            id="first-name"
                            autoComplete="given-name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                        Last name <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="last-name"
                            id="last-name"
                            autoComplete="family-name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label htmlFor="display-name" className="block text-sm font-medium leading-6 text-gray-900">
                        Display name <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="display-name"
                            id="display-name"
                            disabled
                            value={`${formData.first_name} ${formData.last_name}`}
                            className="block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 shadow-sm focus:outline-none cursor-not-allowed"
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-500 italic">
                        This will be how your name will be displayed in the account section and in reviews
                    </p>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                        Email address <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* Password Change Section */}
            {/* Password Change Section Removed */}

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-full bg-[#b91c1c] px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 uppercase tracking-wide transition-colors disabled:opacity-70"
                >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}
