import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ShieldCheck, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Gem, X, Calendar, Clock, Phone, MapPin
} from 'lucide-react';
import { SellerNav } from '../../components/SellerNav';
import { useSellerTrades, useCreateTrade } from '../../hooks/useProfile';

/* ── Status badge map ── */
const STATUS_STYLE = {
  CREATED:         { color: 'bg-amber-100 text-amber-700'  },
  BUYER_JOINED:    { color: 'bg-indigo-100 text-indigo-700' },
  DRIVER_PENDING:  { color: 'bg-purple-100 text-purple-700' },
  DRIVER_ASSIGNED: { color: 'bg-cyan-100 text-cyan-700'   },
  ACTIVE:          { color: 'bg-blue-100 text-blue-700'    },
  IN_TRANSIT:      { color: 'bg-orange-100 text-orange-700'},
  DELIVERED:       { color: 'bg-green-100 text-green-700'  },
  COMPLETED:       { color: 'bg-green-100 text-green-700'  },
  FLAGGED:         { color: 'bg-red-100 text-red-700'      },
};

const PAGE_SIZE = 5;

function formatAmount(amount) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000)     return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
  });
}

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

/* ── Trade with Buyer Modal ── */
function TradeWithBuyerModal({ buyerName, buyerPhone, onClose, onSuccess }) {
  const createTradeMutation = useCreateTrade();

  const [formData, setFormData] = useState({
    goodsType: '',
    quantity: '',
    amount: '',
    deliveryDate: '',
    deliveryTime: '',
    buyerName: buyerName || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!formData.goodsType.trim())    { setError('Goods name is required'); return false; }
    if (!formData.quantity || isNaN(formData.quantity) || Number(formData.quantity) <= 0) {
      setError('A valid quantity is required'); return false;
    }
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      setError('A valid amount is required'); return false;
    }
    if (!formData.deliveryDate)  { setError('Delivery date is required'); return false; }
    if (!formData.deliveryTime)  { setError('Delivery time is required'); return false; }
    if (!formData.buyerName.trim()) { setError('Buyer name is required'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createTradeMutation.mutateAsync({
        goodsType:        formData.goodsType,
        quantity:         Number(formData.quantity),
        amount:           Number(formData.amount),
        deliveryDate:     formData.deliveryDate,
        deliveryTime:     formData.deliveryTime.length === 5 ? `${formData.deliveryTime}:00` : formData.deliveryTime,
        buyerPhoneNumber: buyerPhone,
        buyerName:        formData.buyerName,
      });
      setSuccess(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to create trade. Please try again.');
    }
  };

  const isLoading = createTradeMutation.isPending;

  const labelCls = 'block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5';
  const inputCls = 'w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-red-600 rounded-full" />
              <h3 className="text-lg font-bold text-slate-900">Trade with Buyer</h3>
            </div>
            <p className="text-xs text-slate-500 pl-3">
              Creating a new escrow trade for{' '}
              <span className="font-semibold text-slate-700">{buyerName}</span>
              {buyerPhone && <span className="font-mono text-slate-500"> · {buyerPhone}</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition flex-shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-slate-900 mb-1">Trade Created!</p>
            <p className="text-sm text-slate-500">Your escrow trade has been successfully initiated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            {/* Goods Type */}
            <div>
              <label className={labelCls}>Goods Type</label>
              <input
                type="text"
                name="goodsType"
                value={formData.goodsType}
                onChange={handleInputChange}
                placeholder="e.g. Industrial Diesel"
                disabled={isLoading}
                className={inputCls}
              />
            </div>

            {/* Quantity & Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="any"
                  disabled={isLoading}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Amount (USD)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="any"
                  disabled={isLoading}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Delivery Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  <Calendar className="w-3 h-3 inline mr-1" />Delivery Date
                </label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  <Clock className="w-3 h-3 inline mr-1" />Delivery Time
                </label>
                <input
                  type="time"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleInputChange}
                  step="1"
                  disabled={isLoading}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Buyer Name */}
            <div>
              <label className={labelCls}>Buyer Name (pre-filled)</label>
              <input
                type="text"
                name="buyerName"
                readOnly
                value={formData.buyerName}
                className={`${inputCls} bg-slate-50 text-slate-500 cursor-not-allowed`}
              />
            </div>

            {/* Buyer phone — pre-filled, read-only */}
            {buyerPhone && (
              <div>
                <label className={labelCls}>Buyer Phone (pre-filled)</label>
                <input
                  type="text"
                  readOnly
                  value={buyerPhone}
                  className={`${inputCls} bg-slate-50 text-slate-500 cursor-not-allowed`}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Trade'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export function SellerBuyerDetail() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [activeTab, setActiveTab] = useState('buyers');
  const [page, setPage]           = useState(1);
  const [showTradeModal, setShowTradeModal] = useState(false);

  const { buyerName, buyerPhone } = location.state ?? {};

  const { data, isLoading, error, refetch } = useSellerTrades();

  const buyerTrades = useMemo(() => {
    const all = data?.dashboardRecords ?? [];
    return all.filter((t) => t.buyerName === buyerName);
  }, [data, buyerName]);

  const tradeCount  = buyerTrades.length;
  const totalValue  = buyerTrades.reduce((sum, t) => sum + (t.amount ?? 0), 0);
  const deliveredTrade = buyerTrades.find((t) => t.tradeStatus === 'DELIVERED');
  const lastDelivery   = deliveredTrade?.deliveryDate ?? null;

  const totalPages = Math.max(1, Math.ceil(tradeCount / PAGE_SIZE));
  const paginated  = buyerTrades.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (tabId) => navigate('/seller/dashboard', { state: { activeTab: tabId } });

  return (
    <div className="min-h-screen bg-slate-50">
      <SellerNav activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Top bar: back + action button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/seller/dashboard', { state: { activeTab: 'buyers' } })}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Buyer Directory
          </button>

          <button
            onClick={() => setShowTradeModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition shadow-md hover:shadow-lg"
          >
            <Gem className="w-4 h-4" />
            Trade with Buyer
          </button>
        </div>

        {/* Buyer Header */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 font-bold text-xl flex-shrink-0 shadow-inner">
            {getInitials(buyerName)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-3xl font-bold text-slate-900">{buyerName || 'Buyer'}</h1>
              <div className="flex items-center gap-1.5 text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                Verified Institution
              </div>
            </div>
            {buyerPhone && (
              <a 
                href={`tel:${buyerPhone}`}
                className="text-slate-500 text-sm hover:text-red-600 transition flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                {buyerPhone}
              </a>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Failed to load trade details. Please try again.</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              <div className="border-l-4 border-red-600 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Total Trades</p>
                <p className="text-5xl font-bold text-slate-900">{tradeCount}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Total Secured Value</p>
                <p className="text-5xl font-bold text-slate-900">{formatAmount(totalValue)}</p>
                <p className="text-xs text-slate-400 mt-2">Aggregated Escrow Volume</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Last Delivery</p>
                <p className="text-3xl font-bold text-slate-900">{formatDate(lastDelivery)}</p>
              </div>
            </div>

            {/* Escrow History Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Escrow History</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trade ID</th>
                      <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Goods</th>
                      <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Delivery</th>
                      <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Address</th>
                      <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trade Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                          No trade records found for this buyer.
                        </td>
                      </tr>
                    ) : (
                      paginated.map((trade) => {
                        const statusStyle = STATUS_STYLE[trade.tradeStatus] ?? { color: 'bg-slate-100 text-slate-600' };
                        return (
                          <tr key={trade.tradeId} className="border-b border-slate-50 hover:bg-slate-50/40 transition">
                            {/* Trade ID */}
                            <td className="py-4 px-6 text-xs font-mono font-bold text-slate-400">
                              #{trade.tradeId?.toUpperCase()}
                            </td>

                            {/* Goods */}
                            <td className="py-4 px-6 text-sm text-slate-800 font-medium">{trade.goods}</td>

                            {/* Amount */}
                            <td className="py-4 px-6 text-sm font-bold text-slate-900">
                              ${trade.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>

                            {/* Estimated Logistics */}
                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span className="font-medium">{trade.deliveryDate || '—'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{trade.deliveryTime || '—'}</span>
                                </div>
                              </div>
                            </td>
                            {/* Delivery Address */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2 text-xs text-slate-600 max-w-[200px]">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span className="truncate" title={trade.deliveryAddress}>{trade.deliveryAddress || 'No address provided'}</span>
                              </div>
                            </td>
                            {/* Trade Status (raw value) */}
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyle.color}`}>
                                {trade.tradeStatus?.replace(/_/g, ' ')}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition ${
                        page === i + 1
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-400">
                  Showing{' '}
                  {paginated.length > 0
                    ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, tradeCount)}`
                    : '0'}{' '}
                  of {tradeCount} results
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Trade with Buyer Modal */}
      {showTradeModal && (
        <TradeWithBuyerModal
          buyerName={buyerName}
          buyerPhone={buyerPhone}
          onClose={() => setShowTradeModal(false)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
