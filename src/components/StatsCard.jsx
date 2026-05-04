export function StatsCard({ icon: Icon, title, value, subtitle, subtitleIcon: SubIcon }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          {title}
        </h3>
        <Icon className="w-6 h-6 text-slate-400" />
      </div>

      <p className="text-4xl font-bold text-slate-900 mb-3">{value}</p>

      <div className="flex items-center gap-2 text-sm text-slate-600">
        {SubIcon && <SubIcon className="w-4 h-4" />}
        <span>{subtitle}</span>
      </div>
    </div>
  );
}
