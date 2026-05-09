import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ClipboardList, Truck, MapPin, Phone,
  CheckCircle, Clock, Circle, ToggleRight, Building2, Home,
} from 'lucide-react';
import { DriverNav } from '../../components/DriverNav';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

/* ── Status Timeline helpers ── */
const STEPS = [
  { key: 'assigned',  label: 'Job Assigned',  activeStatuses: ['ACTIVE', 'BUYER_JOINED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CREATED'] },
  { key: 'accepted',  label: 'Job Accepted',  activeStatuses: ['ACTIVE', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'] },
  { key: 'transit',   label: 'In Transit',    activeStatuses: ['IN_TRANSIT', 'DELIVERED', 'COMPLETED'] },
  { key: 'delivered', label: 'Delivered',     activeStatuses: ['DELIVERED', 'COMPLETED'] },
];

function TimelineStep({ step, trade, isFirst }) {
  const isActive = step.activeStatuses.includes(trade?.tradeStatus);
  const isPending = step.key === 'accepted' && !isActive;
  const isFuture  = step.key === 'transit' && !isActive;

  return (
    <div className={`flex items-start gap-3 ${isFirst ? '' : 'mt-5'}`}>
      {/* Icon */}
      <div className="flex flex-col items-center">
        {step.key === 'assigned' && isActive && (
          <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
        )}
        {step.key === 'accepted' && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            isActive ? 'bg-green-100 border-green-400' : 'bg-slate-100 border-slate-300'
          }`}>
            <ToggleRight className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-slate-400'}`} />
          </div>
        )}
        {step.key === 'transit' && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            isActive ? 'bg-green-100 border-green-400' : 'bg-slate-100 border-slate-300'
          }`}>
            <Circle className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-slate-300'}`} />
          </div>
        )}
        {step.key === 'delivered' && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            isActive ? 'bg-green-100 border-green-400' : 'bg-slate-100 border-slate-300'
          }`}>
            <CheckCircle className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-slate-300'}`} />
          </div>
        )}
        {/* Connector line */}
        {!isFirst && <div className="absolute -top-5 left-3.5 w-px h-5 bg-slate-200" />}
      </div>

      {/* Text */}
      <div>
        <p className={`text-sm font-bold ${isFuture ? 'text-slate-300' : 'text-slate-800'}`}>
          {step.label}
        </p>
        {step.key === 'assigned' && (
          <p className="text-xs text-slate-500 mt-0.5">
            {trade?.deliveryDate} · {trade?.deliveryTime}
          </p>
        )}
        {step.key === 'accepted' && isPending && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Pending Confirmation
          </p>
        )}
        {step.key === 'transit' && isFuture && (
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
            Future State
          </p>
        )}
        {step.key === 'delivered' && !isActive && (
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
            Final Protocol
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export function DriverJobDetail() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [activeTab, setActiveTab] = useState('assigned-jobs');
  const { user }   = useAuth();

  const trade = location.state ?? {};

  const handleTabChange = (tabId) =>
    navigate('/driver/dashboard', { state: { activeTab: tabId } });

  const labelCls = 'text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1';

  return (
    <div className="min-h-screen bg-slate-50">
      <DriverNav activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assigned Jobs
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Job Details</h1>

        {/* Top row: Goods Info + Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

          {/* Goods Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <ClipboardList className="w-5 h-5 text-slate-500" />
              <h2 className="text-base font-bold text-slate-900">Goods Information</h2>
            </div>

            <div className="space-y-5">
              <div>
                <p className={labelCls}>Goods Name</p>
                <p className="text-sm font-black text-blue-700">{trade.goods || '—'}</p>
              </div>
              <div>
                <p className={labelCls}>Trade ID</p>
                <p className="text-sm font-mono font-bold text-slate-600">#{trade.tradeId?.toUpperCase()}</p>
              </div>
              <div>
                <p className={labelCls}>Cargo Value</p>
                <p className="text-sm font-bold text-slate-800">
                  ${trade.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className={labelCls}>Payment Status</p>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  trade.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {trade.paymentStatus || 'PENDING'}
                </span>
              </div>
              <div>
                <p className={labelCls}>Protocol Status</p>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  {
                    ACTIVE:       'bg-blue-100 text-blue-700',
                    BUYER_JOINED: 'bg-indigo-100 text-indigo-700',
                    IN_TRANSIT:   'bg-amber-100 text-amber-700',
                    DELIVERED:    'bg-green-100 text-green-700',
                    COMPLETED:    'bg-green-100 text-green-700',
                    CANCELLED:    'bg-red-100 text-red-700',
                  }[trade.tradeStatus] ?? 'bg-slate-100 text-slate-600'
                }`}>
                  {trade.tradeStatus?.replace(/_/g, ' ') || 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Job Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-slate-500" />
              <h2 className="text-base font-bold text-slate-900">Job Timeline</h2>
            </div>

            <div className="space-y-5">
              {STEPS.map((step, idx) => (
                <div key={step.key} className="relative flex items-start gap-3">
                  {/* Connector */}
                  {idx < STEPS.length - 1 && (
                    <div className="absolute left-[15px] top-8 w-px h-5 bg-slate-200 z-0" />
                  )}

                  {/* Step icon */}
                  {step.key === 'assigned' && (
                    <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center flex-shrink-0 z-10">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  {step.key === 'accepted' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 z-10 ${
                      step.activeStatuses.includes(trade?.tradeStatus)
                        ? 'bg-green-100 border-green-400'
                        : 'bg-slate-100 border-slate-300'
                    }`}>
                      <ToggleRight className={`w-4 h-4 ${step.activeStatuses.includes(trade?.tradeStatus) ? 'text-green-600' : 'text-slate-400'}`} />
                    </div>
                  )}
                  {step.key === 'transit' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 z-10 ${
                      step.activeStatuses.includes(trade?.tradeStatus)
                        ? 'bg-green-100 border-green-400'
                        : 'bg-slate-100 border-slate-300'
                    }`}>
                      <Circle className={`w-4 h-4 ${step.activeStatuses.includes(trade?.tradeStatus) ? 'text-green-600' : 'text-slate-300'}`} />
                    </div>
                  )}
                  {step.key === 'delivered' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 z-10 ${
                      step.activeStatuses.includes(trade?.tradeStatus)
                        ? 'bg-green-100 border-green-400'
                        : 'bg-slate-100 border-slate-300'
                    }`}>
                      <CheckCircle className={`w-4 h-4 ${step.activeStatuses.includes(trade?.tradeStatus) ? 'text-green-600' : 'text-slate-300'}`} />
                    </div>
                  )}

                  {/* Step text */}
                  <div>
                    <p className={`text-sm font-bold ${
                      !step.activeStatuses.includes(trade?.tradeStatus) && step.key !== 'assigned'
                        ? 'text-slate-300'
                        : 'text-slate-800'
                    }`}>
                      {step.label}
                    </p>
                    {step.key === 'assigned' && (
                      <p className="text-xs text-slate-500 mt-0.5">{trade?.deliveryDate} · {trade?.deliveryTime}</p>
                    )}
                    {step.key === 'accepted' && !step.activeStatuses.includes(trade?.tradeStatus) && (
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pending Confirmation</p>
                    )}
                    {step.key === 'transit' && !step.activeStatuses.includes(trade?.tradeStatus) && (
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Future State</p>
                    )}
                    {step.key === 'delivered' && !step.activeStatuses.includes(trade?.tradeStatus) && (
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Final Protocol</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row: Pickup + Delivery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Pickup (Seller) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
            <Building2 className="absolute right-5 bottom-5 w-16 h-16 text-slate-100" />
            <div className="flex items-center gap-2 mb-6">
              <Truck className="w-5 h-5 text-slate-500" />
              <h2 className="text-base font-bold text-slate-900">Pickup (Seller)</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className={labelCls}>Business Name</p>
                <p className="text-sm font-black text-slate-800">{trade.buyerName || '—'}</p>
              </div>
              <div>
                <p className={labelCls}>Pickup Address</p>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600">{trade.deliveryAddress || 'Address not specified'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={labelCls}>Contact Name</p>
                  <p className="text-sm text-slate-700">{user?.businessName || '—'}</p>
                </div>
                <div>
                  <p className={labelCls}>Phone</p>
                  <a 
                    href={`tel:${trade.sellerPhone || ''}`}
                    className="flex items-center gap-1.5 hover:text-red-600 transition group"
                  >
                    <Phone className="w-3 h-3 text-slate-400 group-hover:text-red-500" />
                    <p className="text-sm font-bold text-slate-800 group-hover:text-red-600 transition">{trade.sellerPhone || '—'}</p>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery (Buyer) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
            <Home className="absolute right-5 bottom-5 w-16 h-16 text-slate-100" />
            <div className="flex items-center gap-2 mb-6">
              <ClipboardList className="w-5 h-5 text-slate-500" />
              <h2 className="text-base font-bold text-slate-900">Delivery (Buyer)</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className={labelCls}>Business Name</p>
                <p className="text-sm font-black text-slate-800">{trade.buyerName || '—'}</p>
              </div>
              <div>
                <p className={labelCls}>Delivery Address</p>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600">{trade.deliveryAddress || 'Address not specified'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={labelCls}>Contact Name</p>
                  <p className="text-sm text-slate-700">{trade.buyerName || '—'}</p>
                </div>
                <div>
                  <p className={labelCls}>Phone</p>
                  <a 
                    href={`tel:${trade.buyerPhone || ''}`}
                    className="flex items-center gap-1.5 hover:text-red-600 transition group"
                  >
                    <Phone className="w-3 h-3 text-slate-400 group-hover:text-red-500" />
                    <p className="text-sm font-bold text-slate-800 group-hover:text-red-600 transition">{trade.buyerPhone || '—'}</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
