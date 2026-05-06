import { useState } from 'react';
import { Landmark, X, Building, User, Hash, Loader2 } from 'lucide-react';
import { useSaveBankAccount } from '../hooks/useProfile';

export function BankAccountModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const saveBankMutation = useSaveBankAccount();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.accountNumber.trim()) {
      setError('Account number is required');
      return false;
    }
    if (formData.accountNumber.length < 10) {
      setError('Please enter a valid account number');
      return false;
    }
    if (!formData.accountName.trim()) {
      setError('Account name is required');
      return false;
    }
    if (!formData.bankName.trim()) {
      setError('Bank name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await saveBankMutation.mutateAsync(formData);
      console.log('res', res);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to save bank account details');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="relative p-6 border-b border-slate-100">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <Landmark className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Bank Details</h2>
              <p className="text-sm text-slate-500">Secure your payments node</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {success ? (
            <div className="py-8 text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Landmark className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Details Saved!</h3>
              <p className="text-slate-600">Your bank account has been successfully linked to your seller profile.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                To receive secure B2B payments, please provide your institutional bank account information.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Bank Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="e.g. Guaranty Trust Bank"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm"
                    disabled={saveBankMutation.isPending}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Account Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleInputChange}
                    placeholder="e.g. Federica Logistics"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm"
                    disabled={saveBankMutation.isPending}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Account Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="0123456789"
                    maxLength="10"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm"
                    disabled={saveBankMutation.isPending}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saveBankMutation.isPending}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-2 shadow-lg shadow-slate-200"
              >
                {saveBankMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Securely Save Details'
                )}
              </button>
            </form>
          )}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            Encryption Active • Secure Node Protection
          </p>
        </div>
      </div>
    </div>
  );
}
