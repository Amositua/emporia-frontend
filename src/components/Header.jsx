import { HelpCircle } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-xl font-bold text-slate-900">Emporia</span>
          {/* <img src="/assets/logo.png" alt="Emporia Logo" className="h-8 w-" /> */}
        </div>

        <div className="flex items-center gap-6">
          <a
            href="#support"
            className="text-slate-700 hover:text-slate-900 font-medium text-sm"
          >
            Support
          </a>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition">
            <HelpCircle className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </div>
    </header>
  );
}
