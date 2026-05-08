import { useSellerTrades, useInviteBuyer } from '../../hooks/useProfile';
import { 
  Loader2, 
  Search, 
  Eye, 
  Calendar, 
  Clock, 
  MapPin, 
  Truck,
  Package,
  DollarSign,
  User,
  X,
  FileText,
  AlertCircle,
  Link as LinkIcon,
  Copy,
  Check,
  UserPlus
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { SellerNav } from '../../components/SellerNav';

const STATUS_BADGE = {
  CREATED:         { color: 'bg-amber-100 text-amber-700', label: 'Created' },
  BUYER_JOINED:    { color: 'bg-indigo-100 text-indigo-700', label: 'Buyer Joined' },
  DRIVER_PENDING:  { color: 'bg-purple-100 text-purple-700', label: 'Driver Pending' },
  DRIVER_ASSIGNED: { color: 'bg-cyan-100 text-cyan-700', label: 'Driver Assigned' },
  ACTIVE:          { color: 'bg-blue-100 text-blue-700', label: 'Active' },
  IN_TRANSIT:      { color: 'bg-orange-100 text-orange-700', label: 'In Transit' },
  DELIVERED:       { color: 'bg-green-100 text-green-700', label: 'Delivered' },
  COMPLETED:       { color: 'bg-green-100 text-green-700', label: 'Completed' },
  FLAGGED:         { color: 'bg-red-100 text-red-700', label: 'Flagged' },
};

function TradeDetailModal({ isOpen, onClose, trade }) {
  const inviteMutation = useInviteBuyer();
  const [inviteInfo, setInviteInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !trade) return null;

  const handleInvite = async () => {
    try {
      const res = await inviteMutation.mutateAsync(trade.tradeId);
      setInviteInfo(res);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Logistics Detail</h3>
              <p className="text-[10px] font-black text-slate-400 font-mono uppercase tracking-widest">#{trade.tradeId?.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[70vh]">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Goods Info */}
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Trade Information</h4>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-900">{trade.goods}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Quantity</p>
                      <p className="text-sm font-black text-slate-800">{trade.quantity?.toLocaleString() || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Total Amount</p>
                      <p className="text-sm font-black text-red-600">${trade.amount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Logistics Timeline</h4>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700 font-medium">{trade.deliveryDate || 'No date set'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700 font-medium">{trade.deliveryTime || 'No time set'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <span className="text-sm text-slate-700 font-medium leading-tight">{trade.deliveryAddress || 'No address provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Parties Info */}
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Stakeholders</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Buyer</p>
                        <p className="text-xs font-bold text-slate-900">{trade.buyerName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-50 rounded-full flex items-center justify-center">
                        <Truck className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Driver</p>
                        <p className="text-xs font-bold text-slate-900">{trade.driverName || 'Not Assigned'}</p>
                      </div>
                    </div>
                    {trade.driverPhone && <span className="text-[10px] font-mono text-slate-400">{trade.driverPhone}</span>}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Protocol Status</h4>
                <div className={`p-4 rounded-xl border ${trade.tradeStatus === 'FLAGGED' ? 'border-red-100 bg-red-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Current State</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${STATUS_BADGE[trade.tradeStatus]?.color}`}>
                      {trade.tradeStatus?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {trade.tradeStatus === 'FLAGGED' 
                      ? 'This trade is currently in a dispute state. Please review the dispute reasons in the Flagged tab.' 
                      : 'Standard escrow protocol is active for this transaction.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {inviteInfo && (
            <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <LinkIcon className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Buyer Invitation Link</p>
                  <p className="text-[10px] text-slate-500 font-medium">Share this with the buyer to join the trade</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl">
                  <input 
                    readOnly 
                    value={inviteInfo.deepLinkUrl} 
                    className="flex-1 bg-transparent border-none text-[10px] font-medium text-slate-600 focus:outline-none"
                  />
                  <button 
                    onClick={() => copyToClipboard(inviteInfo.deepLinkUrl)}
                    className="p-1.5 hover:bg-slate-50 rounded-lg transition text-slate-400 hover:text-red-600"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invite Code</p>
                  <p className="text-xs font-black text-red-600 font-mono tracking-wider">{inviteInfo.inviteCode}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            {trade.tradeStatus === 'CREATED' && !inviteInfo && (
              <button 
                onClick={handleInvite}
                disabled={inviteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-red-200 disabled:opacity-50"
              >
                {inviteMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <><UserPlus className="w-3.5 h-3.5" /> Invite Buyer</>
                )}
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
  );
}

export function SellerLogisticsPage() {
  const { data, isLoading, error } = useSellerTrades();
  const [search, setSearch] = useState('');
  const [selectedTrade, setSelectedTrade] = useState(null);

  const trades = useMemo(() => data?.dashboardRecords ?? [], [data]);

  const filteredTrades = useMemo(() => {
    return trades.filter(t => 
      t.tradeId?.toLowerCase().includes(search.toLowerCase()) ||
      t.goods?.toLowerCase().includes(search.toLowerCase()) ||
      t.buyerName?.toLowerCase().includes(search.toLowerCase()) ||
      t.driverName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [trades, search]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SellerNav activeTab="logistics" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Logistics Management</h1>
            <p className="text-slate-500 font-medium mt-1">Track and manage all your active and historic trades.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, product, buyer or driver..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/5 transition shadow-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Decrypting Logistics Data...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-900">Failed to load logistics</h3>
            <p className="text-red-600 text-sm mt-2">{error.message || 'Please check your connection.'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trade Info</th>
                    <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Buyer</th>
                    <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver</th>
                    <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="text-right py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTrades.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-32 text-center">
                        <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching trades found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTrades.map((trade) => (
                      <tr key={trade.tradeId} className="hover:bg-slate-50/50 transition group">
                        <td className="py-5 px-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono font-black text-slate-400 group-hover:text-red-600 transition-colors">#{trade.tradeId?.toUpperCase()}</span>
                            <span className="text-sm font-bold text-slate-900">{trade.goods}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{trade.buyerName}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-cyan-50 rounded-full flex items-center justify-center">
                              <Truck className="w-3.5 h-3.5 text-cyan-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                              {trade.driverName || 'Not Assigned'}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className="text-sm font-black text-slate-900">${trade.amount?.toLocaleString()}</span>
                        </td>
                        <td className="py-5 px-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_BADGE[trade.tradeStatus]?.color || 'bg-slate-100 text-slate-600'}`}>
                            {trade.tradeStatus?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <button 
                            onClick={() => setSelectedTrade(trade)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <TradeDetailModal 
        isOpen={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
        trade={selectedTrade}
      />
    </div>
  );
}
