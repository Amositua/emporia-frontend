import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Map as MapIcon, 
  MessageSquare, 
  Phone, 
  Mail, 
  Navigation,
  CheckCircle2,
  Clock,
  Package,
  Store,
  User
} from 'lucide-react';
import { BuyerNav } from '../../components/BuyerNav';

/* ── helpers ── */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

const STATUS_STYLE = {
  ACTIVE:       { dot: 'bg-red-500',    text: 'text-red-600',    bg: 'bg-red-50'    },
  IN_TRANSIT:   { dot: 'bg-blue-500',   text: 'text-blue-600',   bg: 'bg-blue-50'   },
  COMPLETED:    { dot: 'bg-green-500',  text: 'text-green-600',  bg: 'bg-green-50'  },
  DELIVERED:    { dot: 'bg-green-500',  text: 'text-green-600',  bg: 'bg-green-50'  },
  BUYER_JOINED: { dot: 'bg-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-50' },
  FLAGGED:      { dot: 'bg-red-600',    text: 'text-red-700',    bg: 'bg-red-100'   },
};

export function BuyerLogisticsDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const trade = location.state || {};

  if (!trade.tradeId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Logistics record not found.</p>
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

  const getActiveStepIndex = () => {
    const status = trade.tradeStatus;
    if (['ACTIVE', 'BUYER_JOINED', 'CREATED'].includes(status)) return 0;
    if (status === 'IN_TRANSIT') return 3;
    if (['DELIVERED', 'COMPLETED'].includes(status)) return 4;
    return 0;
  };

  const activeIdx = getActiveStepIndex();

  const timelineSteps = [
    {
      title: 'Trade Initiated',
      desc: 'Contract signed by both parties digitally.',
      time: trade.deliveryDate ? `Nov 12, 09:45 AM` : 'Nov 12, 09:45 AM', // Placeholder times for now
    },
    {
      title: 'Funds Escrowed',
      desc: 'Payment confirmed and secured in Emporia vault.',
      time: 'Nov 13, 02:15 PM',
    },
    {
      title: 'Goods Picked Up',
      desc: 'Cargo loaded and verified at Seller\'s facility.',
      time: 'Nov 15, 08:00 AM',
    },
    {
      title: 'In Transit',
      desc: 'Vehicle currently 120km from destination port.',
      time: activeIdx === 3 ? 'CURRENT STATE' : activeIdx > 3 ? 'ARRIVED' : 'PENDING',
    },
    {
      title: 'Delivery Confirmed',
      desc: 'Buyer confirms receipt to release escrow funds.',
      time: activeIdx === 4 ? 'CURRENT STATE' : trade.deliveryDate ? `EXPECTED ${formatDate(trade.deliveryDate).toUpperCase()}` : 'EXPECTED NOV 24',
    }
  ].map((step, idx) => ({
    ...step,
    status: idx < activeIdx ? 'completed' : idx === activeIdx ? 'active' : 'upcoming'
  }));

  const handleTabChange = (tabId) => {
    if (tabId === 'sellers') {
      navigate('/buyer/sellers');
    } else {
      navigate('/buyer/dashboard', { state: { activeTab: tabId } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <BuyerNav activeTab="logistics" onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/buyer/dashboard', { state: { activeTab: 'logistics' } })}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Logistics
        </button>
        
        {/* Breadcrumb / Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              Escrow Transaction <span className="w-1 h-1 rounded-full bg-slate-300" /> Initiated Nov 12, 2023
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Trade #{trade.tradeId?.toUpperCase()}</h1>
          </div>
          <div className="flex items-center gap-3">
             {(() => {
               const style = STATUS_STYLE[trade.tradeStatus] || STATUS_STYLE.ACTIVE;
               return (
                 <span className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${style.bg} ${style.text}`}>
                   <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                   {trade.tradeStatus?.replace(/_/g, ' ') || 'ACTIVE'}
                 </span>
               );
             })()}
              <button 
                onClick={() => handleTabChange('live-tracking')}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded transition shadow-sm"
              >
                Track on Map
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* Trade Overview */}
            <div className="bg-white border border-slate-200 border-l-4 border-l-red-600 rounded-xl p-6 shadow-sm relative overflow-hidden">
               <div className="absolute top-4 right-6 text-slate-300">
                 <Package className="w-5 h-5" />
               </div>
               <h2 className="text-base font-bold text-slate-900 mb-1">Trade Overview</h2>
               <p className="text-xs text-slate-500 mb-6">Physical commodity verification and logistics status.</p>
               
               <div className="grid grid-cols-2 gap-8 mb-6">
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Goods Name</p>
                   <p className="text-sm font-bold text-slate-800">{trade.goods || 'Industrial Urea'}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Est. Arrival</p>
                   <p className="text-sm font-bold text-slate-800">{trade.deliveryDate ? formatDate(trade.deliveryDate) : 'Nov 24, 2023'}</p>
                 </div>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Delivery Address</p>
                  <p className="text-sm font-bold text-slate-800">{trade.deliveryAddress || 'Awaiting Address Detail'}</p>
               </div>

               {['ACTIVE', 'IN_TRANSIT'].includes(trade.tradeStatus) && trade.deliveryCode && (
                 <div className="mt-4 pt-4 border-t border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Delivery Confirmation Code</p>
                   <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                     <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Code</span>
                     <span className="text-lg font-black text-amber-700 font-mono tracking-[0.25em]">{trade.deliveryCode}</span>
                   </div>
                   <p className="text-[10px] text-slate-400 mt-1.5">Share this code with the driver to confirm delivery.</p>
                 </div>
               )}
            </div>

            {/* Destination Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Navigation className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Final Destination</p>
                <p className="text-sm font-bold text-slate-900">{trade.deliveryAddress || 'Address not yet specified in protocol.'}</p>
              </div>
            </div>

            {/* Protocol Status */}
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-10">Escrow Protocol Status</h2>
              
              <div className="relative space-y-12 ml-4">
                {/* Vertical Line */}
                <div className="absolute left-[3px] top-2 bottom-2 w-0.5 bg-slate-100" />
                
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-8">
                    {/* Dot */}
                    <div className={`mt-1.5 w-2 h-2 rounded-full z-10 relative ${
                      step.status === 'completed' || step.status === 'active' ? 'bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.1)]' :
                      'bg-slate-200 shadow-[0_0_0_4px_rgba(241,245,249,1)]'
                    }`} />
                     
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className={`text-sm font-bold ${step.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'}`}>
                          {step.title}
                        </h3>
                        <span className={`text-[10px] font-bold ${
                          step.status === 'active' ? 'text-green-600 uppercase tracking-widest' : 
                          'text-slate-400 font-mono'
                        }`}>
                          {step.time}
                        </span>
                      </div>
                      <p className={`text-xs ${step.status === 'upcoming' ? 'text-slate-300' : 'text-slate-500'}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Seller Information */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">Seller Information</h2>
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Store className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{trade.sellerName || 'Global Agrochemicals Ltd.'}</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Verified Enterprise</p>
                </div>
              </div>
              
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                144 Independence Ave, Accra Financial District, Greater Accra, Ghana.
              </p>
              
              <div className="flex items-center justify-between text-xs mb-6">
                <span className="text-slate-400 font-medium uppercase tracking-widest text-[9px]">Phone Number</span>
                <span className="font-bold text-slate-800 font-mono">{trade.sellerPhone || '+233 24 999 8888'}</span>
              </div>
              
              <a 
                href={`tel:${trade.sellerPhone || '+233249998888'}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Contact Seller
              </a>
            </div>

            {/* Driver */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">Driver</h2>
              
              <div className="flex items-start gap-4 mb-8">
                 <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                   <User className="w-6 h-6 text-slate-300" />
                 </div>
                 <div>
                   <h3 className="text-sm font-bold text-slate-900">{trade.driverName || 'Kwame Mensah'}</h3>
                   <p className="text-[10px] text-slate-500 font-medium">Star Logistics Group</p>
                 </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Email</span>
                  <span className="font-medium text-slate-700 font-mono tracking-tight">kwame.m@starlogistics.com</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Phone Number</span>
                  <span className="font-bold text-slate-800 font-mono">+233 24 123 4567</span>
                </div>
              </div>
              
              <a 
                href={`tel:${trade.driverPhone || '+233241234567'}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#0f172a] hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition"
              >
                <Phone className="w-3.5 h-3.5" /> Contact Driver
              </a>
            </div>

            {/* Map Preview */}
            {/* <div className="relative h-48 rounded-xl overflow-hidden border border-slate-200 group">
               <div className="absolute inset-0 bg-slate-300 opacity-20" />
               <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-0.1869,5.6037,12/400x300@2x?access_token=pk.eyJ1IjoiZGVtbyIsImEiOiJjbDF2Znh6djQwMTR3M2pxcjR1ZndxZndxIn0=')] bg-cover bg-center grayscale opacity-60" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
               
               <div className="absolute inset-0 flex items-center justify-center">
                 <button 
                   onClick={() => handleTabChange('live-tracking')}
                   className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-lg hover:bg-slate-50 transition translate-y-2 group-hover:translate-y-0 duration-300"
                 >
                   <Navigation className="w-3.5 h-3.5 text-red-600" />
                   View Live Position
                 </button>
               </div>
            </div> */}

          </div>

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
