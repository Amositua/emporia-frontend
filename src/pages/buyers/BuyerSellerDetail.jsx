import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Flag, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Store
} from 'lucide-react';
import { BuyerNav } from '../../components/BuyerNav';

/* ── helpers ── */
function formatAmount(val) {
  if (val == null) return '—';
  return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
}

const STATUS_BADGE = {
  CREATED:         'bg-amber-50 text-amber-600 border-amber-100',
  BUYER_JOINED:    'bg-indigo-50 text-indigo-600 border-indigo-100',
  DRIVER_PENDING:  'bg-purple-50 text-purple-600 border-purple-100',
  DRIVER_ASSIGNED: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  ACTIVE:          'bg-blue-50 text-blue-600 border-blue-100',
  IN_TRANSIT:      'bg-orange-50 text-orange-600 border-orange-100',
  DELIVERED:       'bg-green-50 text-green-600 border-green-100',
  COMPLETED:       'bg-green-50 text-green-600 border-green-100',
  FLAGGED:         'bg-red-50 text-red-700 border-red-200',
};

export function BuyerSellerDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sellerName, sellerPhone, trades = [] } = location.state || {};

  if (!sellerName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Seller information not found.</p>
          <button 
            onClick={() => navigate('/buyer/dashboard')}
            className="text-red-600 font-bold flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const activeTrades = trades.filter(t => ['ACTIVE', 'BUYER_JOINED'].includes(t.tradeStatus));
  const deliveryRecords = trades.filter(t => ['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(t.tradeStatus));

  const handleTabChange = (tabId) => {
    if (tabId === 'sellers') {
      navigate('/buyer/sellers');
    } else {
      navigate('/buyer/dashboard', { state: { activeTab: tabId } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <BuyerNav activeTab="sellers" onTabChange={handleTabChange} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/buyer/sellers')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </button>

        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
               <Store className="w-10 h-10 text-slate-300" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
                Verified Global Seller
              </p>
              <h1 className="text-3xl font-bold text-slate-900">{sellerName}</h1>
            </div>
          </div>
          <a 
            href={`tel:${sellerPhone || '+233249998888'}`}
            className="flex items-center gap-2 px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <Phone className="w-4 h-4" />
            CONTACT SELLER
          </a>
        </div>

        {/* Active Trade History */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight text-[22px]">Active Trade History</h2>
            {activeTrades.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-500 text-[10px] font-bold uppercase tracking-wider rounded">
                {activeTrades.length} PENDING
              </span>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                   <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trade ID</th>
                   <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Goods</th>
                   <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                   <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                   <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Date</th>
                   <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTrades.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">No active trades.</td>
                  </tr>
                ) : (
                  activeTrades.map((trade) => (
                    <tr key={trade.tradeId} className="group hover:bg-slate-50/60 transition">
                      <td className="py-5 px-6">
                        <span className="text-xs font-mono text-slate-400 tracking-wider uppercase">
                          {trade.tradeId?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <p className="text-sm font-medium text-slate-700">{trade.goods}</p>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className="text-sm font-bold text-slate-900">{formatAmount(trade.amount)}</span>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${STATUS_BADGE[trade.tradeStatus] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                          {trade.tradeStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <p className="text-xs text-slate-600 font-medium">
                          {trade.deliveryDate ? formatDate(trade.deliveryDate) : '—'}
                        </p>
                      </td>
                      <td className="py-5 px-6">
                        <p className="text-xs text-slate-600 font-medium">
                          {trade.deliveryTime || '—'}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Delivery Records */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight text-[22px]">Delivery Records</h2>
            <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-slate-600">
              VIEW ALL ARCHIVE <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trade ID</th>
                  <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Goods</th>
                  <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliveryRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">No delivery records.</td>
                  </tr>
                ) : (
                  deliveryRecords.map((trade) => (
                    <tr key={trade.tradeId} className="group hover:bg-slate-50/60 transition">
                      <td className="py-5 px-6">
                        <span className="text-xs font-mono text-slate-400 tracking-wider uppercase">
                          {trade.tradeId?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-sm font-medium text-slate-700">{trade.goods}</td>
                      <td className="py-5 px-6 text-right">
                        <span className="text-sm font-bold text-slate-900">{formatAmount(trade.amount)}</span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${STATUS_BADGE[trade.tradeStatus] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                            {trade.tradeStatus === 'IN_TRANSIT' ? 'In Transit' : 'Completed'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                            {trade.tradeStatus === 'IN_TRANSIT' 
                              ? `ETA: ${trade.deliveryDate ? formatDate(trade.deliveryDate) : 'Tomorrow'}` 
                              : `Funds Released: ${trade.deliveryDate ? formatDate(trade.deliveryDate) : '24 Oct'}`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pagination at the bottom */}
        <div className="flex items-center justify-center gap-2 pt-8">
           <button className="flex items-center gap-1 px-4 py-2 text-slate-400 text-[10px] font-bold border border-slate-200 rounded hover:bg-slate-100 transition uppercase tracking-widest mr-4">
             <ChevronLeft className="w-3 h-3" /> Previous
           </button>
           {[1, 2, 3, '...', 12].map((p, i) => (
             <button 
               key={i} 
               className={`w-8 h-8 rounded text-xs font-bold transition ${p === 1 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
             >
               {p}
             </button>
           ))}
           <button className="flex items-center gap-1 px-4 py-2 text-slate-400 text-[10px] font-bold border border-slate-200 rounded hover:bg-slate-100 transition uppercase tracking-widest ml-4">
             Next <ChevronRight className="w-3 h-3" />
           </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16 py-6 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
          © 2026 EscrowProtocol. All Institutional Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
