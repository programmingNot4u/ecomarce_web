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
    <div>
      <p className="text-gray-600 mb-8">
        Hello <span className="font-bold text-gray-900">{user?.name}</span> (not <span className="font-bold text-gray-900">{user?.name}</span>? <a href="#" onClick={handleLogout} className="text-blue-600 hover:underline">Log out</a>)
      </p>
      <p className="text-gray-600 mb-10">
        From your account dashboard you can view your <a href="/account/orders" className="text-blue-600 hover:underline">recent orders</a>, manage your <a href="/account/addresses" className="text-blue-600 hover:underline">shipping and billing addresses</a>, and <a href="/account/edit-account" className="text-blue-600 hover:underline">edit your password and account details</a>.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
             action.onClick ? (
                <button
                    key={action.name}
                    onClick={action.onClick}
                    className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-center aspect-[4/3] group w-full"
                >
                    <action.icon className="h-10 w-10 text-gray-400 group-hover:text-gray-900 mb-4 transition-colors" aria-hidden="true" />
                    <span className="text-base font-medium text-gray-900">{action.name}</span>
                </button>
             ) : (
                <NavLink
                    key={action.name}
                    to={action.href}
                    className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-center aspect-[4/3] group"
                >
                    <action.icon className="h-10 w-10 text-gray-400 group-hover:text-gray-900 mb-4 transition-colors" aria-hidden="true" />
                    <span className="text-base font-medium text-gray-900">{action.name}</span>
                </NavLink>
             )
        ))}
      </div>
    </div>
  );
}
