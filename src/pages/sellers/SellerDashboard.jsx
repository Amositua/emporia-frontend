import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Truck, DollarSign, CircleCheck as CheckCircle, Clock, TrendingUp, ExternalLink } from 'lucide-react';
import { SellerNav } from '../../components/SellerNav';
import { StatsCard } from '../../components/StatsCard';
import { BankAccountModal } from '../../components/BankAccountModal';
import { SellerTradeTab } from './SellerTradeTab';
import { SellerBuyersTab } from './SellerBuyersTab';
import { SellerDriversTab } from './SellerDriversTab';
import { SellerAssignGoodsTab } from './SellerAssignGoodsTab';
import { SellerFlaggedTab } from './SellerFlaggedTab';
import { SellerLiveTrackingTab } from './SellerLiveTrackingTab';
import { SellerFinancialTab } from './SellerFinancialTab';
import { useEffect } from 'react';
import { useSellerTrades, useBankAccountDetails } from '../../hooks/useProfile';
import { useNavigate } from 'react-router-dom';

export function SellerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const { data: bankData, isLoading: bankLoading, refetch: refetchBank } = useBankAccountDetails();
  const hasBankInfo = !!(bankData?.accountNumber && bankData?.accountName && bankData?.bankName);
  
  // Sync tab with location state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  // Reset scroll when switching tabs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  useEffect(() => {
    // Show modal if bank details haven't been set and they haven't seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem('emporia_bank_popup_seen');
    if (!bankLoading && !hasBankInfo && !hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsBankModalOpen(true);
        sessionStorage.setItem('emporia_bank_popup_seen', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [bankLoading, hasBankInfo]);

  const handleBankModalClose = () => {
    setIsBankModalOpen(false);
    refetchBank();
  };

  const { data: tradesData, isLoading: tradesLoading } = useSellerTrades();
  const recentTrades = tradesData?.dashboardRecords || [];

  const stats = [
    {
      icon: Truck,
      title: 'Pending Deliveries',
      value: tradesData ? tradesData.dashboardRecords.filter(t => t.tradeStatus !== 'DELIVERED').length.toString() : '0',
      subtitle: 'Active in-system trades',
      subtitleIcon: Clock,
    },
    {
      icon: DollarSign,
      title: 'Total Secured Volume',
      value: tradesData ? `$${(tradesData.dashboardRecords.reduce((acc, t) => acc + (t.amount || 0), 0)).toLocaleString()}` : '$0',
      subtitle: 'Total contract value',
      subtitleIcon: TrendingUp,
    },
    {
      icon: CheckCircle,
      title: 'Completed Deliveries',
      value: tradesData ? tradesData.dashboardRecords.filter(t => t.tradeStatus === 'DELIVERED').length.toString() : '0',
      subtitle: 'Successfully closed',
      subtitleIcon: null,
    },
  ];



  return (
    <div className="min-h-screen bg-slate-50">
      <SellerNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className={activeTab === 'tracking' ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {activeTab !== 'tracking' && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'trade' && 'New Escrow Trade'}
                {activeTab === 'buyers' && 'Buyer Directory'}
                {activeTab === 'drivers' && 'Driver Directory'}
                {activeTab === 'goods' && 'Assign Goods to Drivers'}
                {/* {activeTab === 'financials' && 'Financial Records'} */}
                {activeTab !== 'overview' && activeTab !== 'trade' && activeTab !== 'buyers' && activeTab !== 'drivers' && activeTab !== 'goods' && activeTab !== 'financials' && activeTab.replace('-', ' ')}
              </h1>
              <p className="text-slate-600">
                {activeTab === 'overview' && 'Institutional Seller Portal Overview'}
                {activeTab === 'trade' && 'Initiate secure B2B transactions with escrow protection'}
                {activeTab === 'buyers' && 'Manage institutional relationships and verified procurement partners'}
                {activeTab === 'drivers' && 'Access our network of verified institutional logistics partners'}
                {activeTab === 'goods' && 'Generate onboarding links for drivers to begin shipment protocols'}
                {/* {activeTab === 'financials' && 'Manage settlement history and track funds in custody'} */}
              </p>
            </div>
            {!bankLoading && !hasBankInfo && (
              <button
                onClick={() => setIsBankModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all font-bold shadow-md hover:shadow-lg text-sm uppercase tracking-wider"
              >
                <DollarSign className="w-4 h-4" />
                Submit Bank Info
              </button>
            )}
          </div>
        )}

        {activeTab === 'overview' && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <StatsCard key={idx} {...stat} />
              ))}
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Recent Trades</h2>
                <button
                  onClick={() => navigate('/seller/logistics')}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  View All
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Buyer
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Goods
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradesLoading ? (
                      <tr>
                        <td colSpan="4" className="py-12 text-center">
                          <div className="flex items-center justify-center gap-2 text-slate-500">
                            <Clock className="w-5 h-5 animate-spin" />
                            Loading your trades...
                          </div>
                        </td>
                      </tr>
                    ) : recentTrades.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-slate-500">
                          No trades found. Start by creating a new trade.
                        </td>
                      </tr>
                    ) : (
                      recentTrades.slice(0, 10).map((trade) => (
                        <tr
                          key={trade.tradeId}
                          className="border-b border-slate-200 hover:bg-slate-50 transition"
                        >
                          <td className="py-4 px-4 text-slate-900 font-medium">
                            {trade.buyerName || 'Awaiting Buyer'}
                          </td>
                          <td className="py-4 px-4 text-slate-700">
                            {trade.goods}
                          </td>
                          <td className="py-4 px-4 text-slate-900 font-semibold">
                            ${trade.amount?.toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                trade.tradeStatus === 'DELIVERED' || trade.tradeStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                trade.tradeStatus === 'FLAGGED' ? 'bg-red-100 text-red-800' :
                                trade.tradeStatus === 'IN_TRANSIT' ? 'bg-orange-100 text-orange-800' :
                                trade.tradeStatus === 'CREATED' || trade.tradeStatus === 'BUYER_JOINED' ? 'bg-blue-100 text-blue-800' :
                                'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {trade.tradeStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'trade' && (
          <SellerTradeTab />
        )}

        {activeTab === 'buyers' && (
          <SellerBuyersTab />
        )}

        {activeTab === 'drivers' && (
          <SellerDriversTab />
        )}

        {activeTab === 'goods' && (
          <SellerAssignGoodsTab />
        )}

        {activeTab === 'flagged' && (
          <SellerFlaggedTab />
        )}

        {activeTab === 'tracking' && (
          <SellerLiveTrackingTab />
        )}

        {activeTab === 'financials' && (
          <SellerFinancialTab />
        )}

        {/* {activeTab !== 'overview' && activeTab !== 'trade' && activeTab !== 'buyers' && activeTab !== 'drivers' && activeTab !== 'goods' && activeTab !== 'flagged' && activeTab !== 'tracking' && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600 text-lg">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} section coming soon
            </p>
            
          </div>
        )} */}
      </main>

      <BankAccountModal 
        isOpen={isBankModalOpen} 
        onClose={handleBankModalClose} 
      />
    </div>
  );
}
