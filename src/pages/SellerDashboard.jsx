import { useState } from 'react';
import { Truck, DollarSign, CircleCheck as CheckCircle, Clock, TrendingUp, ExternalLink } from 'lucide-react';
import { SellerNav } from '../components/SellerNav';
import { StatsCard } from '../components/StatsCard';

export function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      icon: Truck,
      title: 'Pending Deliveries',
      value: '8',
      subtitle: '3 arriving today',
      subtitleIcon: Clock,
    },
    {
      icon: DollarSign,
      title: 'Total Secured Volume',
      value: '$2.4M',
      subtitle: 'Historical total',
      subtitleIcon: TrendingUp,
    },
    {
      icon: CheckCircle,
      title: 'Completed Deliveries',
      value: '0',
      subtitle: 'First-time view',
      subtitleIcon: null,
    },
  ];

  const recentTrades = [
    {
      id: 1,
      buyer: 'Acme Industries',
      goods: 'Industrial Machinery',
      amount: '$125,000',
      status: 'Active',
      statusColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 2,
      buyer: 'Global Tech Corp',
      goods: 'Server Racks',
      amount: '$85,500',
      status: 'In Transit',
      statusColor: 'bg-red-100 text-red-800',
    },
    {
      id: 3,
      buyer: 'Pan-African Builders',
      goods: 'Raw Steel Ore',
      amount: '$450,000',
      status: 'Completed',
      statusColor: 'bg-green-100 text-green-800',
    },
    {
      id: 4,
      buyer: 'Lagos Mercantile',
      goods: 'Textile Shipment',
      amount: '$32,000',
      status: 'Active',
      statusColor: 'bg-blue-100 text-blue-800',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <SellerNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Command Center
              </h1>
              <p className="text-slate-600">
                Institutional Seller Dashboard Overview
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <StatsCard key={idx} {...stat} />
              ))}
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Recent Trades</h2>
                <a
                  href="#trades"
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  View All
                  <ExternalLink className="w-4 h-4" />
                </a>
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
                    {recentTrades.map((trade) => (
                      <tr
                        key={trade.id}
                        className="border-b border-slate-200 hover:bg-slate-50 transition"
                      >
                        <td className="py-4 px-4 text-slate-900 font-medium">
                          {trade.buyer}
                        </td>
                        <td className="py-4 px-4 text-slate-700">
                          {trade.goods}
                        </td>
                        <td className="py-4 px-4 text-slate-900 font-semibold">
                          {trade.amount}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${trade.statusColor}`}
                          >
                            {trade.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab !== 'overview' && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600 text-lg">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} section coming soon
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
