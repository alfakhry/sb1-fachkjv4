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

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#7C3AED', '#14B8A6'];

export default function SegmentChart({ data, loading = false }: SegmentChartProps) {
  const chartData = data.map((item) => ({
    name: item.display || item.segment,
    value: item.count,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-base font-bold text-slate-800 mb-5">توزيع الشرائح</h3>

      {loading ? (
        <div className="h-64 bg-slate-50 rounded-xl animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
          <span className="text-4xl">🎯</span>
          <p className="text-sm">لا توجد بيانات للعرض</p>
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
              contentStyle={{
                fontFamily: 'Baloo Bhaijaan 2',
                direction: 'rtl',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Legend
              formatter={(value: number | string) => (
                <span style={{ fontFamily: 'Baloo Bhaijaan 2', fontSize: '12px', color: '#475569' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
