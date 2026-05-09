import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Truck, ArrowLeft, LogOut, MapPin } from 'lucide-react';
import { DriverNav } from '../../components/DriverNav';
import { useAuth } from '../../context/AuthContext';

export function DriverProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'profile') {
      navigate('/driver/dashboard', { state: { activeTab: tabId } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DriverNav activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Driver Account</h1>
            <p className="text-slate-500 mt-1">Basic identification and logistics profile details.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                <Truck className="w-6 h-6" />
             </div>
             <div>
                <h3 className="font-bold text-slate-900 text-lg">{user?.businessName || 'Logistics Partner'}</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Verified Logistics Partner</p>
             </div>
          </div>
          
          <div className="p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {user?.businessName && (
              <InfoItem icon={Building2} label="Business Name" value={user?.businessName} />
            )}
            <InfoItem icon={MapPin} label="Business Address" value={user?.kycAddress || 'Not Verified'} />
            <InfoItem icon={User} label="Verification Status" value="Active / Nominal" />
          </div>
        </div>

        <button 
          onClick={() => navigate('/driver/dashboard')}
          className="mt-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-bold text-[10px] uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="w-3 h-3" />
          Return to Dashboard
        </button>
      </main>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-slate-900 font-bold text-lg border-b border-slate-50 pb-2">{value || 'Not Set'}</p>
    </div>
  );
}
