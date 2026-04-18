/**
 * KPI card component — displays a single metric with label, value, and optional trend indicator.
 */

interface KPICardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'primary' | 'teal';
  loading?: boolean;
}

const colorMap: Record<string, { bg: string; icon: string; value: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-500', value: 'text-blue-700' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-500', value: 'text-emerald-700' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-500', value: 'text-amber-700' },
  red: { bg: 'bg-red-50', icon: 'text-red-500', value: 'text-red-700' },
  primary: { bg: 'bg-primary-50', icon: 'text-primary-500', value: 'text-primary-700' },
  teal: { bg: 'bg-teal-50', icon: 'text-teal-500', value: 'text-teal-700' },
};

export default function KPICard({ label, value, icon, color = 'primary', loading = false }: KPICardProps) {
  const colors = colorMap[color];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
      <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-1 font-medium">{label}</p>
        {loading ? (
          <div className="h-7 w-20 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          <p className={`text-2xl font-bold ${colors.value} leading-none`}>{value}</p>
        )}
      </div>
    </div>
  );
}
