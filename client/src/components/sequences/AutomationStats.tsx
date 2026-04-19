/**
 * AutomationStats — Section 3 of the Sequences Manager page.
 * Four stat cards: total, success, failed, success rate.
 */

import type { AutomationStats } from '../../types/sequences';

interface Props {
  stats: AutomationStats | null;
  loading: boolean;
}

interface StatCard {
  label: string;
  value: string;
  iconBg: string;
  valueColor: string;
  borderColor: string;
  icon: string;
}

function buildStatCards(stats: AutomationStats): StatCard[] {
  return [
    {
      label: 'إجمالي الرسائل المُرسلة',
      value: stats.total.toLocaleString('ar-SA'),
      icon: '📨',
      iconBg: '#EFF6FF',
      valueColor: '#1D4ED8',
      borderColor: '#3B82F6',
    },
    {
      label: 'نجح',
      value: stats.success.toLocaleString('ar-SA'),
      icon: '✅',
      iconBg: '#ECFDF5',
      valueColor: '#065F46',
      borderColor: '#10B981',
    },
    {
      label: 'فشل',
      value: stats.failed.toLocaleString('ar-SA'),
      icon: '❌',
      iconBg: '#FEF2F2',
      valueColor: '#991B1B',
      borderColor: '#EF4444',
    },
    {
      label: 'معدل النجاح',
      value: `${stats.successRate}%`,
      icon: '📊',
      iconBg: '#FFFBEB',
      valueColor: '#92400E',
      borderColor: '#F59E0B',
    },
  ];
}

export default function AutomationStats({ stats, loading }: Props) {
  const cards = stats ? buildStatCards(stats) : null;

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {loading || !cards
        ? Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-5 h-24 animate-pulse"
            />
          ))
        : cards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200"
              style={{ borderRight: `4px solid ${card.borderColor}` }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium mb-1.5">{card.label}</p>
                <p className="text-2xl font-bold leading-none" style={{ color: card.valueColor }}>
                  {card.value}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: card.iconBg }}
              >
                {card.icon}
              </div>
            </div>
          ))}
    </div>
  );
}
