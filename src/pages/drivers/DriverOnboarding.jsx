import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDriverLogin } from '../../hooks/useProfile';
import { Lock, Circle as HelpCircle, Shield, ArrowLeft } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export function DriverOnboarding() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    businessName: '',
    linkCode: '',
  });
  const [error, setError] = useState('');

  const loginMutation = useDriverLogin();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      // Strip 'DRV-' if present, as the input field already includes it visually
      const code = codeParam.startsWith('DRV-') 
        ? codeParam.substring(4) 
        : codeParam;
      
      setFormData(prev => ({
        ...prev,
        linkCode: code
      }));
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.businessName.trim()) {
      setError('Business name is required');
      return false;
    }
    // if (!formData.linkCode.trim()) {
    //   setError('Link code is required');
    //   return false;
    // }
    // if (formData.linkCode.length !== 6) {
    //   setError('Link code must be 6 digits');
    //   return false;
    // }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const result = await loginMutation.mutateAsync({
        phoneNumber: formData.phoneNumber,
        businessName: formData.businessName,
        linkCode: formData.linkCode.trim() ? `DRV-${formData.linkCode}` : '',
      });

      login({ role: 'driver', ...result });
      console.log('result', result);
      setFormData({ phoneNumber: '', businessName: '', linkCode: '' });

      navigate('/driver/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to complete onboarding');
    }
  };

  const isLoading = loginMutation.isPending;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-6 relative">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="max-w-lg w-full">
          <div className="flex items-start gap-8">
            {/* <div className="hidden lg:block w-1.5 bg-red-600 h-72 rounded-l-lg"></div> */}

            <div className="flex-1 bg-white rounded-lg shadow-lg p-5 md:p-7 border-l-4 border-red-600">
              <div className="flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-red-600" />
              </div>

              <h1 className="text-2xl font-bold text-center mb-2 text-slate-900">
                Secure Your Driver Profile
              </h1>

              <p className="text-center text-slate-600 mb-4 text-sm">
                Connect with sellers and begin verifying B2B deliveries.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+234 ----------"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    BUSINESS NAME
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Enter your business or institution name"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      6-DIGIT LINK CODE
                    </label>
                    <span className="text-xs font-bold text-red-600">REQUIRED</span>
                  </div>
                    <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-semibold">
                      DRV-
                    </span>
                  <input 
                    type="text"
                    name="linkCode"
                    value={formData.linkCode}
                    onChange={handleInputChange}
                    placeholder="0 0 0 0 0 0"
                    maxLength="6"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-center tracking-widest"
                    disabled={isLoading}
                  />
                  </div>
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

                <div className="flex items-center justify-center gap-2 pt-2 text-teal-600">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-semibold">
                    BANK-GRADE ENCRYPTION ACTIVE
                  </span>
                </div>
              </form>

              <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200 flex gap-3">
                <HelpCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600">
                  Need help finding your link code? Contact your business
                  administrator to generate a secure key for your vehicle profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
