import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AllBrandsPage from './pages/AllBrandsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardAccountDetails from './pages/dashboard/DashboardAccountDetails';
import DashboardAddresses from './pages/dashboard/DashboardAddresses';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardOrders from './pages/dashboard/DashboardOrders';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import RegisterPage from './pages/RegisterPage';
import { AboutPage, ContactPage, FAQPage, NotFoundPage } from './pages/StaticPages';
import WishlistPage from './pages/WishlistPage';

import AdminLayout from './components/admin/AdminLayout';
import AdminContent from './pages/admin/AdminContent';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDelivery from './pages/admin/AdminDelivery';
import AdminInventory from './pages/admin/AdminInventory';
import AdminMarketing from './pages/admin/AdminMarketing';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayments from './pages/admin/AdminPayments';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminProducts from './pages/admin/AdminProducts';
import AdminPurchase from './pages/admin/AdminPurchase';
import AdminReports from './pages/admin/AdminReports';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';
import AdminStaff from './pages/admin/AdminStaff';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminSupport from './pages/admin/AdminSupport';

import AdminBrands from './pages/admin/AdminBrands';
import AdminCategories from './pages/admin/AdminCategories';

import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext'; // Import ProductProvider
import ShopPage from './pages/ShopPage';

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="brands" element={<AllBrandsPage />} />
              <Route path="category/:category" element={<ShopPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              
              <Route path="order-success" element={<OrderSuccessPage />} />
              <Route path="order-tracking" element={<OrderTrackingPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              
              {/* Static Pages */}
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="faq" element={<FAQPage />} />

              {/* Admin Routes */}


              {/* Dashboard Routes */}
              <Route path="account" element={<DashboardLayout />}>
                 <Route index element={<DashboardOverview />} />
                 <Route path="orders" element={<DashboardOrders />} />
                 <Route path="addresses" element={<DashboardAddresses />} />
                 <Route path="edit-account" element={<DashboardAccountDetails />} />
                 <Route path="downloads" element={<div className="p-4">No downloads available yet.</div>} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>

              {/* Admin Routes - Outside Main Layout */}
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/:id" element={<AdminProductForm />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="brands" element={<AdminBrands />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="suppliers" element={<AdminSuppliers />} />
                <Route path="purchase" element={<AdminPurchase />} />
                <Route path="marketing" element={<AdminMarketing />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="delivery" element={<AdminDelivery />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="staff" element={<AdminStaff />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
          </Routes>
        </Router>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
