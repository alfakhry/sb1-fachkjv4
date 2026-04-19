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
  color: string;
  bg: string;
  icon: string;
}

function buildStatCards(stats: AutomationStats): StatCard[] {
  return [
    {
      label: 'إجمالي الرسائل المُرسلة',
      value: stats.total.toLocaleString('ar-SA'),
      icon: '📨',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      label: 'نجح',
      value: stats.success.toLocaleString('ar-SA'),
      icon: '✅',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      label: 'فشل',
      value: stats.failed.toLocaleString('ar-SA'),
      icon: '❌',
      color: 'text-red-700',
      bg: 'bg-red-50',
    },
    {
      label: 'معدل النجاح',
      value: `${stats.successRate}%`,
      icon: '📊',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
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
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-24 animate-pulse"
            />
          ))
        : cards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200"
            >
              <div
                className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center text-2xl flex-shrink-0`}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color} leading-none`}>
                  {card.value}
                </p>
              </div>
            </div>
          ))}
    </div>
  );
}
