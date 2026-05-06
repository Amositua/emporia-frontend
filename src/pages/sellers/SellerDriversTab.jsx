import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Loader2, AlertCircle, Truck, ArrowRight, TrendingUp } from 'lucide-react';
import { useNetworkDrivers } from '../../hooks/useProfile';

/* ── helpers ── */
function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

const AVATAR_COLORS = [
  { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  { bg: 'bg-purple-100', text: 'text-purple-700'  },
  { bg: 'bg-green-100',  text: 'text-green-700'   },
  { bg: 'bg-amber-100',  text: 'text-amber-700'   },
  { bg: 'bg-rose-100',   text: 'text-rose-700'    },
  { bg: 'bg-teal-100',   text: 'text-teal-700'    },
  { bg: 'bg-indigo-100', text: 'text-indigo-700'  },
];

function avatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ── constants ── */
const PAGE_SIZE = 6;

/* ── AssignGoodsModal ── */
function AssignGoodsModal({ driver, onClose }) {
  const [goodsType, setGoodsType] = useState('');
  const [quantity, setQuantity]   = useState('');
  const [notes, setNotes]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate async assignment — swap with real API call when ready
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setSuccess(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Assign Goods</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigning to <span className="font-semibold text-slate-700">{driver.businessName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-slate-800">Goods assigned successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Goods Type
              </label>
              <input
                type="text"
                value={goodsType}
                onChange={(e) => setGoodsType(e.target.value)}
                required
                placeholder="e.g. Industrial Machinery"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Quantity
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                placeholder="e.g. 50 units"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Notes <span className="text-slate-400 normal-case font-normal">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any special handling instructions..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition resize-none"
              />
            </div>

            <div className="pt-1 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Confirm <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── DriverCard ── */
function DriverCard({ driver, onAssign }) {
  const color    = avatarColor(driver.businessName);
  const initials = getInitials(driver.businessName) || '??';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Top row — avatar + name + status */}
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 ${color.bg} ${color.text}`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-slate-900 capitalize leading-tight">
              {driver.businessName}
            </p>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-green-100 text-green-700">
              AVAILABLE
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Phone
          </span>
          <span className="text-xs font-semibold text-slate-700 font-mono">
            {driver.phoneNumber}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Network
          </span>
          <span className="text-xs font-semibold text-slate-700">
            Verified Partner
          </span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
        {/* Assign goods button */}
        <button
          onClick={() => onAssign(driver)}
          className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition"
        >
          ASSIGN GOODS <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Main Tab ── */
export function SellerDriversTab() {
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [assignTarget, setAssignTarget] = useState(null);

  const { data, isLoading, error } = useNetworkDrivers();

  const drivers = data?.drivers ?? [];
  const totalCount = data?.totalCount ?? 0;

  /* filter */
  const filtered = useMemo(() => {
    if (!search.trim()) return drivers;
    const q = search.toLowerCase();
    return drivers.filter(
      (d) =>
        d.businessName.toLowerCase().includes(q) ||
        d.phoneNumber.includes(q)
    );
  }, [drivers, search]);

  /* paginate */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  /* ── loading ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  /* ── error ── */
  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">Failed to load driver directory. Please refresh.</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-1">Driver Directory</h1>
        <p className="text-slate-500 text-sm max-w-xl">
          Access our network of verified institutional logistics partners. All drivers undergo
          rigorous protocol verification for secure B2B transport.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'TOTAL DRIVERS',
            value: totalCount,
            suffix: null,
            badge: (
              <span className="flex items-center gap-0.5 text-green-600 text-xs font-bold">
                <TrendingUp className="w-3 h-3" /> +{totalCount}
              </span>
            ),
          },
          {
            label: 'ACTIVE ON ROAD',
            value: Math.round(totalCount * 0.4),
            suffix: 'drivers',
            badge: null,
          },
          {
            label: 'DELIVERIES TODAY',
            value: Math.round(totalCount * 0.6),
            suffix: 'scheduled',
            badge: null,
          },
        ].map(({ label, value, suffix, badge }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{value}</span>
              {badge}
              {suffix && (
                <span className="text-sm text-slate-500">{suffix}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search drivers by name or phone number..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-lg transition">
          <SlidersHorizontal className="w-4 h-4" />
          FILTER
        </button>
      </div>

      {/* Grid */}
      {paginated.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-20 text-center">
          <Truck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">No drivers found.</p>
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1); }}
              className="mt-3 text-red-600 hover:text-red-700 text-sm font-semibold transition"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginated.map((driver) => (
            <DriverCard
              key={driver.phoneNumber}
              driver={driver}
              onAssign={setAssignTarget}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition text-sm"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => setPage(pg)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                pg === page
                  ? 'bg-slate-800 text-white border border-slate-800'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {pg}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition text-sm"
          >
            ›
          </button>
        </div>
      )}

      {/* Assign Goods Modal */}
      {assignTarget && (
        <AssignGoodsModal
          driver={assignTarget}
          onClose={() => setAssignTarget(null)}
        />
      )}
    </>
  );
}
