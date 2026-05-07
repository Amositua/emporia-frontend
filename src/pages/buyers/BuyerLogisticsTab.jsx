import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  SlidersHorizontal, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Flag,
  X
} from 'lucide-react';
import { useBuyerTrades, useFlagTrade } from '../../hooks/useProfile';

/* ── helpers ── */
function formatTime(timeStr) {
  if (!timeStr) return '—';
  try {
    const [h, m] = timeStr.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    return `${hr % 12 || 12}:${m} ${ampm}`;
  } catch { return timeStr; }
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const STATUS_STYLE = {
  CREATED:         { dot: 'bg-amber-500',  text: 'text-amber-600',  bg: 'bg-amber-50'  },
  BUYER_JOINED:    { dot: 'bg-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-50' },
  DRIVER_PENDING:  { dot: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50' },
  DRIVER_ASSIGNED: { dot: 'bg-cyan-500',   text: 'text-cyan-600',   bg: 'bg-cyan-50'   },
  ACTIVE:          { dot: 'bg-blue-500',   text: 'text-blue-600',   bg: 'bg-blue-50'   },
  IN_TRANSIT:      { dot: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50' },
  DELIVERED:       { dot: 'bg-green-500',  text: 'text-green-600',  bg: 'bg-green-50'  },
  COMPLETED:       { dot: 'bg-green-500',  text: 'text-green-600',  bg: 'bg-green-50'  }, // keeping COMPLETED for safety
  FLAGGED:         { dot: 'bg-red-600',    text: 'text-red-700',    bg: 'bg-red-100'   },
};

function StatCard({ label, value, sub, icon: Icon, borderColor }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-start justify-between border-l-4 ${borderColor}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
           <Icon className="w-4 h-4 text-slate-400" />
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
        <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
        <p className={`text-[10px] font-medium ${sub.includes('+') ? 'text-green-600' : 'text-slate-500'}`}>
          {sub}
        </p>
      </div>
    </div>
  );
}

/* ── Flag Modal ── */
function FlagModal({ trade, onClose, onConfirm, isPending }) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600">
            <Flag className="w-4 h-4" />
            <h3 className="font-bold text-slate-900 text-sm">Flag Dispute</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Trade ID</p>
            <p className="text-xs font-mono font-bold text-red-700">#{trade?.tradeId?.toUpperCase()}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reason for Dispute</label>
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the issue with this shipment..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition min-h-[80px] resize-none"
            />
          </div>
          <p className="text-[10px] text-slate-400 italic">
            Disputing a trade will notify the seller and put the escrow funds on hold.
          </p>
        </div>

        <div className="px-5 py-4 flex gap-3 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending || !reason.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-sm shadow-red-200"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Flag Trade'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BuyerLogisticsTab() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useBuyerTrades();
  const flagTradeMutation = useFlagTrade();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const PAGE_SIZE = 10;

  const records = useMemo(() => data?.dashboardRecords ?? [], [data]);

  /* Stats calculation */
  const totalShipments = records.length;
  const inTransitCount = records.filter(t => t.tradeStatus === 'IN_TRANSIT').length;
  const completedCount = records.filter(t => ['COMPLETED', 'DELIVERED'].includes(t.tradeStatus)).length;

  /* Filter */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter(t => 
      !q || 
      t.tradeId?.toLowerCase().includes(q) || 
      t.sellerName?.toLowerCase().includes(q)
    );
  }, [records, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 m-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium">Failed to load logistics data. Please refresh.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Logistics Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and track institutional escrow freight movements.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Shipments" 
          value={totalShipments} 
          sub="+12% this month" 
          icon={Truck} 
          borderColor="border-l-slate-900" 
        />
        <StatCard 
          label="In Transit" 
          value={inTransitCount} 
          sub="Expected delivery within 48h" 
          icon={RotateCcw} 
          borderColor="border-l-blue-500" 
        />
        <StatCard 
          label="Completed" 
          value={completedCount} 
          sub="Successfully escrow-released" 
          icon={ShieldCheck} 
          borderColor="border-l-red-500" 
        />
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by Trade ID or Seller Name..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
              <Calendar className="w-3.5 h-3.5" /> Filter by Date
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trade ID</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seller Name</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Goods</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Driver</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ETA</th>
                <th className="py-4 px-6" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((trade) => {
                const style = STATUS_STYLE[trade.tradeStatus] || STATUS_STYLE.ACTIVE;
                return (
                  <tr key={trade.tradeId} className="hover:bg-slate-50/60 transition group">
                    <td className="py-4 px-6">
                      <span className="text-xs font-bold text-slate-900 font-mono">#{trade.tradeId?.toUpperCase()}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">{trade.sellerName}</td>
                    <td className="py-4 px-6 text-sm text-slate-600">{trade.goods}</td>
                    <td className="py-4 px-6 text-sm text-slate-600">{trade.driverName || 'Kwame Mensah'}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                        <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                        {trade.tradeStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap font-medium">
                      {trade.deliveryDate ? formatDate(trade.deliveryDate) : 'Oct 24'}, {trade.deliveryTime ? formatTime(trade.deliveryTime) : '14:00'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm transition"
                          onClick={(e) => { e.stopPropagation(); /* Payment logic here */ }}
                        >
                          PAY NOW
                        </button>
                        <button 
                          onClick={() => navigate('/buyer/logistics/detail', { state: trade })}
                          className="text-xs font-bold text-red-600 hover:text-red-700 transition uppercase tracking-wider"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => setSelectedTrade(trade)}
                          disabled={trade.tradeStatus === 'FLAGGED'}
                          className={`transition ${trade.tradeStatus === 'FLAGGED' ? 'text-red-500 cursor-not-allowed opacity-50' : 'text-slate-300 hover:text-red-500'}`}
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-700">{filtered.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-bold text-slate-700">{filtered.length}</span> entries
          </p>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button 
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded text-xs font-bold transition ${page === i + 1 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Flag Modal */}
      {selectedTrade && (
        <FlagModal
          trade={selectedTrade}
          isPending={flagTradeMutation.isPending}
          onClose={() => setSelectedTrade(null)}
          onConfirm={async (reason) => {
            try {
              const res = await flagTradeMutation.mutateAsync({ 
                tradeId: selectedTrade.tradeId, 
                reason 
              });
              alert(res.message || 'Trade has been flagged for dispute.');
              refetch();
              setSelectedTrade(null);
            } catch (err) {
              alert(`Failed to flag trade: ${err.message || 'Unknown error'}`);
            }
          }}
        />
      )}
    </div>
  );
}
