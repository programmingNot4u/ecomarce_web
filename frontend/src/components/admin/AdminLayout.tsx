import {
  ArchiveBoxIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  CalculatorIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  HomeIcon,
  MegaphoneIcon,
  PaintBrushIcon,
  PhoneIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
  StarIcon,
  SwatchIcon,
  TagIcon,
  TruckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

const navigationGroups = [
  {
    name: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: HomeIcon, end: true },
    ]
  },
  {
    name: 'Product Management',
    items: [
      { name: 'Products', href: '/admin/products', icon: TagIcon },
      { name: 'Categories', href: '/admin/categories', icon: TagIcon },
      { name: 'Brands', href: '/admin/brands', icon: TagIcon },
    ]
  },
  {
    name: 'Inventory Manager',
    items: [
      { name: 'Inventory', href: '/admin/inventory', icon: ArchiveBoxIcon },
      { name: 'Purchase', href: '/admin/purchase', icon: CurrencyDollarIcon },
      { name: 'Suppliers', href: '/admin/suppliers', icon: TruckIcon },
    ]
  },
  {
    name: 'Sales & Fulfillment',
    items: [
      { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
      { name: 'Payments', href: '/admin/payments', icon: CreditCardIcon },
      { name: 'Delivery', href: '/admin/delivery', icon: TruckIcon },
    ]
  },
  {
    name: 'Customer Relations',
    items: [
      { name: 'Reviews', href: '/admin/reviews', icon: StarIcon },
      { name: 'Q&A', href: '/admin/qa', icon: QuestionMarkCircleIcon },
      { name: 'Support', href: '/admin/support', icon: ChatBubbleLeftRightIcon },
      { name: 'Follow Up', href: '/admin/followup', icon: PhoneIcon },
    ]
  },
  {
    name: 'Content & Marketing',
    items: [
      { name: 'Marketing', href: '/admin/marketing', icon: MegaphoneIcon },
    ]
  },
  {
    name: 'Decorations',
    items: [
      { name: 'Page Layouts', href: '/admin/theme', icon: PaintBrushIcon },
      { name: 'Text & Visuals', href: '/admin/decorations', icon: SwatchIcon },
      { name: 'Content', href: '/admin/content', icon: DocumentTextIcon },
    ]
  },
  {
    name: 'Analytics',
    items: [
      { name: 'Reports', href: '/admin/reports', icon: DocumentChartBarIcon },
      { name: 'Profit Calculator', href: '/admin/analytics', icon: CalculatorIcon },
    ]
  },
  {
    name: 'System',
    items: [
      { name: 'Staff', href: '/admin/staff', icon: UserGroupIcon },
      { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    ]
  },
];

export default function AdminLayout() {
  const { currentUser, logout } = useAdmin();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // State to track expanded groups. Initialize with 'Overview' open by default.
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Overview']);

  // Auth Guard
  useEffect(() => {
    if (!currentUser) {
      navigate('/admin/login', { replace: true });
    }
  }, [currentUser, navigate]);

  // Auto-expand groups based on active route
  useEffect(() => {
    const currentPath = location.pathname;

    // Find the group that contains the current path
    const activeGroup = navigationGroups.find(group =>
      group.items.some(item => {
        if (item.end) return item.href === currentPath;
        return currentPath.startsWith(item.href);
      })
    );

    if (activeGroup && !expandedGroups.includes(activeGroup.name)) {
      setExpandedGroups(prev => [...prev, activeGroup.name]);
    }
  }, [location.pathname]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    );
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate('/admin/login');
    }
  }

  // Prevent render if not authenticated (avoids flash)
  if (!currentUser) return null;

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex print:h-auto print:overflow-visible print:block">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden print:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 z-50 flex w-72 flex-col bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } print:hidden`}
      >
        <div className="flex h-20 shrink-0 items-center px-6 border-b border-gray-100">
          <Link to="/admin" className="text-2xl font-serif font-bold tracking-tight text-gray-900 flex items-center gap-2">
            {theme?.adminLogo ? (
              <>
                <img src={theme.adminLogo} alt="Admin Logo" className="h-14 object-contain" />
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-sans font-medium tracking-wide">Admin</span>
              </>
            ) : (
              <>MARYONÉ<span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-sans font-medium tracking-wide">Admin</span></>
            )}
          </Link>
        </div>

        {/* Sidebar Scroll Area */}
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <nav className="flex-1 space-y-4">
            {navigationGroups.map((group) => {
              const isExpanded = expandedGroups.includes(group.name);

              return (
                <div key={group.name} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(group.name)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors group"
                  >
                    {group.name}
                    <ChevronDownIcon
                      className={`h-3 w-3 text-gray-400 transition-transform duration-200 group-hover:text-gray-600 ${isExpanded ? 'transform rotate-180' : ''}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="space-y-1 pt-1">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          end={(item as any).end || false}
                          onClick={() => setSidebarOpen(false)} // Close on mobile click
                          className={({ isActive }) =>
                            `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                              ? 'bg-primary/5 text-primary border-r-2 border-primary'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-r-2 border-transparent'
                            }`
                          }
                        >
                          <item.icon
                            className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200`}
                            aria-hidden="true"
                          />
                          {item.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="h-10 w-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm hover:shadow"
              title="Logout"
              aria-label="Logout"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content - Fixed Screen Layout */}
      <div className="flex flex-1 flex-col h-full overflow-hidden print:h-auto print:overflow-visible print:block">
        {/* Top header for mobile menu button */}
        <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden print:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">Dashboard</div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8 print:p-0 print:overflow-visible print:h-auto print:bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
