import { ChartBar as BarChart3, ShoppingBag, Truck, DollarSign, Circle as HelpCircle, Bell, Settings, LogOut, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function BuyerNav({ activeTab, onTabChange }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleTabClick = (id) => {
    if (id === 'sellers') {
      navigate('/buyer/sellers');
      return;
    }
    
    if (location.pathname !== '/buyer/dashboard') {
      navigate('/buyer/dashboard', { state: { activeTab: id } });
    } else {
      onTabChange(id);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'sellers', label: 'Sellers', icon: ShoppingBag },
    { id: 'live-tracking', label: 'Live Tracking', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: DollarSign },
    // { id: 'profile', label: 'Account', icon: Settings },
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <p className="font-bold text-slate-900">Emporia Buyer</p>
                <p className="text-xs text-slate-500">{user?.personalName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Network: Secure</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                <Bell className="w-5 h-5 text-slate-700" />
              </button>
              {/* <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                <Settings className="w-5 h-5 text-slate-700" />
              </button> */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-slate-700 transition"
                >
                  B
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200">
                    <button 
                      onClick={() => navigate('/buyer/profile')}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 border-t border-slate-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8 overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabClick(id)}
                  className={`px-1 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                    activeTab === id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
