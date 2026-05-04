import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, Truck } from 'lucide-react';

export function RoleSelection() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'buyer',
      title: 'I am a Buyer',
      description: 'Securely purchase goods with automated escrow protection.',
      icon: ShoppingCart,
      path: '/buyer/onboarding',
    },
    {
      id: 'seller',
      title: 'I am a Seller',
      description: 'Guarantee payment and grow your business with institutional trust.',
      icon: Store,
      path: '/seller/onboarding',
    },
    {
      id: 'driver',
      title: 'I am a Driver',
      description: 'Verify deliveries and ensure smooth logistics across the continent.',
      icon: Truck,
      path: '/driver/onboarding',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">Emporia</span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Hero text */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Welcome to <span className="text-red-600">Emporia</span>
            </h1>
            <p className="text-slate-500 text-base">
              Select your role to begin securing your commerce.
            </p>
            {/* Red accent underline */}
            <div className="mx-auto mt-4 w-12 h-1 bg-red-600 rounded-full"></div>
          </div>

          {/* Role cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map(({ id, title, description, icon: Icon, path }) => (
              <div
                key={id}
                className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center text-center hover:shadow-xl hover:border-red-100 transition duration-300"
              >
                {/* Icon box — soft red tint */}
                <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-red-500" />
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  {title}
                </h2>

                <p className="text-slate-500 mb-6 flex-1 text-sm leading-relaxed">
                  {description}
                </p>

                {/* Red button */}
                <button
                  onClick={() => navigate(path)}
                  className="w-full px-4 py-2.5 border-2 border-slate-800 text-slate-800 hover:bg-slate-50 font-bold rounded-lg transition duration-200 uppercase tracking-wide text-sm"
                >
                  Select Role
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          <p>© 2024 Emporia Protocol. Secure B2B Escrow.</p>
        </div>
      </footer>
    </div>
  );
}
