import { useState } from 'react';
import { Truck, MapPin, CircleCheck as CheckCircle, Clock, Shield } from 'lucide-react';
import { DriverNav } from '../../components/DriverNav';
import { StatsCard } from '../../components/StatsCard';

export function DriverDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      icon: Truck,
      title: 'Current Assignments',
      value: '1',
      subtitle: 'Awaiting pickup',
      subtitleIcon: Clock,
    },
    {
      icon: MapPin,
      title: 'Route Distance',
      value: '42 km',
      subtitle: 'Estimated today',
      subtitleIcon: null,
    },
    {
      icon: CheckCircle,
      title: 'Successful Drops',
      value: '124',
      subtitle: 'All-time total',
      subtitleIcon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <DriverNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Driver Hub
              </h1>
              <p className="text-slate-600">
                Verified Logistics Management
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <StatsCard key={idx} {...stat} />
              ))}
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Current Mission</h2>
              <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                <Truck className="w-8 h-8 text-red-600" />
                <div>
                  <p className="font-bold text-slate-900">Shipment #77291-B</p>
                  <p className="text-sm text-slate-600">Origin: Emporia Central Node • Destination: Lagos Port Complex</p>
                </div>
                <button className="ml-auto bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition">
                  Start Navigation
                </button>
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
