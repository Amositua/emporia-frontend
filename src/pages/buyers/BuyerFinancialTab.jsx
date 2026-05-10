import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  ShieldCheck,
  Building2,
  Package,
  BarChart2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Wallet,
} from 'lucide-react';
import { useBuyerFinancials } from '../../hooks/useProfile';

/* ── Helpers ── */
const fmt = (val) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(val || 0);

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const STATUS_CFG = {
  ESCROW_FUNDED: { label: 'PAID',    bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  PARTIAL:       { label: 'PARTIAL', bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  PENDING:       { label: 'PENDING', bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200' },
};

/* ── Transaction Detail Modal ── */
function TransactionModal({ record, onClose }) {
  if (!record) return null;

  const status = STATUS_CFG[record.paymentStatus] || STATUS_CFG.PENDING;
  const txnId  = `TXN-${record.tradeId?.toUpperCase() || '—'}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-[3px] p-4">
      <div className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{txnId}</h2>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${status.bg} ${status.text} ${status.border}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {status.label}
            </span>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm">
              <Download className="w-3.5 h-3.5" />
              Download Receipt
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="p-8 grid md:grid-cols-3 gap-6">
          {/* Transaction Details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-red-500" />
              </div>
              Transaction Details
            </h3>
            <div className="space-y-4 pt-1">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Settlement Amount</p>
                <p className="text-2xl font-black text-slate-900">{fmt(record.amountReleased || record.totalAmount)} <span className="text-sm text-slate-400 font-medium">USD</span></p>
              </div>

            </div>
          </div>

          {/* Trade Details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-red-500" />
              </div>
              Trade Details
            </h3>
            <div className="space-y-4 pt-1">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">Trade Identifier</p>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-700">{record.tradeId?.toUpperCase() || '—'}</span>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Goods</p>
                <p className="text-sm font-bold text-slate-900">{record.goodsType || '—'}</p>
              </div>
            </div>
          </div>

          {/* Escrow Status */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-red-500" />
              </div>
              Escrow Info
            </h3>
            <div className="space-y-4 pt-1">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Escrow Secured</p>
                <p className={`text-sm font-black ${record.isEscrowSecured ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {record.isEscrowSecured ? '✓ Yes — Funds Protected' : '✗ No — Funds Not Secured'}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Payment Status</p>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.text} ${status.border}`}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export function BuyerFinancialTab() {
  const { data, isLoading, error, refetch } = useBuyerFinancials();
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);
  const [page, setPage]           = useState(1);
  const PAGE_SIZE = 8;

  const records = useMemo(() => data || [], [data]);

  const stats = useMemo(() => ({
    total:  records.reduce((s, r) => s + (r.totalAmount || 0), 0),
    escrow: 0,
  }), [records]);

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(r =>
      r.tradeId?.toLowerCase().includes(q) ||
      r.goodsType?.toLowerCase().includes(q)
    );
  }, [records, search]);

  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start      = (page - 1) * PAGE_SIZE + 1;
  const end        = Math.min(page * PAGE_SIZE, filtered.length);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Syncing payment records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-3xl p-14 text-center max-w-xl mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900 mb-2">Sync Error</h3>
        <p className="text-sm text-red-600/80 mb-6">We couldn't retrieve your payment history from the escrow settlement channel.</p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition"
        >
          Retry Sync
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Payment History</h1>
        <p className="text-slate-500 mt-2 text-lg">Track your B2B escrow disbursements and historical trade volumes.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border-l-[5px] border-l-red-500 border border-slate-200 rounded-2xl px-8 py-7 shadow-sm hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5" />
              Total Procurement Volume
            </span>
          </div>
          <p className="text-4xl font-black text-slate-900">{fmt(stats.total)}</p>
        </div>

        <div className="bg-white border-l-[5px] border-l-red-500 border border-slate-200 rounded-2xl px-8 py-7 shadow-sm hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              Funds in Escrow
            </span>
          </div>
          <p className="text-4xl font-black text-slate-900">{fmt(stats.escrow)}</p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Seller Name/Trade ID"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 w-72 transition shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition shadow-sm">
            <span className="text-xs">📅</span> Last 30 Days
            <ChevronRight className="w-3.5 h-3.5 rotate-90" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition shadow-sm">
            <Filter className="w-4 h-4" /> More Filters
          </button>
          <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition shadow-sm">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Trade ID</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Goods</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center text-slate-400 italic text-sm">No payment records found.</td>
              </tr>
            ) : (
              paginated.map((r) => {
                const status = STATUS_CFG[r.paymentStatus] || STATUS_CFG.PENDING;
                return (
                  <tr key={r.tradeId} className="group hover:bg-slate-50/60 transition duration-150">
                    <td className="px-8 py-5">
                      <span className="text-xs font-mono text-slate-600 transition">
                        {r.tradeId?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-700">{r.goodsType || '—'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-slate-900">{fmt(r.totalAmount)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.text} ${status.border}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => setSelected(r)}
                        className="text-[11px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">
            Showing {filtered.length ? `${start} to ${end}` : '0'} of {filtered.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      <TransactionModal record={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
