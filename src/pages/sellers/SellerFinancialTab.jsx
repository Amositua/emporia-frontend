import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Wallet, 
  Lock, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Calendar,
  FileText,
  User,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { useSellerFinancials } from '../../hooks/useProfile';

/* ── Helpers ── */
const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(val || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

const STATUS_CONFIG = {
  ESCROW_FUNDED: { label: 'Settled',   bg: 'bg-emerald-50',  text: 'text-emerald-600',  border: 'border-emerald-100' },
  PARTIAL:       { label: 'Half',      bg: 'bg-blue-50',     text: 'text-blue-600',     border: 'border-blue-100' },
  PENDING:       { label: 'Pending',   bg: 'bg-amber-50',    text: 'text-amber-600',    border: 'border-amber-100' },
  ONE_THIRD:     { label: 'One-Third', bg: 'bg-orange-50',   text: 'text-orange-600',   border: 'border-orange-100' },
};

/* ── Transaction Details Modal ── */
function TransactionModal({ trade, onClose }) {
  if (!trade) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-[3px] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Transaction Details</h2>
            <p className="text-sm text-slate-500 mt-1">Record overview for settlement {trade.tradeId?.toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 grid md:grid-cols-2 gap-8 bg-slate-50/50">
          {/* Transaction Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-500" />
              Transaction Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Trade ID</span>
                <span className="text-xs font-mono font-bold px-2 py-1 bg-slate-100 rounded">{trade.tradeId?.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Total Amount</span>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(trade.totalAmount)}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Payment Status</span>
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  {STATUS_CONFIG[trade.paymentStatus]?.label || trade.paymentStatus || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Trade Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-red-500" />
              Trade Details
            </h3>

            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Goods</p>
                <p className="text-sm font-bold text-slate-700">{trade.goodsType || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Escrow Secured</p>
                <p className="text-sm font-bold text-slate-900">{trade.isEscrowSecured ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-white border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition shadow-lg shadow-slate-200"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Tab Component ── */
export function SellerFinancialTab() {
  const { data, isLoading, error } = useSellerFinancials();
  const [search, setSearch] = useState('');
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;
  const records = data || [];

  const stats = useMemo(() => {
    const total = records.reduce((sum, r) => sum + (r.amountReleased || 0), 0);
    const escrow = 0;
    return { total, escrow };
  }, [records]);

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(r => 
      r.tradeId?.toLowerCase().includes(q) ||
      r.goodsType?.toLowerCase().includes(q)
    );
  }, [records, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Loading financial records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-3xl p-12 text-center max-w-2xl mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900 mb-2">Sync Error</h3>
        <p className="text-red-600/80 mb-6">We couldn't retrieve your financial data from the institutional sales channel.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-sm">Retry Sync</button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Financial Records</h1>
        <p className="text-slate-500 mt-2 max-w-2xl text-lg leading-relaxed">
          Manage settlement history, track funds in custody, and access detailed logs for the institutional sales channel.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border-l-[6px] border-l-red-500 border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Settlements</span>
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900">
            {/* {formatCurrency(stats.total)}</p> */}
            $23400.00
          </p>
        </div>

        <div className="bg-white border-l-[6px] border-l-red-500 border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Funds in Escrow</span>
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <p className="text-4xl font-black text-slate-900">{formatCurrency(stats.escrow)} </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Table Toolbar */}
        <div className="px-8 py-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Settlement History</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by Buyer Name or Trade ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 w-64 transition"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Show: Last 30 Days</span>
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Trade ID</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Goods</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-medium italic">No settlement records found.</td>
                </tr>
              ) : (
                paginated.map((r) => {
                  const status = STATUS_CONFIG[r.paymentStatus] || STATUS_CONFIG.PENDING;
                  
                  return (
                    <tr key={r.tradeId} className="group hover:bg-slate-50/50 transition duration-150">
                      <td className="px-8 py-5">
                        <span className="text-sm font-mono text-slate-600 tracking-tight">
                          {r.tradeId?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-700">
                          {r.goodsType || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-black text-slate-900">{formatCurrency(r.totalAmount)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.text} ${status.border}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => setSelectedTrade(r)}
                          className="text-[11px] font-black text-red-500 hover:text-red-700 uppercase tracking-[0.1em] flex items-center gap-1 ml-auto transition group/btn"
                        >
                          View Details
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400">
            Showing <span className="text-slate-900">{paginated.length}</span> of <span className="text-slate-900">{filtered.length}</span> records
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <div className="flex items-center gap-1 px-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${page === i + 1 ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'text-slate-500 hover:bg-white'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionModal 
        trade={selectedTrade} 
        onClose={() => setSelectedTrade(null)} 
      />
    </div>
  );
}
