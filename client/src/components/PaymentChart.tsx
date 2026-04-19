/**
 * Payment distribution bar chart using Recharts.
 * Compares COD vs prepaid orders.
 */

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PaymentDistributionItem } from '../types/dashboard';

interface PaymentChartProps {
  data: PaymentDistributionItem[];
  loading?: boolean;
}

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'الدفع عند الاستلام',
  cash_on_delivery: 'الدفع عند الاستلام',
  prepaid: 'مدفوع مسبقاً',
  credit_card: 'بطاقة ائتمان',
  bank_transfer: 'تحويل بنكي',
  wallet: 'محفظة إلكترونية',
  tabby: 'تابي',
  tamara: 'تمارا',
};

const BAR_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#7C3AED'];

export default function PaymentChart({ data, loading = false }: PaymentChartProps) {
  const chartData = data.map((item) => ({
    name: PAYMENT_LABELS[item.method.toLowerCase()] ?? item.method,
    value: item.count,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-base font-bold text-slate-800 mb-5">COD مقابل مدفوع مسبقاً</h3>

      {loading ? (
        <div className="h-64 bg-slate-50 rounded-xl animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
          <span className="text-4xl">📊</span>
          <p className="text-sm">لا توجد بيانات للعرض</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
            <XAxis
              dataKey="name"
              tick={{ fontFamily: 'Baloo Bhaijaan 2', fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontFamily: 'Baloo Bhaijaan 2', fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [value.toLocaleString('ar-SA'), 'الطلبات']}
              contentStyle={{
                fontFamily: 'Baloo Bhaijaan 2',
                direction: 'rtl',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
