import { AnimatePresence } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import NotificationToast from './components/common/NotificationToast';
import MainLayout from './components/layout/MainLayout';

// Lazy load pages
const AllBrandsPage = lazy(() => import('./pages/AllBrandsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const DashboardAccountDetails = lazy(() => import('./pages/dashboard/DashboardAccountDetails'));
const DashboardAddresses = lazy(() => import('./pages/dashboard/DashboardAddresses'));
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const DashboardOrders = lazy(() => import('./pages/dashboard/DashboardOrders'));
const DashboardOverview = lazy(() => import('./pages/dashboard/DashboardOverview'));
const UserSupport = lazy(() => import('./pages/dashboard/UserSupport'));
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CategoryLandingPage = lazy(() => import('./pages/CategoryLandingPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const DynamicPage = lazy(() => import('./pages/DynamicPage'));

// Lazy load Static Pages
const AboutPage = lazy(() => import('./pages/StaticPages').then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./pages/StaticPages').then(module => ({ default: module.ContactPage })));
const FAQPage = lazy(() => import('./pages/StaticPages').then(module => ({ default: module.FAQPage })));
const NotFoundPage = lazy(() => import('./pages/StaticPages').then(module => ({ default: module.NotFoundPage })));
const PrivacyPage = lazy(() => import('./pages/StaticPages').then(module => ({ default: module.PrivacyPage })));
const ReturnsPage = lazy(() => import('./pages/StaticPages').then(module => ({ default: module.ReturnsPage })));
const ShippingPage = lazy(() => import('./pages/StaticPages').then(module => ({ default: module.ShippingPage })));
const TermsPage = lazy(() => import('./pages/StaticPages').then(module => ({ default: module.TermsPage })));

// Lazy load Admin Pages
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminContent = lazy(() => import('./pages/admin/AdminContent'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDelivery = lazy(() => import('./pages/admin/AdminDelivery'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminMarketing = lazy(() => import('./pages/admin/AdminMarketing'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminPurchases = lazy(() => import('./pages/admin/AdminPurchases'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'));
const AdminSuppliers = lazy(() => import('./pages/admin/AdminSuppliers'));
const AdminSupport = lazy(() => import('./pages/admin/AdminSupport'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminBrands = lazy(() => import('./pages/admin/AdminBrands'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminFollowUp = lazy(() => import('./pages/admin/AdminFollowUp'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminQA = lazy(() => import('./pages/admin/AdminQA'));
const AdminBranding = lazy(() => import('./pages/admin/AdminBranding'));
const AdminDecorations = lazy(() => import('./pages/admin/AdminDecorations'));
const AdminTheme = lazy(() => import('./pages/admin/AdminTheme'));

import ScrollToTop from './components/layout/ScrollToTop';

import { AdminProvider } from './context/AdminContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProductProvider } from './context/ProductContext';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';

import { useMetaPixel } from './hooks/useMetaPixel';

// Simple Loader Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  useMetaPixel();
  const location = useLocation();

  return (
    <ThemeProvider>
      <ScrollToTop />
      <AuthProvider>
        <AdminProvider>
          <ProductProvider>
            <CartProvider>
              <NotificationProvider>
                <div className="flex min-h-screen flex-col bg-white">
                  <WishlistProvider>
                    <main className="flex-1">
                      <AnimatePresence mode="wait">
                        <Suspense fallback={<PageLoader />}>
                          <Routes location={location} key={location.pathname}>
                            <Route path="/" element={<MainLayout />}>
                              <Route index element={<HomePage />} />
                              <Route path="shop" element={<ShopPage />} />
                              <Route path="brands" element={<AllBrandsPage />} />
                              <Route path="category/:category" element={<CategoryLandingPage />} />
                              <Route path="cart" element={<CartPage />} />
                              <Route path="checkout" element={<CheckoutPage />} />
                              <Route path="products/:id" element={<ProductDetailPage />} />
                              <Route path="login" element={<LoginPage />} />
                              <Route path="register" element={<RegisterPage />} />
                              <Route path="admin/login" element={<AdminLoginPage />} />

                              <Route path="order-success" element={<OrderSuccessPage />} />
                              <Route path="order-tracking" element={<OrderTrackingPage />} />

                              {/* Static Pages */}
                              <Route path="about" element={<AboutPage />} />
                              <Route path="contact" element={<ContactPage />} />
                              <Route path="faq" element={<FAQPage />} />
                              <Route path="terms" element={<TermsPage />} />
                              <Route path="privacy" element={<PrivacyPage />} />
                              <Route path="shipping-policy" element={<ShippingPage />} />
                              <Route path="returns-policy" element={<ReturnsPage />} />

                              {/* Dashboard Routes */}
                              <Route path="account" element={<DashboardLayout />}>
                                <Route index element={<DashboardOverview />} />
                                <Route path="orders" element={<DashboardOrders />} />
                                <Route path="addresses" element={<DashboardAddresses />} />
                                <Route path="edit-account" element={<DashboardAccountDetails />} />
                                <Route path="wishlist" element={<WishlistPage />} />
                                <Route path="support" element={<UserSupport />} />
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
                              <Route path="purchase" element={<AdminPurchases />} />
                              <Route path="marketing" element={<AdminMarketing />} />
                              <Route path="payments" element={<AdminPayments />} />
                              <Route path="delivery" element={<AdminDelivery />} />
                              <Route path="content" element={<AdminContent />} />
                              <Route path="reviews" element={<AdminReviews />} />
                              <Route path="qa" element={<AdminQA />} />
                              <Route path="support" element={<AdminSupport />} />
                              <Route path="followup" element={<AdminFollowUp />} />
                              <Route path="reports" element={<AdminReports />} />
                              <Route path="staff" element={<AdminStaff />} />
                              <Route path="settings" element={<AdminSettings />} />
                              <Route path="decorations" element={<AdminDecorations />} />
                              <Route path="theme" element={<AdminTheme />} />
                              <Route path="branding" element={<AdminBranding />} />
                              <Route path="analytics" element={<AdminAnalytics />} />
                            </Route>
                            <Route path="page/:slug" element={<DynamicPage />} />
                          </Routes>
                        </Suspense>
                      </AnimatePresence>
                    </main>
                  </WishlistProvider>
                </div>
                <NotificationToast />
              </NotificationProvider>
            </CartProvider >
          </ProductProvider >
        </AdminProvider >
      </AuthProvider >
    </ThemeProvider >
  );
}

export default App;
