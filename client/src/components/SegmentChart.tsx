/**
 * Segment distribution pie chart using Recharts.
 * Displays the breakdown of customer segments.
 */

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SegmentDistributionItem } from '../types/dashboard';

interface SegmentChartProps {
  data: SegmentDistributionItem[];
  loading?: boolean;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6'];

export default function SegmentChart({ data, loading = false }: SegmentChartProps) {
  const chartData = data.map((item) => ({
    name: item.display || item.segment,
    value: item.count,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-sm font-bold text-slate-700 mb-5">توزيع الشرائح</h3>

      {loading ? (
        <div className="h-64 bg-slate-50 rounded-xl animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          لا توجد بيانات
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [value.toLocaleString('ar-SA'), 'العملاء']}
              contentStyle={{ fontFamily: 'Tajawal', direction: 'rtl', borderRadius: '12px', border: '1px solid #e2e8f0' }}
            />
            <Legend
              formatter={(value) => <span style={{ fontFamily: 'Tajawal', fontSize: '12px' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
