import React from 'react';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 animate-slide-in">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-slate-900">
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">{title}</span>
        </h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, trend, color, bgColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200/70 p-5 card-hover w-full text-left"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bgColor || 'bg-violet-50'}`}>
          <Icon size={20} className={color || 'text-violet-600'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate">{label}</p>
          <div className="flex items-end gap-2 mt-0.5">
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {trend && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                trend > 0
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-rose-600 bg-rose-50'
              }`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-violet-100 text-violet-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    info: 'bg-sky-100 text-sky-700',
  };
  return (
    <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-md uppercase tracking-wider ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}

export function GradientButton({ children, icon: Icon, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20 active:scale-[0.98] ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}

export function GlowCard({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/70 p-6 card-hover ${className}`}>
      {children}
    </div>
  );
}
