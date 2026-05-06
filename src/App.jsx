import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleSelection } from './pages/RoleSelection';
import { SellerOnboarding } from './pages/sellers/SellerOnboarding';
import { BuyerOnboarding } from './pages/buyers/BuyerOnboarding';
import { DriverOnboarding } from './pages/drivers/DriverOnboarding';
import { SellerDashboard } from './pages/sellers/SellerDashboard';
import { SellerProfile } from './pages/sellers/SellerProfile';
import { SellerBuyerDetail } from './pages/sellers/SellerBuyerDetail';
import { BuyerDashboard } from './pages/buyers/BuyerDashboard';
import { DriverDashboard } from './pages/drivers/DriverDashboard';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RoleSelection />} />
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
              path="/buyer/dashboard"
              element={
                <ProtectedRoute requiredRole="BUYER">
                  <BuyerDashboard />
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
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
