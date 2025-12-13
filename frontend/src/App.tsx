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

import { AuthProvider } from './context/AuthContext';
import ShopPage from './pages/ShopPage';

function App() {
  return (
    <AuthProvider>
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
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
