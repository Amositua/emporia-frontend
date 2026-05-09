import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBuyerLogin } from '../../hooks/useProfile';
import { Lock, Circle as HelpCircle, Shield, ArrowLeft } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export function BuyerOnboarding() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    // countryCode: '+234',
    inviteCode: '',
    personalName: '',
  });
  const [error, setError] = useState('');

  const loginMutation = useBuyerLogin();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const inviteParam = searchParams.get('invite');
    if (inviteParam) {
      // Strip 'EMP-' if present, as the input field already includes it visually
      const code = inviteParam.startsWith('EMP-') 
        ? inviteParam.substring(4) 
        : inviteParam;
      
      setFormData(prev => ({
        ...prev,
        inviteCode: code
      }));
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.personalName.trim()) {
      setError('Personal name is required');
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
// console.log("form data: ", formData);
    try {
      // const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;

      const result = await loginMutation.mutateAsync({
        phoneNumber: formData.phoneNumber,
        inviteCode: formData.inviteCode ? `EMP-${formData.inviteCode}` : undefined,
        personalName: formData.personalName,
      });

      console.log('result', result);

      login({ role: 'buyer', ...result });

      setFormData({ phoneNumber: '', inviteCode: '', personalName: '' });

      navigate('/buyer/dashboard');
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
          onClick={() => navigate('/get-started')} 
          className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="max-w-lg w-full">
          <div className="flex items-start gap-8">
            {/* <div className="hidden lg:block w-1.5 bg-red-600 h-64 rounded-l-lg"></div> */}

            <div className="flex-1 bg-white rounded-lg shadow-lg p-5 md:p-7 border-l-4 border-red-600">
              <div className="flex items-center justify-center gap-2 mb-3 text-teal-600">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-bold">SECURE PROTOCOL</span>
              </div>

              <h1 className="text-2xl font-bold text-center mb-2 text-slate-900">
                Secure Your Buyer Profile
              </h1>

              <p className="text-center text-slate-600 mb-4 text-sm">
                Enter your details to join the Emporia B2B trust network.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    PERSONAL NAME
                  </label>
                  <input
                    type="text"
                    name="personalName"
                    value={formData.personalName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    PHONE NUMBER
                  </label>
                  <div className="flex gap-2">
                    {/* <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      className="px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      disabled={isLoading}
                    >
                      <option value="+234">+234 (NG)</option>
                      <option value="+256">+256 (UG)</option>
                      <option value="+254">+254 (KE)</option>
                    </select> */}
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="000 000 0000"
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      OPTIONAL INVITE CODE
                    </label>
                    <span className="text-xs text-slate-500">6 DIGITS</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 font-semibold">
                      EMP-
                    </span>
                    <input
                      type="text"
                      name="inviteCode"
                      value={formData.inviteCode}
                      onChange={handleInputChange}
                      placeholder="XXXXXX"
                      maxLength="6"
                      className="w-full pl-20 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
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
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Processing...' : 'Complete Onboarding'}
                  {!isLoading && <span>→</span>}
                </button>

                <div className="flex items-center justify-center gap-2 pt-2 text-teal-600">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-semibold">
                    BANK-GRADE ENCRYPTION ACTIVE
                  </span>
                </div>
              </form>

              <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600">
                  Your connection is secured with 256-bit SSL encryption. All data is
                  handled according to our institutional compliance standards.
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
