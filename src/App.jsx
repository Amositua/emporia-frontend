import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { RoleSelection } from './pages/RoleSelection';
import { LandingPage } from './pages/LandingPage';
import { SellerOnboarding } from './pages/sellers/SellerOnboarding';
import { BuyerOnboarding } from './pages/buyers/BuyerOnboarding';
import { DriverOnboarding } from './pages/drivers/DriverOnboarding';
import { SellerDashboard } from './pages/sellers/SellerDashboard';
import { SellerProfile } from './pages/sellers/SellerProfile';
import { SellerBuyerDetail } from './pages/sellers/SellerBuyerDetail';
import { SellerDriverDetail } from './pages/sellers/SellerDriverDetail';
import { SellerLogisticsPage } from './pages/sellers/SellerLogisticsPage';
import { BuyerDashboard } from './pages/buyers/BuyerDashboard';
import { BuyerSellersPage } from './pages/buyers/BuyerSellersPage';
import { BuyerSellerDetail } from './pages/buyers/BuyerSellerDetail';
import { BuyerProfile } from './pages/buyers/BuyerProfile';
import { BuyerLogisticsDetail } from './pages/buyers/BuyerLogisticsDetail';
import { PaymentSuccessPage } from './pages/buyers/PaymentSuccessPage';
import { DriverDashboard } from './pages/drivers/DriverDashboard';
import { DriverProfile } from './pages/drivers/DriverProfile';
import { DriverJobDetail } from './pages/drivers/DriverJobDetail';
import { DriverSellerHistory } from './pages/drivers/DriverSellerHistory';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/get-started" element={<RoleSelection />} />
            <Route path="/seller/onboarding" element={<SellerOnboarding />} />
            <Route path="/buyer/onboarding" element={<BuyerOnboarding />} />
            <Route path="/driver/onboarding" element={<DriverOnboarding />} />
            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute requiredRole="SELLER">
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/profile"
              element={
                <ProtectedRoute requiredRole="SELLER">
                  <SellerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/buyers/detail"
              element={
                <ProtectedRoute requiredRole="SELLER">
                  <SellerBuyerDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/drivers/detail"
              element={
                <ProtectedRoute requiredRole="SELLER">
                  <SellerDriverDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/logistics"
              element={
                <ProtectedRoute requiredRole="SELLER">
                  <SellerLogisticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/dashboard"
              element={
                <ProtectedRoute requiredRole="BUYER">
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/sellers"
              element={
                <ProtectedRoute requiredRole="BUYER">
                  <BuyerSellersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/seller/detail"
              element={
                <ProtectedRoute requiredRole="BUYER">
                  <BuyerSellerDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/profile"
              element={
                <ProtectedRoute requiredRole="BUYER">
                  <BuyerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/logistics/detail"
              element={
                <ProtectedRoute requiredRole="BUYER">
                  <BuyerLogisticsDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/success"
              element={
                <ProtectedRoute requiredRole="BUYER">
                  <PaymentSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/dashboard"
              element={
                <ProtectedRoute requiredRole="DRIVER">
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/profile"
              element={
                <ProtectedRoute requiredRole="DRIVER">
                  <DriverProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/jobs/detail"
              element={
                <ProtectedRoute requiredRole="DRIVER">
                  <DriverJobDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/seller/history"
              element={
                <ProtectedRoute requiredRole="DRIVER">
                  <DriverSellerHistory />
                </ProtectedRoute>
              }
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
