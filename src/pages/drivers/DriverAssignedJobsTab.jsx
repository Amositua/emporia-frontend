import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ClipboardList, CalendarDays, CircleCheckBig,
  Loader2, AlertCircle, MapPin, ChevronLeft, ChevronRight,
  TrendingUp, Eye,
} from 'lucide-react';
import { useDriverTrades } from '../../hooks/useProfile';

/* ── helpers ── */
function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

function avatarColor(name = '') {
  const colors = [
    'bg-blue-600', 'bg-purple-600', 'bg-green-600',
    'bg-amber-600', 'bg-rose-600', 'bg-teal-600', 'bg-indigo-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}

function formatTime(timeStr) {
  if (!timeStr) return '—';
  try {
    const [h, m] = timeStr.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const hour12 = hr % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
}

const PAGE_SIZE = 10;

export function DriverAssignedJobsTab() {
  const { data, isLoading, error } = useDriverTrades();

  const navigate = useNavigate();

  const [search, setSearch]       = useState('');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [page, setPage]           = useState(1);
  const [accepted, setAccepted]   = useState({}); // tradeId → true

  const trades = useMemo(() => data?.dashboardRecords ?? [], [data]);

  /* ── derived stats ── */
  const totalAssigned   = trades.length;
  const todayJobs       = trades.filter((t) => isToday(t.deliveryDate)).length;
  const deliveredToday  = trades.filter((t) => t.tradeStatus === 'DELIVERED' && isToday(t.deliveryDate)).length;

  /* ── filter ── */
  const filtered = useMemo(() => {
    return trades.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        t.tradeId?.toLowerCase().includes(q) ||
        t.buyerName?.toLowerCase().includes(q) ||
        t.goods?.toLowerCase().includes(q);

      const matchFrom = !dateFrom || (t.deliveryDate && t.deliveryDate >= dateFrom);
      const matchTo   = !dateTo   || (t.deliveryDate && t.deliveryDate <= dateTo);

      return matchSearch && matchFrom && matchTo;
    });
  }, [trades, search, dateFrom, dateTo]);

  /* ── paginate ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleAccept = (tradeId) => setAccepted((prev) => ({ ...prev, [tradeId]: true }));

  /* ── page numbers ── */
  function pageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">Failed to load assigned jobs. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-slate-900">Assigned Jobs</h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Assigned */}
        <div className="bg-white rounded-xl border-l-4 border-red-600 border border-slate-200 shadow-sm px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Assigned Jobs</p>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <p className="text-5xl font-black text-slate-900 mb-1">{totalAssigned}</p>
          <p className="text-xs text-slate-400">Cumulative assignments</p>
        </div>

        {/* Jobs Today */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Jobs Today</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-5xl font-black text-slate-900 mb-1">{String(todayJobs).padStart(2, '0')}</p>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            <p className="text-xs text-blue-600 font-semibold">Scheduled for today</p>
          </div>
        </div>

        {/* Delivered Today */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Delivered Today</p>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <CircleCheckBig className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-5xl font-black text-slate-900 mb-1">{String(deliveredToday).padStart(2, '0')}</p>
          <p className="text-xs text-slate-400">Completed shipments</p>
        </div>
      </div>

      {/* Worklist Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Active Worklist</h2>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition">
            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="21" y1="6" x2="3" y2="6" /><line x1="15" y1="12" x2="3" y2="12" /><line x1="9" y1="18" x2="3" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search + Date filters */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by buyer name or trade ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition text-slate-600"
            />
            <span className="text-slate-400 text-sm">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition text-slate-600"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40">
                <th className="text-left py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trade ID</th>
                <th className="text-left py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buyer Name</th>
                <th className="text-left py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination</th>
                <th className="text-left py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Goods Name</th>
                <th className="text-left py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scheduled Date</th>
                <th className="text-left py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scheduled Time</th>
                <th className="text-left py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                <th className="text-left py-3 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acceptance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No jobs match your search.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((trade) => {
                  const initials = getInitials(trade.buyerName);
                  const bgColor  = avatarColor(trade.buyerName || '');
                  const isAccepted = accepted[trade.tradeId];
                  return (
                    <tr key={trade.tradeId} className="hover:bg-slate-50/60 transition group">
                      {/* Trade ID */}
                      <td className="py-4 px-5">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors font-mono">
                          #{trade.tradeId?.toUpperCase()}
                        </span>
                      </td>

                      {/* Buyer */}
                      <td className="py-4 px-5">
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{trade.buyerName}</p>
                            {trade.buyerPhone && (
                              <p className="text-[10px] text-slate-400 font-mono">{trade.buyerPhone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="py-4 px-5">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600">{trade.deliveryAddress || '—'}</span>
                        </div>
                      </td>

                      {/* Goods */}
                      <td className="py-4 px-5">
                        <span className="text-sm font-medium text-blue-600">{trade.goods}</span>
                      </td>

                      {/* Scheduled Date */}
                      <td className="py-4 px-5">
                        <span className="text-sm text-slate-700 font-medium">
                          {isToday(trade.deliveryDate) ? (
                            <span className="text-green-600 font-bold">Today</span>
                          ) : trade.deliveryDate || '—'}
                        </span>
                      </td>

                      {/* Scheduled Time */}
                      <td className="py-4 px-5">
                        <span className="text-sm font-bold text-slate-500">
                          {formatTime(trade.deliveryTime)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5">
                        <button
                          onClick={() => navigate('/driver/jobs/detail', { state: trade })}
                          className="flex items-center gap-1.5 text-slate-600 hover:text-red-600 text-xs font-bold uppercase tracking-wide transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                      </td>

                      {/* Acceptance */}
                      <td className="py-4 px-5">
                        {isAccepted || trade.tradeStatus === 'IN_TRANSIT' ? (
                          <span className="px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-700">
                            Accepted
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAccept(trade.tradeId)}
                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wide rounded transition shadow-sm"
                          >
                            Accept
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-5 border-t border-slate-100 bg-slate-50/30">
          <p className="text-sm text-slate-500">
            Showing{' '}
            <span className="font-bold text-slate-700">
              {paginated.length > 0 ? `${(page - 1) * PAGE_SIZE + 1} to ${Math.min(page * PAGE_SIZE, filtered.length)}` : '0'}
            </span>{' '}
            of <span className="font-bold text-slate-700">{filtered.length}</span> results
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-white text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers().map((pg, idx) =>
              pg === '...' ? (
                <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>
              ) : (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition ${
                    page === pg
                      ? 'bg-slate-900 text-white shadow'
                      : 'border border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  {pg}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-white text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
