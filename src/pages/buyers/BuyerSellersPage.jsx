import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BuyerNav } from '../../components/BuyerNav';
import { useBuyerTrades } from '../../hooks/useProfile';
import { BuyerSellerDirectory } from './BuyerSellerDirectoryTab';

export function BuyerSellersPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useBuyerTrades();
  const records = data?.dashboardRecords ?? [];

  const handleTabChange = (tabId) => {
    if (tabId === 'overview') {
      navigate('/buyer/dashboard');
    } else if (tabId === 'sellers') {
      // already here
    } else {
      navigate('/buyer/dashboard', { state: { activeTab: tabId } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <BuyerNav activeTab="sellers" onTabChange={handleTabChange} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/buyer/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <BuyerSellerDirectory records={records} isLoading={isLoading} error={error} />
      </main>
      <footer className="border-t border-slate-200 mt-16 py-6 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
          © 2026 EscrowProtocol. All Institutional Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
