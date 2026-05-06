import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { SellerNav } from '../../components/SellerNav';
import { useSellerTrades } from '../../hooks/useProfile';

const TRADE_STATUS_MAP = {
  BUYER_JOINED: { label: 'Active', color: 'bg-blue-100 text-blue-700' },
  CREATED: { label: 'Awaiting', color: 'bg-amber-100 text-amber-700' },
  FLAGGED: { label: 'Flagged', color: 'bg-red-100 text-red-700' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  IN_TRANSIT: { label: 'In Transit', color: 'bg-orange-100 text-orange-700' },
};

const PAGE_SIZE = 5;

function formatAmount(amount) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
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

export function SellerBuyerDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('buyers');
  const [page, setPage] = useState(1);

  const { buyerName, buyerPhone } = location.state ?? {};

  const { data, isLoading, error } = useSellerTrades();

  // Filter trades that belong to this specific buyer
  const buyerTrades = useMemo(() => {
    const all = data?.dashboardRecords ?? [];
    return all.filter((t) => t.buyerName === buyerName);
  }, [data, buyerName]);

  // Aggregate stats
  const tradeCount = buyerTrades.length;
  const totalValue = buyerTrades.reduce((sum, t) => sum + (t.amount ?? 0), 0);
  const deliveredTrade = buyerTrades.find((t) => t.tradeStatus === 'DELIVERED');
  const lastDelivery = deliveredTrade?.deliveryDate ?? null;

  const totalPages = Math.max(1, Math.ceil(tradeCount / PAGE_SIZE));
  const paginated = buyerTrades.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (tabId) => {
    navigate('/seller/dashboard', { state: { activeTab: tabId } });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SellerNav activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back button */}
        <button
          onClick={() => navigate('/seller/dashboard', { state: { activeTab: 'buyers' } })}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Buyer Directory
        </button>

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
              <p className="text-slate-500 text-sm">{buyerPhone}</p>
            )}
          </div>
        </div>

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
            {/* Stats Cards */}
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

            {/* Escrow History */}
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
                      <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-slate-400 text-sm">
                          No trade records found for this buyer.
                        </td>
                      </tr>
                    ) : (
                      paginated.map((trade) => {
                        const statusInfo = TRADE_STATUS_MAP[trade.tradeStatus] ?? {
                          label: trade.tradeStatus, color: 'bg-slate-100 text-slate-600',
                        };
                        return (
                          <tr key={trade.tradeId} className="border-b border-slate-50 hover:bg-slate-50/40 transition">
                            <td className="py-4 px-6 text-xs font-mono font-bold text-slate-400">
                              #{trade.tradeId?.toUpperCase()}
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-800 font-medium">{trade.goods}</td>
                            <td className="py-4 px-6 text-sm font-bold text-slate-900">
                              ${trade.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                                {statusInfo.label}
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
                  Showing {paginated.length > 0
                    ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, tradeCount)}`
                    : '0'} of {tradeCount} results
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
