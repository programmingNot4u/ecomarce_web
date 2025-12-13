import {
    ArchiveBoxIcon,
    Bars3Icon,
    ChatBubbleBottomCenterTextIcon,
    ChevronDownIcon,
    Cog6ToothIcon,
    CreditCardIcon,
    CurrencyDollarIcon,
    DocumentChartBarIcon,
    DocumentTextIcon,
    HomeIcon,
    LifebuoyIcon,
    MegaphoneIcon,
    ShoppingBagIcon,
    TagIcon,
    TruckIcon,
    UserGroupIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

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
        { name: 'Customers', href: '/admin/customers', icon: UsersIcon },
        { name: 'Reviews', href: '/admin/reviews', icon: ChatBubbleBottomCenterTextIcon },
        { name: 'Support', href: '/admin/support', icon: LifebuoyIcon },
    ]
  },
  {
    name: 'Content & Marketing',
    items: [
        { name: 'Marketing', href: '/admin/marketing', icon: MegaphoneIcon },
        { name: 'Content', href: '/admin/content', icon: DocumentTextIcon },
    ]
  },
  {
    name: 'Analytics',
    items: [
        { name: 'Reports', href: '/admin/reports', icon: DocumentChartBarIcon },
    ]
  },
  {
    name: 'System',
    items: [
        { name: 'Staff', href: '/admin/staff', icon: UserGroupIcon },
        { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    ]
  }
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // State to track expanded groups. Initialize with 'Overview' open by default or all closed.
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Overview', 'Inventory Manager']);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(name => name !== groupName) 
        : [...prev, groupName]
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 z-50 flex w-72 flex-col bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-100">
             <Link to="/admin" className="text-2xl font-serif font-bold tracking-wide">
              MARYONÉ<span className="text-accent text-sm ml-1 font-sans font-medium tracking-normal text-gray-500">Admin</span>
            </Link>
        </div>
        
        {/* Sidebar Scroll Area */}
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
          <nav className="flex-1 space-y-2">
            {navigationGroups.map((group) => {
                const isExpanded = expandedGroups.includes(group.name);
                
                return (
                    <div key={group.name} className="space-y-1">
                        <button
                            onClick={() => toggleGroup(group.name)}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                        >
                            {group.name}
                            <ChevronDownIcon 
                                className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`}
                            />
                        </button>
                        
                        {isExpanded && (
                            <div className="space-y-1 pl-1">
                                {group.items.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    end={(item as any).end || false}
                                    onClick={() => setSidebarOpen(false)} // Close on mobile click
                                    className={({ isActive }) =>
                                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
                                        isActive
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`
                                    }
                                >
                                    <item.icon
                                    className="mr-3 h-5 w-5 flex-shrink-0"
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
        
        <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                    A
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Admin User</p>
                    <p className="text-xs text-gray-500">admin@maryone.shop</p>
                </div>
            </div>
        </div>
      </div>

      {/* Main content - Fixed Screen Layout */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Top header for mobile menu button */}
        <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
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
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8">
            <Outlet />
        </main>
      </div>
    </div>
  );
}


