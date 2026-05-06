import { useState, useMemo } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSellerTrades } from '../../hooks/useProfile';

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-red-100 text-red-700',
  'bg-teal-100 text-teal-700',
];

function avatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
  });
}

export function SellerBuyersTab() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { data, isLoading, error } = useSellerTrades();

  const records = data?.dashboardRecords ?? [];

  // Group trades by buyerName — one row per unique buyer
  const groupedBuyers = useMemo(() => {
    const map = new Map();
    records.forEach((trade) => {
      const name = trade.buyerName ?? 'Unknown Buyer';
      if (!map.has(name)) {
        map.set(name, {
          buyerName: name,
          buyerPhone: trade.buyerPhone,
          trades: [],
        });
      }
      map.get(name).trades.push(trade);
    });

    return Array.from(map.values()).map((buyer) => {
      const tradeCount = buyer.trades.length;
      const securedValue = buyer.trades.reduce((sum, t) => sum + (t.amount ?? 0), 0);
      const deliveredTrade = buyer.trades.find((t) => t.tradeStatus === 'DELIVERED');
      const lastDelivery = deliveredTrade?.deliveryDate ?? null;

      return {
        buyerName: buyer.buyerName,
        buyerPhone: buyer.buyerPhone,
        tradeCount,
        securedValue,
        lastDelivery,
      };
    });
  }, [records]);

  const filtered = useMemo(() => {
    if (!search.trim()) return groupedBuyers;
    return groupedBuyers.filter((b) =>
      b.buyerName.toLowerCase().includes(search.toLowerCase())
    );
  }, [groupedBuyers, search]);

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
        <p className="text-sm font-medium">Failed to load buyer directory. Please refresh.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-1">Buyer Directory</h1>
          <p className="text-slate-500 text-sm">
            Manage institutional relationships and verified procurement partners.
          </p>
        </div>

        {/* Search */}
        <div className="flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search buyers by name..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition w-56"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Buyer Name
                </th>
                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Trades
                </th>
                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Secured Value
                </th>
                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Last Delivery
                </th>
                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
                    No buyers found.
                  </td>
                </tr>
              ) : (
                filtered.map((buyer) => {
                  const colorClass = avatarColor(buyer.buyerName);
                  return (
                    <tr
                      key={buyer.buyerName}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition"
                    >
                      {/* Buyer Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${colorClass}`}>
                            {getInitials(buyer.buyerName) || '??'}
                          </div>
                          <p className="font-semibold text-slate-900 text-sm">{buyer.buyerName}</p>
                        </div>
                      </td>

                      {/* Trades count */}
                      <td className="py-4 px-6 text-slate-700 font-semibold text-sm">
                        {buyer.tradeCount}
                      </td>

                      {/* Secured Value */}
                      <td className="py-4 px-6">
                        <span className="font-mono font-semibold text-slate-900 text-sm">
                          ${buyer.securedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Last Delivery */}
                      <td className="py-4 px-6 text-slate-600 text-sm">
                        {formatDate(buyer.lastDelivery)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => navigate('/seller/buyers/detail', {
                            state: { buyerName: buyer.buyerName, buyerPhone: buyer.buyerPhone },
                          })}
                          className="text-red-600 hover:text-red-700 font-semibold text-sm transition"
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Showing {filtered.length} of {groupedBuyers.length} buyers
          </p>
        </div>
      </div>
    </div>
  );
}
