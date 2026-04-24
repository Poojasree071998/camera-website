import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import VendorManagement from './pages/VendorManagement';
import ProductApproval from './pages/ProductApproval';
import OrderManagement from './pages/OrderManagement';
import UserManagement from './pages/UserManagement';
import NotificationManagement from './pages/NotificationManagement';
import PaymentManagement from './pages/PaymentManagement';
import AdminChat from './pages/AdminChat';
import AdminReports from './pages/AdminReports';

import SystemSettings from './pages/SystemSettings';
import VendorDashboard from './pages/VendorDashboard';
import VendorProfile from './pages/VendorProfile';
import VendorProducts from './pages/VendorProducts';
import VendorAddProduct from './pages/VendorAddProduct';
import VendorOrders from './pages/VendorOrders';
import VendorInventory from './pages/VendorInventory';

import VendorAnalytics from './pages/VendorAnalytics';
import VendorPayments from './pages/VendorPayments';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerOrders from './pages/CustomerOrders';
import CustomerWishlist from './pages/CustomerWishlist';

import CustomerCompare from './pages/CustomerCompare';
import CustomerSupport from './pages/CustomerSupport';
import CustomerProfile from './pages/CustomerProfile';
import CustomerHistory from './pages/CustomerHistory';
import CustomerCart from './pages/CustomerCart';
import CustomerProducts from './pages/CustomerProducts';
import CustomerServices from './pages/CustomerServices';
import TechnicianDashboard from './pages/TechnicianDashboard';
import Store from './pages/Store';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import CustomerCheckout from './pages/CustomerCheckout';

import FlashDeals from './pages/FlashDeals';
import Explore from './pages/Explore';
import Community from './pages/Community';
import Tutorials from './pages/Tutorials';
import Footer from './components/Footer';
import './index.css';

function AppContent() {
  const location = useLocation();
  const isDashboard = ['/admin', '/vendor', '/customer', '/technician'].some(path => location.pathname.startsWith(path));

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/store" element={<Store />} />

        <Route path="/flash-deals" element={<FlashDeals />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/community" element={<Community />} />
        <Route path="/tutorials" element={<Tutorials />} />
        <Route path="/products/:category" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/vendors" element={<VendorManagement />} />
        <Route path="/admin/products" element={<ProductApproval />} />
        <Route path="/admin/orders" element={<OrderManagement />} />
        <Route path="/admin/notifications" element={<NotificationManagement />} />
        <Route path="/admin/payments" element={<PaymentManagement />} />
        <Route path="/admin/chats" element={<AdminChat />} />

        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<SystemSettings />} />
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/vendor/profile" element={<VendorProfile />} />
        <Route path="/vendor/products" element={<VendorProducts />} />
        <Route path="/vendor/add-product" element={<VendorAddProduct />} />
        <Route path="/vendor/orders" element={<VendorOrders />} />
        <Route path="/vendor/inventory" element={<VendorInventory />} />


        <Route path="/vendor/analytics" element={<VendorAnalytics />} />
        <Route path="/vendor/payments" element={<VendorPayments />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/orders" element={<CustomerOrders />} />
        <Route path="/customer/wishlist" element={<CustomerWishlist />} />
        <Route path="/customer/compare" element={<CustomerCompare />} />
        <Route path="/customer/support" element={<CustomerSupport />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/customer/history" element={<CustomerHistory />} />
        <Route path="/customer/products" element={<CustomerProducts />} />
        <Route path="/customer/services" element={<CustomerServices />} />
        <Route path="/customer/cart" element={<CustomerCart />} />
        <Route path="/customer/checkout/:id" element={<CustomerCheckout />} />
        <Route path="/technician" element={<TechnicianDashboard />} />
      </Routes>
      {!isDashboard && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
