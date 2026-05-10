import { ChartBar as BarChart3, Gem, Users, Package, MapPin, DollarSign, HelpCircle, Bell, Settings, LogOut, Flag, Truck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function SellerNav({ activeTab, onTabChange }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/get-started');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'trade', label: 'Trade with Buyer', icon: Gem },
    { id: 'buyers', label: 'Buyers', icon: Users },
    { id: 'goods', label: 'Assign Goods', icon: Package },
    { id: 'drivers', label: 'Drivers', icon: Package },
    { id: 'tracking', label: 'Live Tracking', icon: MapPin },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'flagged', label: 'Flagged', icon: Flag },
  ];

  const handleTabClick = (id) => {
    if (id === 'logistics') {
      navigate('/seller/logistics');
    } else {
      if (onTabChange) {
        onTabChange(id);
      }
      // Always navigate back to dashboard if we're on a different page
      if (window.location.pathname !== '/seller/dashboard') {
        navigate('/seller/dashboard', { state: { activeTab: id } });
      }
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate('/seller/dashboard')}
              className="flex items-center gap-4 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">Emporia Seller</p>
                <p className="text-sm text-slate-500">{user?.businessName || 'Federica Sanchez Arjona'}</p>
              </div>
            </button>

            <div className="flex items-center gap-2 text-sm max-w-md">
              <div className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span className="truncate italic text-sm">{user?.kycAddress || 'Address Not Verified'}</span>
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
                  className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-slate-800 transition"
                >
                  F
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200">
                    <button 
                      onClick={() => {
                        navigate('/seller/profile');
                        setShowUserMenu(false);
                      }}
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
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
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
