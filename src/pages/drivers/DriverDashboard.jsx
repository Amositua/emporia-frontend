import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ClipboardList, Truck, MapPin, Calendar, Clock,
  ChevronRight, Loader2, AlertCircle, TrendingUp,
} from 'lucide-react';
import { DriverNav } from '../../components/DriverNav';
import { useDriverTrades } from '../../hooks/useProfile';
import { useAuth } from '../../context/AuthContext';
import { DriverAssignedJobsTab } from './DriverAssignedJobsTab';
import { DriverSellersTab } from './DriverSellersTab';
import { DriverActiveShipmentsTab } from './DriverActiveShipmentsTab';

/* ── Helpers ── */
const STATUS_STYLE = {
  CREATED:         { color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500'  },
  BUYER_JOINED:    { color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  DRIVER_PENDING:  { color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  DRIVER_ASSIGNED: { color: 'bg-cyan-100 text-cyan-700',     dot: 'bg-cyan-500'   },
  ACTIVE:          { color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'   },
  IN_TRANSIT:      { color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  DELIVERED:       { color: 'bg-green-100 text-green-700',   dot: 'bg-green-400'  },
  COMPLETED:       { color: 'bg-green-100 text-green-700',   dot: 'bg-green-500'  },
  FLAGGED:         { color: 'bg-red-100 text-red-700',       dot: 'bg-red-500'    },
};

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

function avatarColor(name = '') {
  const colors = [
    'bg-blue-600', 'bg-purple-600', 'bg-green-600',
    'bg-amber-600', 'bg-rose-600',  'bg-teal-600', 'bg-indigo-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

/* ── Fake map placeholder ── */
function MapWidget({ trade }) {
  return (
    <div className="relative bg-slate-100 rounded-r-xl overflow-hidden h-full min-h-[200px] flex flex-col justify-end">
      {/* Simulated map grid */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, #94a3b8 0, #94a3b8 1px, transparent 1px, transparent 40px),
                            repeating-linear-gradient(90deg, #94a3b8 0, #94a3b8 1px, transparent 1px, transparent 40px)`,
        }}
      />
      {/* Road lines */}
      <div className="absolute inset-0 flex items-center">
        <div className="h-0.5 w-full bg-slate-300 opacity-60" />
      </div>
      <div className="absolute inset-0 flex justify-center">
        <div className="w-0.5 h-full bg-slate-300 opacity-60" />
      </div>
      {/* Pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-lg z-10 relative" />
          <div className="w-5 h-5 rounded-full bg-red-600 opacity-30 animate-ping absolute inset-0" />
        </div>
      </div>
      {/* Info bar */}
      <div className="relative bg-white/90 backdrop-blur-sm px-4 py-3 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Live Location Tracking</span>
        </div>
        <p className="text-[11px] text-slate-500">
          {trade?.deliveryAddress || 'En route to delivery point. GPS signal nominal.'}
        </p>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export function DriverDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab]   = useState(location.state?.activeTab || 'overview');
  const [showAll, setShowAll]       = useState(false);

  // Sync tab with location state (e.g. when navigating from detail pages)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  // Reset scroll when switching tabs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);
  const { user }                    = useAuth();
  const { data, isLoading, error }  = useDriverTrades();

  const trades = useMemo(() => data?.dashboardRecords ?? [], [data]);

  const activeTrade = useMemo(
    () => trades.find((t) => t.tradeStatus === 'IN_TRANSIT' || t.tradeStatus === 'ACTIVE'),
    [trades],
  );
  const assignedCount = trades.length;
  const activeCount   = trades.filter((t) => ['IN_TRANSIT', 'ACTIVE'].includes(t.tradeStatus)).length;

  const upcoming = trades.filter((t) => t.tradeStatus !== 'DELIVERED');
  const visibleUpcoming = showAll ? upcoming : upcoming.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DriverNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">

        {activeTab === 'overview' && (
          <>
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back, {user?.businessName || 'Driver'}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Your escrow protocol is active. All systems nominal for today's assignments.
              </p>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Assigned Jobs */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-7 py-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-slate-500" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Jobs</p>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  <p className="text-4xl font-bold text-slate-900">{assignedCount}</p>
                )}
              </div>

              {/* Active Shipments */}
              <div className="bg-white rounded-xl border-l-4 border-l-red-500 border border-slate-200 shadow-sm px-7 py-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-red-600" />
                  </div>
                  {activeCount > 0 && (
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest border border-red-200 bg-red-50 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Shipments</p>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  <p className="text-4xl font-bold text-slate-900">{activeCount}</p>
                )}
              </div>
            </div>

            {/* Active Shipment Panel */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Active Shipment</h2>
                  {activeTrade && (
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  )}
                </div>
                {activeTrade && (
                  <button 
                    onClick={() => setActiveTab('active-shipments')}
                    className="text-[10px] font-black text-slate-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-1 transition"
                  >
                    View Full Details <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="bg-white rounded-xl border border-slate-200 h-48 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-600">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">Failed to load shipments. Please refresh.</p>
                </div>
              ) : !activeTrade ? (
                <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
                  <Truck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">No active shipment at this time.</p>
                  <p className="text-slate-300 text-xs mt-1">Assignments will appear here when activated.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_300px]">
                  {/* Shipment Info */}
                  <div className="p-7">
                    {/* Headers */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[
                        { label: 'Trade ID', value: activeTrade.tradeId?.toUpperCase() },
                        { label: 'Goods',    value: activeTrade.goods },
                        { label: 'Destination', value: activeTrade.deliveryAddress || 'En Route' },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                      {/* Step 1 — Pickup */}
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Pickup Confirmed</p>
                          <p className="text-xs text-slate-400">
                            Buyer: {activeTrade.buyerName} · {activeTrade.deliveryTime}
                          </p>
                        </div>
                      </div>

                      {/* Step 2 — In Transit */}
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Truck className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-red-600">
                            {activeTrade.tradeStatus?.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-slate-400">
                            Estimated Delivery: {activeTrade.deliveryDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  <MapWidget trade={activeTrade} />
                </div>
              )}
            </div>

            {/* Upcoming Assignments Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Recent Assigned Jobs</h2>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400 font-medium">{upcoming.length} total</span>
                </div>
              </div>

              {isLoading ? (
                <div className="py-16 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : upcoming.length === 0 ? (
                <div className="py-16 text-center">
                  <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No assigned jobs found.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/60">
                          <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trade ID</th>
                          <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Goods</th>
                          <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buyer</th>
                          <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination</th>
                          <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scheduled Date</th>
                          <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {visibleUpcoming.map((trade) => {
                          const style = STATUS_STYLE[trade.tradeStatus] ?? { color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
                          const initials = getInitials(trade.buyerName);
                          const avatarBg = avatarColor(trade.buyerName || '');
                          return (
                            <tr key={trade.tradeId} className="hover:bg-slate-50/60 transition group">
                              <td className="py-4 px-6 text-xs font-mono font-bold text-slate-500 group-hover:text-red-600 transition-colors">
                                {trade.tradeId?.toUpperCase()}
                              </td>
                              <td className="py-4 px-6 text-sm text-slate-700 font-medium">{trade.goods}</td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full ${avatarBg} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                    {initials}
                                  </div>
                                  <span className="text-sm text-slate-700 font-medium">{trade.buyerName}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-sm font-bold text-slate-900 truncate max-w-[150px]">
                                {trade.deliveryAddress || 'Awaiting Address'}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    <span className="font-medium">{trade.deliveryDate || '—'}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    <span>{trade.deliveryTime || '—'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${style.color}`}>
                                    {trade.tradeStatus?.replace(/_/g, ' ')}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {upcoming.length > 5 && (
                    <button
                      onClick={() => setShowAll((s) => !s)}
                      className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      {showAll ? 'Show Less' : `Load More History (${upcoming.length - 5} more)`}
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {activeTab === 'assigned-jobs' && <DriverAssignedJobsTab />}

        {activeTab === 'sellers' && <DriverSellersTab />}

        {activeTab === 'active-shipments' && <DriverActiveShipmentsTab />}

        {activeTab !== 'overview' && activeTab !== 'assigned-jobs' && activeTab !== 'sellers' && activeTab !== 'active-shipments' && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <p className="text-slate-400 text-sm">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} section coming soon
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Protocol Driver. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-700 transition">Terms of Service</a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-700 transition">Privacy Policy</a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-700 transition">Support</a>
            <button className="bg-slate-900 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded transition">
              Report Incident
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
