import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Users,
  Settings2,
  Loader2,
  AlertCircle,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Eye,
  MapPin,
  X,
} from 'lucide-react';
import { BuyerNav } from '../../components/BuyerNav';
import { useAuth } from '../../context/AuthContext';
import { useBuyerTrades, useUpdateTradeAddress } from '../../hooks/useProfile';
import { BuyerLogisticsTab } from './BuyerLogisticsTab';

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
  CREATED:         'bg-amber-100 text-amber-700',
  BUYER_JOINED:    'bg-indigo-100 text-indigo-700',
  DRIVER_PENDING:  'bg-purple-100 text-purple-700',
  DRIVER_ASSIGNED: 'bg-cyan-100 text-cyan-700',
  ACTIVE:          'bg-blue-100 text-blue-700',
  IN_TRANSIT:      'bg-orange-100 text-orange-700',
  DELIVERED:       'bg-green-100 text-green-700',
  COMPLETED:       'bg-green-100 text-green-700',
  CANCELLED:       'bg-red-100 text-red-700',
  PENDING:         'bg-slate-100 text-slate-600',
  FLAGGED:         'bg-red-200 text-red-800',
};

function statusLabel(status = '') {
  return status.replace(/_/g, ' ');
}

const PAGE_SIZE = 8;

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

/* ── Address Modal ── */
function AddressModal({ trade, onClose, onSave, isPending }) {
  const [address, setAddress] = useState(trade?.deliveryAddress || '');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Delivery Address</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trade ID</p>
            <p className="text-xs font-mono font-bold text-slate-700">#{trade?.tradeId?.toUpperCase()}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address Details</label>
            <textarea
              autoFocus
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Industrial Way, Accra..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition min-h-[80px] resize-none"
            />
          </div>
        </div>

        <div className="px-5 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(address)}
            disabled={isPending || !address.trim()}
            className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-2 rounded text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Address'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export function BuyerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [selectedTrade, setSelectedTrade] = useState(null);

  const handleTabChange = (tabId) => {
    if (tabId === 'sellers') {
      navigate('/buyer/sellers');
    } else {
      setActiveTab(tabId);
    }
  };

  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useBuyerTrades();
  const updateAddressMutation = useUpdateTradeAddress();
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
      <BuyerNav activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Overview tab ── */}
        {activeTab === 'overview' && (
          <>
            {/* Header */}
            <div className="mb-8">
              <p className="text-sm font-medium text-slate-500 mb-1">
                Welcome back,{' '}
                <span className="font-semibold text-slate-700">
                  {user?.personalName || user?.per || 'Buyer'}
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
                  {/* <p className="text-xs font-medium text-blue-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{activeTrades.length} since last month
                  </p> */}
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
                        {['SELLER NAME', 'TRADE ID', 'GOODS', 'AMOUNT', 'DELIVERY INFO', 'STATUS', 'ACTIONS'].map((col) => (
                          <th
                            key={col}
                            className={`py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap ${col === 'ACTIONS' ? 'text-right' : 'text-left'}`}
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

                            {/* Delivery Date & Address */}
                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm text-slate-600 font-medium whitespace-nowrap">
                                  {formatDate(trade.deliveryDate)} - {trade.deliveryTime}
                                </span>
                                {trade.deliveryAddress ? (
                                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5" /> {trade.deliveryAddress}
                                    
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-red-400 italic">No address set</span>
                                )}
                              </div>
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

                            {/* Actions */}
                            <td className="py-4 px-6 text-right">
                              <button 
                                onClick={() => setSelectedTrade(trade)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded transition shadow-sm"
                              >
                                <MapPin className="w-3 h-3" />
                                {trade.deliveryAddress ? 'Edit Delivery Address' : 'Add Delivery Address'}
                              </button>
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



        {/* ── Logistics tab ── */}
        {activeTab === 'logistics' && (
          <BuyerLogisticsTab />
        )}

        {/* ── Other tabs ── */}
        {activeTab !== 'overview' && activeTab !== 'sellers' && activeTab !== 'logistics' && (
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
          © 2026 EscrowProtocol. All Institutional Rights Reserved.
        </p>
      </footer>

      {/* Address Modal */}
      {selectedTrade && (
        <AddressModal
          trade={selectedTrade}
          isPending={updateAddressMutation.isPending}
          onClose={() => setSelectedTrade(null)}
          onSave={async (newAddr) => {
            try {
              await updateAddressMutation.mutateAsync({ 
                tradeId: selectedTrade.tradeId, 
                deliveryAddress: newAddr 
              });
              await refetch();
              setSelectedTrade(null);
            } catch (err) {
              console.error('Update address failed:', err);
              alert(`Failed to update address: ${err.message}`);
            }
          }}
        />
      )}
    </div>
  );
}
