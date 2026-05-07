import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Phone, MapPin,
  Loader2, AlertCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useDriverTrades } from '../../hooks/useProfile';

const PAGE_SIZE = 6;

/* ── SellerCard ── */
function SellerCard({ seller, isFirst, onViewHistory }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col p-5 gap-4 ${isFirst ? 'border-l-4 border-l-red-500' : ''}`}>

      {/* Seller name + address */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-1.5">{seller.sellerName}</h3>
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-slate-500">{seller.address || 'Address not provided'}</span>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact:</span>
          <span className="text-xs text-slate-700 font-medium">{seller.sellerName}</span>
        </div>
        <a 
          href={`tel:${seller.sellerPhone}`}
          className="flex items-center gap-1.5 hover:text-red-600 transition group"
        >
          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0 group-hover:text-red-500" />
          <span className="text-xs font-bold text-slate-700 font-mono group-hover:text-red-600 transition">
            {seller.sellerPhone || '—'}
          </span>
        </a>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA */}
      <button
        onClick={() => onViewHistory(seller)}
        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition shadow-sm"
      >
        View Trades
      </button>
    </div>
  );
}


/* ── Main Component ── */
export function DriverSellersTab() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDriverTrades();
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  /* Group trades by sellerName to produce unique sellers */
  const sellers = useMemo(() => {
    const records = data?.dashboardRecords ?? [];
    const map = new Map();
    for (const trade of records) {
      if (!trade.sellerName) continue;
      if (!map.has(trade.sellerName)) {
        map.set(trade.sellerName, {
          sellerName:  trade.sellerName,
          sellerPhone: trade.sellerPhone,
          address:     trade.deliveryAddress || null,
          trades:      [],
        });
      }
      map.get(trade.sellerName).trades.push(trade);
    }
    return Array.from(map.values()).map((s) => ({ ...s, totalTrades: s.trades.length }));
  }, [data]);

  /* Filter */
  const filtered = useMemo(() => {
    if (!search.trim()) return sellers;
    const q = search.toLowerCase();
    return sellers.filter(
      (s) =>
        s.sellerName.toLowerCase().includes(q) ||
        (s.sellerPhone && s.sellerPhone.includes(q))
    );
  }, [sellers, search]);

  /* Paginate */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  /* Page numbers with ellipsis */
  function pageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  }

  const handleViewHistory = (seller) => {
    navigate('/driver/seller/history', { state: seller });
  };

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
        <p className="text-sm font-medium">Failed to load sellers. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sellers Directory</h1>
        <p className="text-sm text-slate-500 mt-1">Verified institutional partners within the Emporia network.</p>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search by seller name or address..."
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 bg-white shadow-sm transition">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Grid */}
      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center shadow-sm">
          <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">No sellers found.</p>
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1); }}
              className="mt-3 text-red-600 hover:text-red-700 text-sm font-bold transition"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginated.map((seller, idx) => (
            <SellerCard
              key={seller.sellerName}
              seller={seller}
              isFirst={idx === 0 && page === 1}
              onViewHistory={handleViewHistory}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
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
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition shadow-sm ${
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
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
