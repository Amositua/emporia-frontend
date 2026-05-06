import { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Users,
  Settings2,
  Loader2,
  AlertCircle,
  Search,
  SlidersHorizontal,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { BuyerNav } from '../../components/BuyerNav';
import { useAuth } from '../../context/AuthContext';
import { useBuyerTrades } from '../../hooks/useProfile';

/* ── helpers ── */
function formatAmount(val) {
  if (val == null) return '—';
  return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

const STATUS_STYLES = {
  ACTIVE:       'bg-blue-100 text-blue-700',
  BUYER_JOINED: 'bg-indigo-100 text-indigo-700',
  IN_TRANSIT:   'bg-amber-100 text-amber-700',
  DELIVERED:    'bg-green-100 text-green-700',
  COMPLETED:    'bg-green-100 text-green-700',
  CANCELLED:    'bg-red-100 text-red-700',
  PENDING:      'bg-slate-100 text-slate-600',
};

function statusLabel(status = '') {
  return status.replace(/_/g, ' ');
}

const PAGE_SIZE = 8;
const SELLERS_PAGE_SIZE = 8;

/* ── derive initials from name ── */
function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/* ── Sellers Directory ── */
function BuyerSellerDirectory({ records, isLoading, error }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  /* group by sellerName */
  const sellerRows = useMemo(() => {
    const map = new Map();
    records.forEach((trade) => {
      const key = trade.sellerName;
      if (!map.has(key)) {
        map.set(key, {
          sellerName: trade.sellerName,
          sellerPhone: trade.sellerPhone,
          trades: [],
        });
      }
      map.get(key).trades.push(trade);
    });

    return Array.from(map.values()).map(({ sellerName, sellerPhone, trades }) => {
      const totalTrades = trades.length;
      const totalAmount = trades.reduce((s, t) => s + (t.totalAmount ?? t.amount ?? 0), 0);

      /* last delivery: DELIVERED trades sorted descending by date, pick the closest */
      const deliveredTrades = trades
        .filter((t) => t.tradeStatus === 'DELIVERED')
        .sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate));
      const lastDelivery = deliveredTrades.length > 0 ? deliveredTrades[0].deliveryDate : null;

      return { sellerName, sellerPhone, totalTrades, totalAmount, lastDelivery };
    });
  }, [records]);

  /* search filter */
  const filtered = useMemo(() => {
    if (!search.trim()) return sellerRows;
    const q = search.toLowerCase();
    return sellerRows.filter((r) => r.sellerName?.toLowerCase().includes(q));
  }, [sellerRows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / SELLERS_PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * SELLERS_PAGE_SIZE, page * SELLERS_PAGE_SIZE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Sellers Directory</h1>
        <p className="text-sm text-slate-500">
          Manage and discover verified institutional partners within the EscrowPay ecosystem. All
          sellers listed have passed rigorous institutional compliance and background checks.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by seller name..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex items-center gap-3 m-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Failed to load seller records. Please refresh.</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['SELLER NAME', 'TOTAL TRADES', 'TOTAL AMOUNT', 'LAST DELIVERY', 'ACTIONS'].map((col) => (
                    <th
                      key={col}
                      className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
                      {search ? 'No sellers match your search.' : 'No sellers found.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((row) => (
                    <tr
                      key={row.sellerName}
                      className="border-b border-slate-100 hover:bg-slate-50/60 transition"
                    >
                      {/* Seller Name with avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-slate-600">
                              {getInitials(row.sellerName)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{row.sellerName}</p>
                            <p className="text-xs text-slate-400 font-mono">{row.sellerPhone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Total Trades */}
                      <td className="py-4 px-6 text-sm font-semibold text-slate-900">
                        {row.totalTrades.toLocaleString()}
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-900 text-sm font-mono">
                          {formatAmount(row.totalAmount)}
                        </span>
                      </td>

                      {/* Last Delivery */}
                      <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                        {row.lastDelivery ? formatDate(row.lastDelivery) : <span className="text-slate-400">—</span>}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <button
                          className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer / Pagination */}
        {!isLoading && !error && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing {paginated.length} of {filtered.length} seller{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                      page === p
                        ? 'bg-red-600 text-white border border-red-600'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, sub, subGreen }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-start justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
        {sub && (
          <p className={`text-xs font-medium ${subGreen ? 'text-blue-600' : 'text-slate-500'}`}>
            {sub}
          </p>
        )}
      </div>
      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);

  const { user } = useAuth();
  const { data, isLoading, error } = useBuyerTrades();
  console.log("iis", data);
  const records      = data?.dashboardRecords ?? [];
  const totalTrades  = data?.totalTrades ?? 0;

  /* derive stats from live data */
  const activeTrades    = records.filter((r) => r.tradeStatus !== 'DELIVERED' && r.tradeStatus !== 'COMPLETED' && r.tradeStatus !== 'CANCELLED');
  const completedTrades = records.filter((r) => r.tradeStatus === 'DELIVERED' || r.tradeStatus === 'COMPLETED');
  const uniqueSellers   = [...new Set(records.map((r) => r.sellerPhone))].length;
  const totalReleased   = completedTrades.reduce((s, r) => s + (r.amountReleased ?? 0), 0);

  /* search filter */
  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(
      (r) =>
        r.sellerName?.toLowerCase().includes(q) ||
        r.tradeId?.toLowerCase().includes(q) ||
        r.goods?.toLowerCase().includes(q)
    );
  }, [records, search]);

  /* pagination */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <BuyerNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Overview tab ── */}
        {activeTab === 'overview' && (
          <>
            {/* Header */}
            <div className="mb-8">
              <p className="text-sm font-medium text-slate-500 mb-1">
                Welcome back,{' '}
                <span className="font-semibold text-slate-700">
                  {user?.businessName || user?.phoneNumber || 'Buyer'}
                </span>
              </p>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Purchase Management</h1>
              <p className="text-slate-500 text-sm">
                Oversee your active B2B escrow transactions and institutional procurement.
              </p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-5 mb-8">
              <div className="bg-white border border-l-4 border-l-red-500 border-slate-200 rounded-xl p-6 flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Active Purchase
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mb-1">{activeTrades.length}</p>
                  <p className="text-xs font-medium text-blue-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{activeTrades.length} since last month
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 text-slate-500" />
                </div>
              </div>

              <StatCard
                icon={Users}
                label="Total Sellers"
                value={uniqueSellers || totalTrades}
                sub="Institutional partners"
              />

              <StatCard
                icon={Settings2}
                label="Completed Purchase"
                value={totalReleased > 0 ? formatAmount(totalReleased) : completedTrades.length}
                sub="Successfully released"
                subGreen
              />
            </div>

            {/* Active Purchases table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 gap-4 flex-wrap">
                <h2 className="font-bold text-slate-900 text-base">Active Purchases</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={handleSearch}
                      placeholder="Filter trade details..."
                      className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-48"
                    />
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filter
                  </button>
                </div>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                </div>
              )}

              {/* Error */}
              {error && !isLoading && (
                <div className="flex items-center gap-3 m-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">Failed to load trade records. Please refresh.</p>
                </div>
              )}

              {/* Table */}
              {!isLoading && !error && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {['SELLER NAME', 'TRADE ID', 'GOODS', 'AMOUNT', 'DELIVERY DATE', 'PROTOCOL STATUS'].map((col) => (
                          <th
                            key={col}
                            className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                            {search ? 'No trades match your search.' : 'No active purchases yet.'}
                          </td>
                        </tr>
                      ) : (
                        paginated.map((trade) => (
                          <tr
                            key={trade.tradeId}
                            className="border-b border-slate-100 hover:bg-slate-50/60 transition"
                          >
                            {/* Seller Name */}
                            <td className="py-4 px-6">
                              <p className="font-semibold text-slate-900 text-sm">{trade.sellerName}</p>
                              <p className="text-xs text-slate-400 font-mono">{trade.sellerPhone}</p>
                            </td>

                            {/* Trade ID */}
                            <td className="py-4 px-6">
                              <span className="text-xs font-mono text-slate-400 tracking-wide">
                                {trade.tradeId?.toUpperCase()}
                              </span>
                            </td>

                            {/* Goods */}
                            <td className="py-4 px-6 text-sm text-slate-700 max-w-[220px]">
                              {trade.goods}
                            </td>

                            {/* Amount */}
                            <td className="py-4 px-6">
                              <span className="font-semibold text-slate-900 text-sm font-mono">
                                {formatAmount(trade.amount)}
                              </span>
                            </td>

                            {/* Delivery Date */}
                            <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                              {formatDate(trade.deliveryDate)}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-6">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                  STATUS_STYLES[trade.tradeStatus] ?? 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {statusLabel(trade.tradeStatus)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer */}
              {!isLoading && !error && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Showing {paginated.length} of {filtered.length} active purchases
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-40 transition"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="text-xs font-semibold text-slate-800 hover:text-slate-900 disabled:opacity-40 transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Sellers tab ── */}
        {activeTab === 'sellers' && (
          <BuyerSellerDirectory records={records} isLoading={isLoading} error={error} />
        )}

        {/* ── Other tabs ── */}
        {activeTab !== 'overview' && activeTab !== 'sellers' && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-base">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} section coming soon
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16 py-6 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
          © 2024 EscrowProtocol. All Institutional Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
