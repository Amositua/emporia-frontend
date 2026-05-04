import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleSelection } from './pages/RoleSelection';
import { SellerOnboarding } from './pages/SellerOnboarding';
import { BuyerOnboarding } from './pages/BuyerOnboarding';
import { DriverOnboarding } from './pages/DriverOnboarding';
import { SellerDashboard } from './pages/SellerDashboard';
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
                <ProtectedRoute requiredRole="seller">
                  <SellerDashboard />
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
