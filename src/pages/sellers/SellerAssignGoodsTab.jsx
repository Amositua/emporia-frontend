import { useState } from 'react';
import { useSellerTrades, useInviteDriver } from '../../hooks/useProfile';
import { Loader2, Copy, Check, Truck, Package, Calendar, Clock, Link as LinkIcon, AlertCircle } from 'lucide-react';

export function SellerAssignGoodsTab() {
  const { data, isLoading, error, refetch } = useSellerTrades();
  const inviteMutation = useInviteDriver();
  
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const trades = data?.dashboardRecords || [];
  const pendingTrades = trades.filter(t => t.tradeStatus === 'CREATED' || t.tradeStatus === 'BUYER_JOINED');

  const handleGenerateInvite = async (tradeId) => {
    try {
      const result = await inviteMutation.mutateAsync(tradeId);
      setGeneratedLink(result);
      // Scroll to top to see the link
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to generate invite:', err);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink?.deepLinkUrl) {
      navigator.clipboard.writeText(generatedLink.deepLinkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-medium">Failed to load trades. Please try again.</p>
        <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Generated Link Box - Prominent Top Display */}
      {generatedLink && (
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-2xl border-l-4 border-red-500 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">New Driver Invite Generated</span>
              </div>
              <h3 className="text-lg font-bold">Share Invitation Link</h3>
              <p className="text-xs text-slate-400">Copy this link and send it to your driver to onboard them for Trade <span className="text-white font-mono">{generatedLink.tradeId}</span></p>
            </div>
            
            <div className="flex flex-col gap-2 min-w-[300px]">
              <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg border border-white/10 backdrop-blur-sm">
                <input 
                  type="text" 
                  readOnly 
                  value={generatedLink.deepLinkUrl} 
                  className="flex-1 bg-transparent text-xs font-mono text-slate-300 outline-none truncate px-1"
                />
                <button 
                  onClick={handleCopyLink}
                  className={`p-2 rounded-md transition-all ${copied ? 'bg-green-500 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                  title="Copy Link"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Invite Code</span>
                <span className="text-xs font-bold text-red-400 font-mono tracking-wider">{generatedLink.driverCode}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setGeneratedLink(null)} 
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Goods Awaiting Assignment</h2>
              <p className="text-sm text-slate-500">Generate secure onboarding links for your logistics partners.</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Queue Status</span>
            <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
              {pendingTrades.length} ACTIVE TRADES
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Goods Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estimated Logistics</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Financial Value</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Invitation Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingTrades.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Truck className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-slate-900 font-bold mb-1">No Pending Assignments</h3>
                      <p className="text-xs text-slate-500">All created trades have been assigned or no trades currently exist in CREATED status.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingTrades.map((trade) => (
                  <tr key={trade.tradeId} className="hover:bg-slate-50/80 transition-all duration-200 group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors">{trade.goods}</span>
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5 tracking-tight uppercase">Batch ID: {trade.tradeId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">{trade.deliveryDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">{trade.deliveryTime}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">${trade.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Escrow Secured</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          trade.tradeStatus === 'BUYER_JOINED' 
                            ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' 
                            : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        }`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                          trade.tradeStatus === 'BUYER_JOINED'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          
                          {trade.tradeStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          trade.paymentStatus === 'ESCROW_FUNDED' 
                            ? 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                            : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        }`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                          trade.paymentStatus === 'ESCROW_FUNDED'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {trade.paymentStatus === 'ESCROW_FUNDED' ? 'Escrow Funded' : 'Escrow Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleGenerateInvite(trade.tradeId)}
                        disabled={inviteMutation.isPending && inviteMutation.variables === trade.tradeId}
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50"
                      >
                        {inviteMutation.isPending && inviteMutation.variables === trade.tradeId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <LinkIcon className="w-3.5 h-3.5" />
                        )}
                        Generate Link
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {pendingTrades.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <AlertCircle className="w-3 h-3" />
              Links expire after 48 hours for security compliance.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
