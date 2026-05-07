import { useMemo, useState, useRef } from 'react';
import { Search, Truck, Share2, MapPin, ShieldCheck, Loader2, AlertCircle, Clock } from 'lucide-react';
import { useDriverTrades } from '../../hooks/useProfile';

/* ── Helpers ── */
function formatTime(timeStr) {
  if (!timeStr) return '—';
  try {
    const [h, m] = timeStr.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    return `${hr % 12 || 12}:${m} ${ampm}`;
  } catch { return timeStr; }
}

/* ── Simulated Map ── */
function MapPanel({ trade }) {
  return (
    <div className="relative bg-slate-200 rounded-xl overflow-hidden" style={{ minHeight: 280 }}>
      {/* Grid */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg,#94a3b8 0,#94a3b8 1px,transparent 1px,transparent 48px),
                            repeating-linear-gradient(90deg,#94a3b8 0,#94a3b8 1px,transparent 1px,transparent 48px)`,
          opacity: 0.25,
        }}
      />
      {/* Simulated terrain tone */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-emerald-100 to-amber-100 opacity-60" />

      {/* Dashed route line */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="20" y1="70" x2="78" y2="28" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3 2" />
      </svg>

      {/* Origin dot */}
      <div className="absolute" style={{ left: '18%', top: '65%' }}>
        <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-md" />
      </div>

      {/* Destination pin */}
      <div className="absolute" style={{ left: '74%', top: '22%' }}>
        <div className="relative">
          <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-lg z-10 relative" />
          <div className="w-5 h-5 rounded-full bg-red-500 opacity-30 animate-ping absolute inset-0" />
        </div>
      </div>

      {/* DIST + ETA overlays */}
      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-3">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2.5 shadow">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Dist</p>
          <p className="text-lg font-black text-slate-900">14.2 km</p>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2.5 shadow">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">ETA</p>
          <p className="text-lg font-black text-slate-900">{formatTime(trade?.deliveryTime)}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Delivery Log ── */
function DeliveryLog({ tradeStatus }) {
  const steps = [
    { key: 'pickup',   label: 'Pickup Confirmed', sub: 'Seller Location', done: true,  live: false },
    { key: 'transit',  label: 'In Transit',        sub: 'En Route',        done: ['IN_TRANSIT','DELIVERED','COMPLETED'].includes(tradeStatus), live: false },
    { key: 'onroute',  label: 'On-route',           sub: 'Live tracking',   done: false, live: ['IN_TRANSIT','ACTIVE'].includes(tradeStatus) },
    { key: 'arrival',  label: 'Arrival at Hub',     sub: 'Destination',     done: ['DELIVERED','COMPLETED'].includes(tradeStatus), live: false },
  ];

  const times = ['08:45', '09:15', null, null];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-full">
      <h3 className="text-sm font-bold text-slate-700 mb-5">Delivery Log</h3>
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={step.key} className="flex items-start gap-3">
            {/* Icon */}
            {step.live ? (
              <div className="relative flex-shrink-0 mt-0.5">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center z-10 relative">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="w-6 h-6 rounded-full bg-red-400 opacity-30 animate-ping absolute inset-0" />
              </div>
            ) : step.done ? (
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
            )}

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-xs font-bold ${step.live ? 'text-red-600' : step.done ? 'text-slate-800' : 'text-slate-400'}`}>
                  {step.label}
                  {step.live && (
                    <span className="ml-2 text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-widest">
                      Live
                    </span>
                  )}
                </p>
                {times[idx] && <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{times[idx]}</span>}
              </div>
              <p className={`text-[10px] mt-0.5 ${step.done || step.live ? 'text-slate-500' : 'text-slate-300'}`}>{step.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shipment List Item ── */
function ShipmentItem({ trade, isSelected, onClick }) {
  const isLive = ['IN_TRANSIT', 'ACTIVE'].includes(trade.tradeStatus);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-slate-100 transition ${
        isSelected ? 'bg-red-50 border-l-4 border-l-red-500' : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-black text-slate-800 font-mono">#{trade.tradeId?.toUpperCase()}</span>
        {isLive && (
          <span className="text-[9px] font-black text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded uppercase tracking-widest">
            Live
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 mb-1">
        <Truck className="w-3 h-3 text-slate-400 flex-shrink-0" />
        <span className="text-[10px] text-slate-500 truncate">{trade.sellerName || 'Seller'} → {trade.buyerName}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{trade.tradeStatus?.replace(/_/g, ' ')}</span>
        <span className="text-[10px] text-slate-400">ETA {formatTime(trade.deliveryTime)}</span>
      </div>
    </button>
  );
}

/* ── Main Component ── */
export function DriverActiveShipmentsTab() {
  const { data, isLoading, error } = useDriverTrades();
  const [search, setSearch]    = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [code, setCode]        = useState(Array(6).fill(''));
  const inputRefs              = useRef([]);

  const activeTrades = useMemo(() => {
    const all = data?.dashboardRecords ?? [];
    return all.filter((t) => ['ACTIVE', 'IN_TRANSIT', 'BUYER_JOINED'].includes(t.tradeStatus));
  }, [data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return activeTrades;
    const q = search.toLowerCase();
    return activeTrades.filter(
      (t) => t.tradeId?.toLowerCase().includes(q) || t.sellerName?.toLowerCase().includes(q)
    );
  }, [activeTrades, search]);

  const selected = useMemo(() => {
    if (selectedId) return filtered.find((t) => t.tradeId === selectedId) ?? filtered[0];
    return filtered[0] ?? null;
  }, [filtered, selectedId]);

  const handleCodeChange = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleCodeKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
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
        <p className="text-sm font-medium">Failed to load active shipments. Please refresh.</p>
      </div>
    );
  }

  if (activeTrades.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 py-20 text-center shadow-sm">
        <Truck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-400 text-sm font-medium">No active shipments at this time.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ minHeight: 600 }}>

      {/* ── Left sidebar ── */}
      <div className="w-64 flex-shrink-0 border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Active Shipments</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Trade ID, Seller Name"
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-10">No results.</p>
          ) : (
            filtered.map((trade) => (
              <ShipmentItem
                key={trade.tradeId}
                trade={trade}
                isSelected={selected?.tradeId === trade.tradeId}
                onClick={() => setSelectedId(trade.tradeId)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Main panel ── */}
      {selected ? (
        <div className="flex-1 p-6 overflow-y-auto space-y-5">

          {/* Title row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Shipment #{selected.tradeId?.toUpperCase()}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {selected.tradeStatus?.replace(/_/g, ' ')}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" /> Last updated: 2 mins ago
                </span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition flex-shrink-0">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>

          {/* Map + Delivery Log (side by side) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
            <MapPanel trade={selected} />
            <DeliveryLog tradeStatus={selected.tradeStatus} />
          </div>

          {/* Destination + Trade Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Destination Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-indigo-600">Destination Details</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Shipping Address</p>
                  <p className="text-sm text-slate-700">{selected.deliveryAddress || 'Address not provided'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Buyer Name</p>
                    <p className="text-sm text-slate-700">{selected.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-sm font-bold text-slate-800">{selected.buyerPhone || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade Overview */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-indigo-600">Trade Overview</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Goods</p>
                    <p className="text-sm text-slate-700">{selected.goods}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Escrow</p>
                    <p className="text-sm font-bold text-green-600">
                      ${selected.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '—'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seller</p>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-indigo-100 flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">{selected.sellerName || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Confirmation */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Delivery Confirmation Code</p>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="flex-1 border border-slate-200 rounded-lg px-5 py-3 flex items-center justify-center">
                <div className="flex gap-3">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className="w-9 h-9 rounded border border-slate-300 text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition caret-transparent"
                    />
                  ))}
                </div>
              </div>
              <button
                disabled={code.some((d) => !d)}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-lg transition shadow-sm flex-shrink-0"
              >
                Confirm Delivery
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Select a shipment to view details.</p>
        </div>
      )}
    </div>
  );
}
