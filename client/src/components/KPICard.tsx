/**
 * KPI card — white card with colored right border, icon circle, large value.
 */

interface KPICardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'primary' | 'teal';
  loading?: boolean;
}

const colorMap: Record<string, { border: string; iconBg: string; valueText: string }> = {
  blue:    { border: '#3B82F6', iconBg: '#EFF6FF', valueText: '#1D4ED8' },
  green:   { border: '#10B981', iconBg: '#ECFDF5', valueText: '#065F46' },
  amber:   { border: '#F59E0B', iconBg: '#FFFBEB', valueText: '#92400E' },
  red:     { border: '#EF4444', iconBg: '#FEF2F2', valueText: '#991B1B' },
  primary: { border: '#4F46E5', iconBg: '#EEF2FF', valueText: '#3730A3' },
  teal:    { border: '#14B8A6', iconBg: '#F0FDFA', valueText: '#134E4A' },
};

export default function KPICard({ label, value, icon, color = 'primary', loading = false }: KPICardProps) {
  const c = colorMap[color];

  return (
    <div
      className="bg-white rounded-xl shadow-sm flex items-center gap-4 p-5 hover:shadow-md transition-shadow duration-200"
      style={{ borderRight: `4px solid ${c.border}` }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 mb-1.5">{label}</p>
        {loading ? (
          <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          <p className="text-2xl font-bold leading-none" style={{ color: c.valueText }}>
            {value}
          </p>
        )}
      </div>

      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: c.iconBg }}
      >
        {icon}
      </div>
    </div>
  );
}
