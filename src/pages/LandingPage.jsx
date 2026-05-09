import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  BarChart2,
  UserX,
  Lock,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

/* ── Navbar ── */
function Navbar({ onGetStarted }) {
  const links = ['Features', 'Protocol', 'Developer', 'Pricing'];
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white font-black text-xs">E</span>
          </div>
          <span className="text-base font-black text-slate-900 tracking-tight">Emporia</span>
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-sm text-slate-500 hover:text-slate-900 transition font-medium"
            >
              {l}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <button
          onClick={onGetStarted}
          className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded transition"
        >
          Get Started
        </button>
      </div>
    </header>
  );
}

/* ── Floating Trade Card ── */
function TradeCard({ label, title, badge, badgeColor, amount, sub, subIcon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-md w-56">
      {/* Label */}
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-sm font-bold text-slate-900 leading-tight">{title}</p>
        <span
          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${badgeColor}`}
        >
          {badge}
        </span>
      </div>
      {/* Amount */}
      {amount && (
        <div className="flex items-center justify-between">
          <p className="text-lg font-black text-slate-900 font-mono">{amount}</p>
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <Lock className="w-4 h-4 text-red-500" />
          </div>
        </div>
      )}
      {/* Sub */}
      {sub && (
        <div className="flex items-center gap-1.5 mt-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
          <p className="text-[10px] font-semibold text-slate-500">{sub}</p>
        </div>
      )}
    </div>
  );
}

/* ── Feature Card ── */
function FeatureCard({ icon: Icon, title, description, dark }) {
  return (
    <div
      className={`rounded-xl p-6 border ${
        dark
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${
          dark ? 'bg-slate-800' : 'bg-slate-100'
        }`}
      >
        <Icon className={`w-4 h-4 ${dark ? 'text-white' : 'text-slate-600'}`} />
      </div>
      <h3 className={`text-sm font-bold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h3>
      <p className={`text-xs leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        {description}
      </p>
    </div>
  );
}

/* ── Timeline Step ── */
function ProtocolStep({ number, title, description, isLeft, isLast }) {
  return (
    <div className="relative flex items-start gap-0">
      {/* Left content */}
      <div className={`flex-1 ${isLeft ? 'text-right pr-10' : 'pr-10 invisible'}`}>
        {isLeft && (
          <div className="inline-block text-left max-w-xs">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">
              Step {number}
            </p>
            <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
          </div>
        )}
      </div>

      {/* Center spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-8 h-8 rounded-full border-2 border-red-200 bg-white flex items-center justify-center z-10">
          <div className="w-3 h-3 rounded-full bg-red-500" />
        </div>
        {!isLast && <div className="w-0.5 h-16 bg-slate-200 mt-1" />}
      </div>

      {/* Right content */}
      <div className={`flex-1 ${!isLeft ? 'text-left pl-10' : 'pl-10 invisible'}`}>
        {!isLeft && (
          <div className="max-w-xs">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">
              Step {number}
            </p>
            <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Main Landing Page
   ══════════════════════════════════════════════════ */
export function LandingPage() {
  const navigate = useNavigate();
  const handleGetStarted = () => navigate('/get-started');

  const features = [
    {
      icon: UserX,
      title: 'Eliminate Default Risk',
      description:
        'Parties are cryptographically bound by terms agreed upon. Funds cannot be unilaterally withdrawn until both parties confirm.',
    },
    {
      icon: BarChart2,
      title: 'Transparent Milestone Tracking',
      description:
        'Connected smart contracts link to logistics APIs. Both parties have real-time visibility into the exact status of the transaction and funds.',
    },
    {
      icon: Zap,
      title: 'Accelerated Settlement',
      description:
        'Instant delivery tracking allows. Once delivery is confirmed, settlement happens autonomously without human intervention or manual processing steps.',
    },
    {
      icon: ShieldCheck,
      title: 'Bank-Grade Security',
      description:
        'Audited smart contracts are in trust secured. All data cannot be accessed, moved, or altered by a non-authorized parties.',
      dark: true,
    },
  ];

  const steps = [
    {
      title: 'Create Transaction',
      description:
        'Buyer and Seller signed on terms, transact securely via the Emporia smart contract API.',
    },
    {
      title: 'Lock Funds in Escrow',
      description:
        'Buyer sends the transaction fee value into the Emporia protocol. Funds are cryptographically secured.',
    },
    {
      title: 'Verify Delivery',
      description:
        'Seller ships goods. Buyer or designated third party uses QR code or manual scan to verify terms are met.',
    },
    {
      title: 'Automatic Release',
      description:
        'Upon verification, smart contract automatically routes funds to the Seller\'s account immediately.',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar onGetStarted={handleGetStarted} />

      {/* ── HERO ── */}
      <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto" id="features">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-slate-200 rounded-full mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Institutional Grade Protocol V0.0.1
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-6">
              Autonomous Trust for{' '}
              <span className="text-red-600">African Commerce.</span>
            </h1>

            {/* Subtext */}
            <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-md">
              Bridge the trust gap between buyers and sellers with Emporia's institutional-grade
              escrow protocol. Secure, transparent, and built for B2B growth across the continent.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3 mb-12">
              <button
                onClick={handleGetStarted}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded transition"
              >
                Secure Your First Trade
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => document.getElementById('protocol')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-6 py-2.5 border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-black uppercase tracking-widest rounded transition"
              >
                View Protocol Docs
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-10 border-t border-slate-100 pt-8">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Secured Volume
                </p>
                {/* <p className="text-2xl font-black text-slate-900">$350M+</p> */}
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Active Parts
                </p>
                {/* <p className="text-2xl font-black text-slate-900">12,400+</p> */}
              </div>
            </div>
          </div>

          {/* Right — Floating Trade Cards */}
          <div className="relative hidden lg:flex justify-center items-center">
            {/* Background subtle shape */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-red-50/30 rounded-3xl" />

            <div className="relative space-y-4 py-12 px-8">
              <TradeCard
                label="Contract #009-A · Agricultural Export"
                title="Agricultural Export"
                badge="In Escrow"
                badgeColor="bg-red-100 text-red-700"
                amount="$125,000.00"
              />
              <div className="ml-8">
                <TradeCard
                  label="Contract #014-B · Machinery Import"
                  title="Machinery Import"
                  badge="Completed"
                  badgeColor="bg-green-100 text-green-700"
                  sub="Funds Released to Seller"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OVERCOMING TRUST DEFICIT ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-black text-slate-900 mb-3">
              Overcoming the Trust Deficit
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              Traditional B2B transactions in emerging markets are plagued by counterparty risk,
              delayed payments, and opaque dispute resolution. Emporia replaces uncertainty with an
              autonomous logic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROTOCOL LIFECYCLE ── */}
      <section className="py-24 px-6 bg-white" id="protocol">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-black text-slate-900 mb-3">The Protocol Lifecycle</h2>
            <p className="text-sm text-slate-500">Four deterministic steps to secure commerce.</p>
          </div>

          <div className="space-y-0">
            {steps.map((step, idx) => (
              <ProtocolStep
                key={step.title}
                number={idx + 1}
                title={step.title}
                description={step.description}
                isLeft={idx % 2 === 0}
                isLast={idx === steps.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="py-12 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Security Audited By
            </p>
            <div className="flex items-center gap-6">
              {['QuantStamp', 'CertiK'].map((name) => (
                <span key={name} className="text-sm font-black text-slate-700">
                  {name}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-slate-200" />
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Institutional Partners
            </p>
            <div className="flex items-center gap-6">
              {['Standard Bank', 'Ecobank'].map((name) => (
                <span key={name} className="text-sm font-black text-slate-700">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-slate-100 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            {/* Logo + copyright */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                  <span className="text-white font-black text-[10px]">E</span>
                </div>
                <span className="text-sm font-black text-slate-900">Emporia</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs">
                © 2026 Emporia Protocol. All institutional rights reserved. B2B escrow infrastructure
                for African commerce.
              </p>
            </div>

            {/* Footer links */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {['General Terms', 'Privacy Policy', 'Service Terms', 'Security Audit', 'Contact Support'].map(
                (link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-[11px] text-slate-500 hover:text-slate-800 transition font-medium"
                  >
                    {link}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
