import { useState } from 'react';
import { Link, Copy, Check, Loader2 } from 'lucide-react';
import { useCreateTrade } from '../../hooks/useProfile';

export function SellerTradeTab() {
  const [formData, setFormData] = useState({
    goodsType: '',
    quantity: '',
    amount: '',
    deliveryDate: '',
    deliveryTime: '',
  });
  const [tradeResult, setTradeResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const createTradeMutation = useCreateTrade();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.goodsType.trim()) { setError('Goods name is required'); return false; }
    if (!formData.quantity || isNaN(formData.quantity) || Number(formData.quantity) <= 0) {
      setError('A valid quantity is required'); return false;
    }
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      setError('A valid amount is required'); return false;
    }
    if (!formData.deliveryDate) { setError('Delivery date is required'); return false; }
    if (!formData.deliveryTime) { setError('Delivery time is required'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    console.log(formData);
    try {
      const result = await createTradeMutation.mutateAsync({
        goodsType: formData.goodsType,
        quantity: Number(formData.quantity),
        amount: Number(formData.amount),
        deliveryDate: formData.deliveryDate,
        deliveryTime: formData.deliveryTime.length === 5 ? `${formData.deliveryTime}:00` : formData.deliveryTime,
      });
      console.log(result);
      setTradeResult(result);
      setFormData({ goodsType: '', quantity: '', amount: '', deliveryDate: '', deliveryTime: '' });
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create trade. Please try again.');
    }
  };

  const handleCopy = () => {
    if (tradeResult?.deepLinkUrl) {
      navigator.clipboard.writeText(tradeResult.deepLinkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isLoading = createTradeMutation.isPending;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">New Escrow Trade</h1>
        <p className="text-slate-500">
          Initiate a secure B2B transaction with guaranteed institutional-grade escrow protection.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* LEFT — Form Sections */}
          <div className="space-y-6">
            {/* Trade Identity */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-red-600 rounded-full" />
                <h2 className="text-lg font-bold text-slate-900">Trade Identity</h2>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Goods Name
                </label>
                <input
                  type="text"
                  name="goodsType"
                  value={formData.goodsType}
                  onChange={handleInputChange}
                  placeholder="Product name"
                  disabled={isLoading}
                  className="w-full max-w-xs px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
              </div>
            </div>

            {/* Logistics & Quantity */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-red-600 rounded-full" />
                <h2 className="text-lg font-bold text-slate-900">Logistics & Quantity</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="any"
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="any"
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Delivery Time
                  </label>
                  <input
                    type="time"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                    step="1"
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 text-base shadow-lg shadow-red-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Trade...
                </>
              ) : (
                'Generate Trade Link'
              )}
            </button>
          </div>

          {/* RIGHT — Trade Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky top-20">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Trade Overview</h3>
            <div className="h-px bg-slate-100 mb-5" />

            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expiry</span>
              <span className="font-bold text-slate-900 text-sm">48 Hours after creation</span>
            </div>

            <div className="mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Shareable Trade Link
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={tradeResult?.deepLinkUrl || ''}
                  placeholder="app.emporia.trade/escrow/tr..."
                  className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-600 bg-slate-50 focus:outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!tradeResult?.deepLinkUrl}
                  title="Copy link"
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition flex-shrink-0 ${
                    tradeResult?.deepLinkUrl
                      ? 'bg-slate-900 hover:bg-slate-700 text-white cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                This link allows buyers to view and accept your trade terms securely.
              </p>
            </div>

            {tradeResult && (
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-2">
                {/* <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Trade ID</span>
                  <span className="font-bold text-slate-900">{tradeResult.tradeId}</span>
                </div> */}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Invite Code</span>
                  <span className="font-bold text-red-600 tracking-widest">{tradeResult.inviteCode}</span>
                </div>
                {/* <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase">
                    {tradeResult.paymentStatus}
                  </span>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
