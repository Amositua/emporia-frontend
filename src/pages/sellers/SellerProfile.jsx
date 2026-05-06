import { Building2, Phone, MapPin, User, Hash, Landmark, ShieldCheck, Loader2 } from 'lucide-react';
import { SellerNav } from '../../components/SellerNav';
import { useBankAccountDetails } from '../../hooks/useProfile';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SellerProfile() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: details, isLoading, error } = useBankAccountDetails();

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'profile') {
      navigate('/seller/dashboard', { state: { activeTab: tabId } });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SellerNav activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SellerNav activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="max-w-4xl mx-auto p-8 text-center text-red-600">
          Failed to load profile details. Please try again later.
        </div>
      </div>
    );
  }

  const seller = details?.seller;

  return (
    <div className="min-h-screen bg-slate-50">
      <SellerNav activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-4xl font-bold text-slate-900">{seller?.businessName}</h1>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Seller
            </div>
          </div>
          <p className="text-slate-500 text-lg">
            Tier 1 Strategic Trading Partner on the Emporia B2B Protocol since {new Date(seller?.createdAt).getFullYear()}.
          </p>
        </div>

        <div className="space-y-12">
          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <InfoCard 
                icon={Building2} 
                label="BUSINESS NAME" 
                value={seller?.businessName + " Limited"} 
              />
              <InfoCard 
                icon={Phone} 
                label="PHONE NUMBER" 
                value={seller?.phoneNumber} 
              />
            </div>
            <InfoCard 
              icon={MapPin} 
              label="BUSINESS ADDRESS" 
              value={seller?.kycAddress || user?.kycAddress}
            />
          </section>

          {/* Account Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Account Information</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <InfoCard 
                icon={User} 
                label="ACCOUNT NAME" 
                value={details?.accountName} 
              />
              <InfoCard 
                icon={Hash} 
                label="ACCOUNT NUMBER" 
                value={details?.accountNumber} 
              />
            </div>
            <InfoCard 
              icon={Landmark} 
              label="BANK NAME" 
              value={details?.bankName} 
            />
          </section>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-slate-700" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-slate-900 font-bold text-lg">{value || 'N/A'}</p>
      </div>
    </div>
  );
}
