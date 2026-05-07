import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Loader2,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

const SELLERS_PAGE_SIZE = 8;

export function BuyerSellerDirectory({ records, isLoading, error }) {
  const navigate = useNavigate();
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

      return { sellerName, sellerPhone, totalTrades, totalAmount, lastDelivery, trades };
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
                            <a 
                              href={`tel:${row.sellerPhone}`}
                              className="text-xs text-slate-400 font-mono hover:text-red-600 transition"
                            >
                              {row.sellerPhone}
                            </a>
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
                          onClick={() => navigate('/buyer/seller/detail', { state: row })}
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
