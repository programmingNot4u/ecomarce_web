import { ArrowRightOnRectangleIcon, HeartIcon, MapPinIcon, ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DashboardOverview() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const actions = [
    {
      name: 'Orders',
      href: '/account/orders',
      icon: ShoppingBagIcon,
      description: 'View your recent orders'
    },
    {
      name: 'Downloads',
      href: '/account/downloads',
      icon: ArrowRightOnRectangleIcon,
      description: 'Manage downloads'
    },
    {
      name: 'Addresses',
      href: '/account/addresses',
      icon: MapPinIcon,
      description: 'Edit addresses'
    },
    {
      name: 'Account details',
      href: '/account/edit-account',
      icon: UserIcon,
      description: 'Edit your password and account details'
    },
    {
      name: 'Wishlist',
      href: '/wishlist',
      icon: HeartIcon,
      description: 'View your wishlist'
    },
    {
      name: 'Logout',
      href: '#',
      icon: ArrowRightOnRectangleIcon,
      description: 'Logout from your account',
      onClick: handleLogout
    }
  ];

  return (
    <div className="space-y-8">
      {/* Profile Header - Mobile App Style */}
      <div className="flex items-center space-x-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
          <UserIcon className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hello, {user?.name}!</h2>
          <p className="text-sm text-gray-500">{user?.email || user?.phone_number || 'Welcome back'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          action.onClick ? (
            <button
              key={action.name}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-center group aspect-square sm:aspect-auto sm:py-8"
            >
              <div className="bg-gray-50 p-4 rounded-full mb-3 group-hover:bg-red-50 transition-colors">
                <action.icon className="h-6 w-6 text-gray-600 group-hover:text-red-600 transition-colors" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold text-gray-900">{action.name}</span>
            </button>
          ) : (
            <NavLink
              key={action.name}
              to={action.href}
              className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-center group aspect-square sm:aspect-auto sm:py-8"
            >
              <div className="bg-gray-50 p-4 rounded-full mb-3 group-hover:bg-red-50 transition-colors">
                <action.icon className="h-6 w-6 text-gray-600 group-hover:text-red-600 transition-colors" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold text-gray-900">{action.name}</span>
            </NavLink>
          )
        ))}
      </div>
    </div>
  );
}
