import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ShieldCheck, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Truck, Package, Calendar, Clock,
} from 'lucide-react';
import { SellerNav } from '../../components/SellerNav';
import { useSellerTrades, useUnassignDriver, useAssignDriver } from '../../hooks/useProfile';

const STATUS_STYLE = {
  CREATED:         { color: 'bg-amber-100 text-amber-700'  },
  BUYER_JOINED:    { color: 'bg-indigo-100 text-indigo-700' },
  DRIVER_PENDING:  { color: 'bg-purple-100 text-purple-700' },
  DRIVER_ASSIGNED: { color: 'bg-cyan-100 text-cyan-700'   },
  ACTIVE:          { color: 'bg-blue-100 text-blue-700'    },
  IN_TRANSIT:      { color: 'bg-orange-100 text-orange-700'},
  DELIVERED:       { color: 'bg-green-100 text-green-700'  },
  COMPLETED:       { color: 'bg-green-100 text-green-700'  },
  FLAGGED:         { color: 'bg-red-100 text-red-700'      },
};

const PAGE_SIZE = 5;

function formatAmount(amount) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000)     return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
  });
}

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

export function SellerDriverDetail() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [activeTab, setActiveTab] = useState('drivers');
  const [page, setPage]           = useState(1);

  const { businessName, phoneNumber } = location.state ?? {};

  const { data, isLoading, error, refetch } = useSellerTrades();
  const unassignMutation = useUnassignDriver();
  const assignMutation = useAssignDriver();

  const allRecords = useMemo(() => data?.dashboardRecords ?? [], [data]);

  // Trades currently assigned to this driver
  const assignedTrades = useMemo(() => {
    return allRecords.filter((t) => {
      const isThisDriver = (t.driverPhone === phoneNumber) || (t.driverName !== 'Unassigned' && t.driverName !== 'Not Assigned' && t.driverName === businessName);
      return isThisDriver;
    });
  }, [allRecords, businessName, phoneNumber]);

  // Other trades available for assignment
  const availableTrades = useMemo(() => {
    return allRecords.filter((t) => {
      const isUnassigned = !t.driverPhone || t.driverName === 'Unassigned' || t.driverName === 'Not Assigned' || !t.driverName;
      const isNotThisDriver = t.driverPhone !== phoneNumber && t.driverName !== businessName;
      
      // Filter out statuses requested by the user
      const isForbiddenStatus = ['DRIVER_PENDING', 'IN_TRANSIT', 'DELIVERED'].includes(t.tradeStatus);
      
      return (isUnassigned || isNotThisDriver) && !isForbiddenStatus;
    });
  }, [allRecords, businessName, phoneNumber]);

  const assignedCount = assignedTrades.length;
  const availableCount = availableTrades.length;
  const totalValue    = assignedTrades.reduce((sum, t) => sum + (t.amount ?? 0), 0);
  const mostRelevantTrade = assignedTrades.find((t) => ['IN_TRANSIT', 'ACTIVE', 'BUYER_JOINED'].includes(t.tradeStatus)) || assignedTrades[0];

  const totalPages = Math.max(1, Math.ceil(availableCount / PAGE_SIZE));
  const paginatedAvailable = availableTrades.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (tabId) => navigate('/seller/dashboard', { state: { activeTab: tabId } });

  return (
    <div className="min-h-screen bg-slate-50">
      <SellerNav activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back button */}
        <button
          onClick={() => navigate('/seller/dashboard', { state: { activeTab: 'drivers' } })}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Driver Directory
        </button>

        {/* Driver Header */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 font-bold text-xl flex-shrink-0 shadow-inner">
            {getInitials(businessName)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-3xl font-bold text-slate-900">{businessName || 'Driver'}</h1>
              <div className="flex items-center gap-1.5 text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                Verified Partner
              </div>
            </div>
            {phoneNumber && <p className="text-slate-500 text-sm font-mono">{phoneNumber}</p>}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Failed to load logistics details. Please try again.</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              <div className=" bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Active Assignments</p>
                <p className="text-5xl font-bold text-slate-900">{assignedCount}</p>
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Total Logistics Value</p>
                <p className="text-5xl font-bold text-slate-900">{formatAmount(totalValue)}</p>
                <p className="text-xs text-slate-400 mt-2">Aggregated Cargo Value</p>
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Protocol Status</p>
                <div className="h-[60px] flex items-center">
                  {mostRelevantTrade ? (
                    <div className="flex items-center gap-3">
                       <div className="relative">
                          <div className={`w-3 h-3 rounded-full ${mostRelevantTrade.tradeStatus === 'IN_TRANSIT' || mostRelevantTrade.tradeStatus === 'ACTIVE' ? 'bg-green-500 animate-ping' : 'bg-slate-300'} absolute inset-0`} />
                          <div className={`w-3 h-3 rounded-full ${mostRelevantTrade.tradeStatus === 'IN_TRANSIT' || mostRelevantTrade.tradeStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'} relative`} />
                       </div>
                       <span className={`text-2xl font-bold ${mostRelevantTrade.tradeStatus === 'IN_TRANSIT' || mostRelevantTrade.tradeStatus === 'ACTIVE' ? 'text-green-600' : 'text-slate-600'}`}>
                          {mostRelevantTrade.tradeStatus?.replace(/_/g, ' ')}
                       </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-slate-400 italic">No Active Trades</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-12">
              {/* 1. ACTIVE ASSIGNMENTS TABLE */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Current Driver Assignments</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Active Logistics Ledger</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trade ID</th>
                        <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Goods Description</th>
                        <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buyer</th>
                        <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cargo Value</th>
                        <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment</th>
                        <th className="text-right py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {assignedTrades.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-20 text-center">
                            <Truck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No active assignments for this driver</p>
                          </td>
                        </tr>
                      ) : (
                        assignedTrades.map((trade) => {
                          const statusStyle = STATUS_STYLE[trade.tradeStatus] ?? { color: 'bg-slate-100 text-slate-600' };
                          return (
                            <tr key={trade.tradeId} className="border-b border-slate-50 hover:bg-slate-50/40 transition group">
                              <td className="py-4 px-6 text-xs font-mono font-bold text-slate-400 group-hover:text-red-600 transition-colors">
                                #{trade.tradeId?.toUpperCase()}
                              </td>
                              <td className="py-4 px-6 text-sm text-slate-800 font-bold">{trade.goods}</td>
                              <td className="py-4 px-6 text-sm text-slate-600 font-medium">{trade.buyerName}</td>
                              <td className="py-4 px-6 text-sm font-black text-slate-900">
                                ${trade.amount?.toLocaleString()}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusStyle.color}`}>
                                  {trade.tradeStatus?.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                  trade.paymentStatus === 'ESCROW_FUNDED' 
                                    ? 'bg-green-50 text-green-700 border-green-100' 
                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                  {trade.paymentStatus === 'ESCROW_FUNDED' ? 'Escrow Funded' : 'Escrow Pending'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <button 
                                  onClick={async () => {
                                    if (window.confirm('Unassign this driver from this trade?')) {
                                      await unassignMutation.mutateAsync(trade.tradeId);
                                      refetch();
                                    }
                                  }}
                                  disabled={unassignMutation.isPending || assignMutation.isPending || trade.tradeStatus === 'FLAGGED'}
                                  className="text-[10px] font-black text-slate-400 
                                  bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg
                                  uppercase tracking-widest transition disabled:opacity-50"
                                >
                                  {unassignMutation.isPending && unassignMutation.variables === trade.tradeId ? 'Processing...' : 'Unassign'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. AVAILABLE CARGO POOL */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Available Cargo Pool</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Trades ready for assignment</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trade ID</th>
                        <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Goods</th>
                        <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buyer</th>
                        <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Value</th>
                        <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="text-left py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment</th>
                        <th className="text-right py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedAvailable.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                            No available trades to assign.
                          </td>
                        </tr>
                      ) : (
                        paginatedAvailable.map((trade) => (
                          <tr key={trade.tradeId} className="hover:bg-slate-50/40 transition group">
                            <td className="py-4 px-6 text-xs font-mono font-bold text-slate-400 group-hover:text-red-600 transition-colors">
                              #{trade.tradeId?.toUpperCase()}
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-800 font-bold">
                              {trade.goods}
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-600 font-medium">{trade.buyerName}</td>
                            <td className="py-4 px-6 text-sm font-black text-slate-900">${trade.amount?.toLocaleString()}</td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${STATUS_STYLE[trade.tradeStatus]?.color || 'bg-slate-100 text-slate-500'}`}>
                                {trade.tradeStatus?.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                trade.paymentStatus === 'ESCROW_FUNDED' 
                                  ? 'bg-green-50 text-green-700 border-green-100' 
                                  : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {trade.paymentStatus === 'ESCROW_FUNDED' ? 'Escrow Funded' : 'Escrow Pending'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button 
                                onClick={async () => {
                                  await assignMutation.mutateAsync({ tradeId: trade.tradeId, driverPhoneNumber: phoneNumber });
                                  refetch();
                                }}
                                disabled={assignMutation.isPending || unassignMutation.isPending || trade.tradeStatus === 'FLAGGED'}
                                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition shadow-sm disabled:opacity-50"
                              >
                                {assignMutation.isPending && assignMutation.variables?.tradeId === trade.tradeId ? 'Assigning...' : 'Assign to Driver'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination for Available Pool */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-5 border-t border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                      >
                        <ChevronLeft className="w-4 h-4" /> PREV
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPage(i + 1)}
                          className={`w-9 h-9 rounded-lg text-sm font-bold transition shadow-sm ${
                            page === i + 1
                              ? 'bg-slate-900 text-white shadow-md'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                      >
                        NEXT <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Entry {paginatedAvailable.length > 0
                        ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, availableCount)}`
                        : '0'} of {availableCount}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
