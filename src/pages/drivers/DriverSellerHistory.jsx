import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Search, Archive, Truck, Settings2,
  CalendarDays, ChevronLeft, ChevronRight, Loader2, AlertCircle, MapPin,
} from 'lucide-react';
import { DriverNav } from '../../components/DriverNav';
import { useDriverTrades } from '../../hooks/useProfile';

/* ── helpers ── */
const STATUS_STYLE = {
  CREATED:         { dot: 'bg-amber-500',  text: 'text-amber-600',  bg: 'bg-amber-50'   },
  BUYER_JOINED:    { dot: 'bg-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-50'  },
  DRIVER_PENDING:  { dot: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50'  },
  DRIVER_ASSIGNED: { dot: 'bg-cyan-500',   text: 'text-cyan-600',   bg: 'bg-cyan-50'    },
  ACTIVE:          { dot: 'bg-blue-500',   text: 'text-blue-600',   bg: 'bg-blue-50'    },
  IN_TRANSIT:      { dot: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50'  },
  DELIVERED:       { dot: 'bg-green-500',  text: 'text-green-600',  bg: 'bg-green-50'   },
  COMPLETED:       { dot: 'bg-green-500',  text: 'text-green-600',  bg: 'bg-green-50'   },
  FLAGGED:         { dot: 'bg-red-500',    text: 'text-red-600',    bg: 'bg-red-50'     },
};

const PAGE_SIZE = 10;

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-6 py-5 flex items-start justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
        <p className="text-4xl font-black text-slate-900">{value.toLocaleString()}</p>
      </div>
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-slate-500" />
      </div>
    </div>
  );
}

/* ── Page ── */
export function DriverSellerHistory() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const seller    = location.state ?? {};

  const [activeTab, setActiveTab] = useState('sellers');
  const [search, setSearch]       = useState('');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [page, setPage]           = useState(1);

  const { data, isLoading, error } = useDriverTrades();

  /* Filter to only this seller's trades */
  const sellerTrades = useMemo(() => {
    const all = data?.dashboardRecords ?? [];
    return all.filter((t) => t.sellerName === seller.sellerName);
  }, [data, seller.sellerName]);

  /* Stats */
  const totalDeliveries  = sellerTrades.length;
  const activeShipments  = sellerTrades.filter((t) => ['ACTIVE', 'IN_TRANSIT', 'BUYER_JOINED'].includes(t.tradeStatus)).length;
  const totalDelivered   = sellerTrades.filter((t) => ['DELIVERED', 'COMPLETED'].includes(t.tradeStatus)).length;

  /* Filter by search + date */
  const filtered = useMemo(() => {
    return sellerTrades.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        t.tradeId?.toLowerCase().includes(q) ||
        t.buyerName?.toLowerCase().includes(q) ||
        t.goods?.toLowerCase().includes(q);
      const matchFrom = !dateFrom || (t.deliveryDate && t.deliveryDate >= dateFrom);
      const matchTo   = !dateTo   || (t.deliveryDate && t.deliveryDate <= dateTo);
      return matchSearch && matchFrom && matchTo;
    });
  }, [sellerTrades, search, dateFrom, dateTo]);

  /* Paginate */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function pageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  }

  const handleTabChange = (tabId) =>
    navigate('/driver/dashboard', { state: { activeTab: tabId } });

  return (
    <div className="min-h-screen bg-slate-50">
      <DriverNav activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sellers Directory
        </button>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Trade History — {seller.sellerName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive overview of all escrow transactions and delivery records.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard label="Total Deliveries"  value={totalDeliveries} icon={Archive}   />
          <StatCard label="Active Shipments"  value={activeShipments} icon={Truck}     />
          <StatCard label="Total Delivered"   value={totalDelivered}  icon={Settings2} />
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Search + date filter */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by Trade ID or Buyer Name..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition text-slate-600"
              />
              <span className="text-slate-400 text-xs">–</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition text-slate-600"
              />
              <button className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition flex-shrink-0">
                <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="9" y1="18" x2="3" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin text-red-600" />
            </div>
          ) : error ? (
            <div className="m-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">Failed to load trade history. Please refresh.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/40">
                    <th className="text-left py-3 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trade ID</th>
                    <th className="text-left py-3 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Goods Name</th>
                    <th className="text-left py-3 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Buyer Name</th>
                    <th className="text-left py-3 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="text-left py-3 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="py-3 px-5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <Archive className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">No trades found for this seller.</p>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((trade) => {
                      const style = STATUS_STYLE[trade.tradeStatus] ?? { dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50', label: trade.tradeStatus };
                      return (
                        <tr key={trade.tradeId} className="hover:bg-slate-50/60 transition group">
                          <td className="py-4 px-5">
                            <span className="text-xs font-black text-slate-500 font-mono uppercase group-hover:text-red-600 transition-colors">
                              {trade.tradeId?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-sm text-slate-700">{trade.goods}</td>
                          <td className="py-4 px-5 text-sm text-slate-700">{trade.buyerName}</td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <span>{trade.deliveryDate || '—'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                              {trade.tradeStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => navigate('/driver/jobs/detail', { state: trade })}
                              className="text-xs font-bold text-slate-500 hover:text-red-600 uppercase tracking-wide transition"
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
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-5 border-t border-slate-100 bg-slate-50/30">
            <p className="text-sm text-slate-500">
              Showing{' '}
              <span className="font-bold text-slate-700">
                {paginated.length > 0
                  ? `${(page - 1) * PAGE_SIZE + 1} to ${Math.min(page * PAGE_SIZE, filtered.length)}`
                  : '0'}
              </span>{' '}
              of <span className="font-bold text-slate-700">{filtered.length}</span> results
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {pageNumbers().map((pg, idx) =>
                pg === '...' ? (
                  <span key={`e-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">…</span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition ${
                      page === pg
                        ? 'bg-slate-900 text-white border border-slate-900'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pg}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
