import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSellerLogin } from '../hooks/useProfile';
import { Lock, Circle as HelpCircle, Shield, Building2 } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function SellerOnboarding() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    businessName: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');

  const loginMutation = useSellerLogin();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.businessName.trim()) {
      setError('Business name is required');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await loginMutation.mutateAsync({
        phoneNumber: formData.phoneNumber,
        businessName: formData.businessName,
      });
      console.log(result);
      login({ role: 'seller', ...result });

      setFormData({ businessName: '', phoneNumber: '' });

      navigate('/seller/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to complete onboarding');
    }
  };

  const isLoading = loginMutation.isPending;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-6">
        <div className="max-w-lg w-full">
          <div className="flex items-start gap-8">
            <div className="hidden lg:block w-1.5 bg-red-600 h-64 rounded-l-lg"></div>

            <div className="flex-1 bg-white rounded-lg shadow-lg p-5 md:p-7">
              <div className="flex items-center justify-center gap-2 mb-3 text-teal-600">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-bold">BANK-GRADE ENCRYPTION ACTIVE</span>
              </div>

              <div className="flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-red-600" />
              </div>

              <h1 className="text-2xl font-bold text-center mb-2 text-slate-900">
                Set Up Your Seller Profile
              </h1>

              <p className="text-center text-slate-600 mb-4 text-sm">
                Complete your institutional profile to start receiving secure escrow payments globally.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    BUSINESS NAME
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="Enter registered business name"
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+234 000 000 0000"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    disabled={isLoading}
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Your information is verified against global compliance standards
                    (AML/KYC) to ensure a secure transaction environment for all parties.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 rounded-lg transition duration-200"
                >
                  {isLoading ? 'Processing...' : 'Complete Onboarding'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
