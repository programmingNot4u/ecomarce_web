import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/account', end: true },
  { name: 'Orders', href: '/account/orders' },
  { name: 'Downloads', href: '/account/downloads' },
  { name: 'Support Tickets', href: '/account/support' },
  { name: 'Addresses', href: '/account/addresses' },
  { name: 'Account details', href: '/account/edit-account' },
  { name: 'Wishlist', href: '/account/wishlist' },
  { name: 'Logout', href: '/logout' },
];

export default function DashboardLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect Admin/Staff users to Admin Dashboard
    if (user && (user.is_staff || user.is_superuser || user.role === 'Admin')) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleLogout = (e: React.MouseEvent, href: string) => {
    if (href === '/logout') {
      e.preventDefault();
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="bg-white py-12">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
        <div className="text-sm breadcrumbs text-gray-500 mb-12">
          <span>Home</span> <span className="mx-2">/</span> <span className="text-gray-900 font-medium">My account</span>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block lg:col-span-3 py-6 px-2 sm:px-0">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.end}
                  onClick={(e) => handleLogout(e, item.href)}
                  className={({ isActive }) =>
                    `group flex items-center px-6 py-4 text-sm font-bold rounded-l-md transition-colors ${isActive && item.href !== '/logout'
                      ? 'bg-gray-100 text-gray-900 border-l-4 border-transparent'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 mt-6 lg:mt-0 border-l border-gray-100 pl-0 lg:pl-12 pt-6 lg:pt-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
