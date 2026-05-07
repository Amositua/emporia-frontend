import { useSellerTrades, useViewDispute, useEditTrade } from '../../hooks/useProfile';
import { 
  AlertCircle, 
  Loader2, 
  Search, 
  Eye, 
  Edit3, 
  X,
  Calendar,
  MapPin,
  Clock,
  Package,
  DollarSign,
  FileText,
  User,
  Truck
} from 'lucide-react';
import { useState, useMemo } from 'react';

function TradeDetailModal({ isOpen, onClose, trade }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Trade Details</h3>
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
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Product Information</h4>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-900">{trade.goods}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Quantity</p>
                      <p className="text-sm font-black text-slate-800">{trade.quantity?.toLocaleString()}</p>
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
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Escrow Status</h4>
                <div className="p-4 rounded-xl border border-red-100 bg-red-50/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Current Protocol</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-black uppercase">{trade.tradeStatus}</span>
                  </div>
                  <p className="text-[11px] text-red-500 font-medium">This trade is currently in a dispute state. Fund release is paused pending resolution.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTradeModal({ isOpen, onClose, trade, onUpdate }) {
  const [formData, setFormData] = useState({
    goodsType: trade?.goodsType || trade?.goods || '',
    quantity: trade?.quantity || '',
    amount: trade?.amount || '',
    deliveryDate: trade?.deliveryDate || '',
    deliveryTime: trade?.deliveryTime || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await onUpdate(trade.tradeId, {
        ...formData,
        quantity: Number(formData.quantity),
        amount: Number(formData.amount),
        deliveryTime: formData.deliveryTime.length === 5 ? `${formData.deliveryTime}:00` : formData.deliveryTime
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update trade');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-bold text-slate-900">Edit Trade Terms</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Goods Name</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  name="goodsType"
                  value={formData.goodsType}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 transition"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Quantity</label>
              <input 
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 transition"
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Amount (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Delivery Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Delivery Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="time"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 transition"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition shadow-lg shadow-red-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReasonModal({ isOpen, onClose, reason, tradeId, isLoading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Dispute Reason</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-red-600 uppercase tracking-widest">
            <AlertCircle className="w-4 h-4" />
            Trade #{tradeId?.toUpperCase()}
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-red-600 animate-spin mb-2" />
              <p className="text-xs text-slate-400">Fetching dispute details...</p>
            </div>
          ) : (
            <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
              "{reason || 'No specific reason provided.'}"
            </p>
          )}
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function SellerFlaggedTab() {
  const { data, isLoading, error, refetch } = useSellerTrades();
  const viewDisputeMutation = useViewDispute();
  const editTradeMutation = useEditTrade();

  const [search, setSearch] = useState('');
  const [selectedReason, setSelectedReason] = useState(null);
  const [editingTrade, setEditingTrade] = useState(null);
  const [viewDetailTrade, setViewDetailTrade] = useState(null);

  const handleViewReason = async (tradeId) => {
    setSelectedReason({ id: tradeId, reason: '', loading: true });
    try {
      const result = await viewDisputeMutation.mutateAsync(tradeId);
      setSelectedReason({ id: tradeId, reason: result.flagReason || result.reason, loading: false });
    } catch (err) {
      console.error('Failed to fetch dispute:', err);
      setSelectedReason({ id: tradeId, reason: 'Failed to load reason. Please try again.', loading: false });
    }
  };

  const handleUpdateTrade = async (tradeId, updateData) => {
    await editTradeMutation.mutateAsync({ tradeId, data: updateData });
    refetch();
  };

  const flaggedTrades = useMemo(() => {
    const all = data?.dashboardRecords ?? [];
    return all.filter(t => t.tradeStatus === 'FLAGGED');
  }, [data]);

  const filtered = useMemo(() => {
    return flaggedTrades.filter(t => 
      t.tradeId?.toLowerCase().includes(search.toLowerCase()) ||
      t.goods?.toLowerCase().includes(search.toLowerCase()) ||
      t.buyerName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [flaggedTrades, search]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Scanning for flagged trades...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-red-600 mb-1">
            <AlertCircle className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Total Flagged</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{flaggedTrades.length}</p>
          <p className="text-xs text-red-500 mt-1 font-medium">Requires immediate attention</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Flagged Dispute Queue</h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, Buyer, or Goods..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trade Info</th>
                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buyer</th>
                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logistics</th>
                <th className="text-right py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">No flagged trades found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((trade) => (
                  <tr key={trade.tradeId} className="hover:bg-slate-50/50 transition group">
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-slate-400 font-mono group-hover:text-red-600 transition-colors uppercase">
                          #{trade.tradeId?.toUpperCase()}
                        </span>
                        <span className="text-sm font-bold text-slate-800">{trade.goods}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-sm text-slate-600 font-medium">{trade.buyerName || 'Unassigned'}</span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-sm font-black text-slate-900">${trade.amount?.toLocaleString()}</span>
                    </td>
                    <td className="py-5 px-6">
                       <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{trade.deliveryDate || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{trade.deliveryAddress || 'No address'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setViewDetailTrade(trade)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Detail
                        </button>
                        <button 
                          onClick={() => handleViewReason(trade.tradeId)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Reason
                        </button>
                        <button 
                          onClick={() => setEditingTrade(trade)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit Trade
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReasonModal 
        isOpen={!!selectedReason}
        onClose={() => setSelectedReason(null)}
        reason={selectedReason?.reason}
        tradeId={selectedReason?.id}
        isLoading={selectedReason?.loading}
      />

      {editingTrade && (
        <EditTradeModal 
          isOpen={!!editingTrade}
          onClose={() => setEditingTrade(null)}
          trade={editingTrade}
          onUpdate={handleUpdateTrade}
        />
      )}

      {viewDetailTrade && (
        <TradeDetailModal 
          isOpen={!!viewDetailTrade}
          onClose={() => setViewDetailTrade(null)}
          trade={viewDetailTrade}
        />
      )}
    </div>
  );
}
