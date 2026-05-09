import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, ArrowLeft, LogOut } from 'lucide-react';
import { BuyerNav } from '../../components/BuyerNav';
import { useAuth } from '../../context/AuthContext';

export function BuyerProfile() {
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
      navigate('/buyer/dashboard', { state: { activeTab: tabId } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <BuyerNav activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
            <p className="text-slate-500 mt-1">Manage your basic buyer profile information.</p>
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
             <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                {user?.personalName?.charAt(0) || 'B'}
             </div>
             <div>
                <h3 className="font-bold text-slate-900 text-lg">{user?.personalName}</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Verified Buyer Profile</p>
             </div>
          </div>
          
          <div className="p-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <InfoItem icon={User} label="Full Name" value={user?.personalName} />
            <InfoItem icon={Phone} label="Phone Number" value={user?.phoneNumber} />
            <InfoItem icon={Mail} label="Email Address" value={user?.email || 'N/A'} />
            <InfoItem icon={MapPin} label="Account Region" value="West Africa" />
          </div>
        </div>

        <button 
          onClick={() => navigate('/buyer/dashboard')}
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
