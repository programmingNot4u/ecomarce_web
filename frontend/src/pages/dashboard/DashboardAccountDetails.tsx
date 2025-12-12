import { EyeIcon } from '@heroicons/react/24/outline'; // Note: Heroicons might differ, checking availability.
// If EyeIcon not available, we'll use placeholder. But it should be.

export default function DashboardAccountDetails() {
  return (
    <form className="max-w-4xl space-y-8">
      
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
                defaultValue="Md Hossain Imam"
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
                defaultValue="2221081077"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400"
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
                defaultValue="2221081077@uttarauniversity.edu.bd"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400"
                />
            </div>
        </div>
      </div>

      {/* Password Change Section */}
      <fieldset className="border border-gray-200 rounded-2xl p-6 sm:p-8 bg-white/50">
        <legend className="px-2 text-xl font-semibold text-gray-900">Password change</legend>
        
        <div className="space-y-6 mt-2">
            <div>
                <label htmlFor="current-password" className="block text-sm font-medium leading-6 text-gray-900">
                    Current password (leave blank to leave unchanged)
                </label>
                <div className="relative mt-2">
                    <input
                    type="password"
                    name="current-password"
                    id="current-password"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="new-password" className="block text-sm font-medium leading-6 text-gray-900">
                    New password (leave blank to leave unchanged)
                </label>
                <div className="relative mt-2">
                    <input
                    type="password"
                    name="new-password"
                    id="new-password"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400"
                    />
                     <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium leading-6 text-gray-900">
                    Confirm new password
                </label>
                <div className="relative mt-2">
                    <input
                    type="password"
                    id="confirm-password"
                    name="confirm-password"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400"
                    />
                     <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
      </fieldset>

      <div className="pt-4">
        <button
          type="submit"
          className="rounded-full bg-[#b91c1c] px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 uppercase tracking-wide transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
