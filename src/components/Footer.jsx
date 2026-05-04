export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">EMPORIA</span>
            <span className="text-sm text-slate-600">
              © 2024 Emporia Protocol. Secure B2B Escrow.
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <a
              href="#privacy"
              className="text-slate-600 hover:text-slate-900 transition"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="text-slate-600 hover:text-slate-900 transition"
            >
              Terms of Service
            </a>
            <a
              href="#security"
              className="text-slate-600 hover:text-slate-900 transition"
            >
              Security
            </a>
            <a
              href="#compliance"
              className="text-slate-600 hover:text-slate-900 transition"
            >
              Compliance
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
