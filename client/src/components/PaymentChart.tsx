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

const BAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

export default function PaymentChart({ data, loading = false }: PaymentChartProps) {
  const chartData = data.map((item) => ({
    name: PAYMENT_LABELS[item.method.toLowerCase()] ?? item.method,
    value: item.count,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-sm font-bold text-slate-700 mb-5">COD مقابل مدفوع مسبقاً</h3>

      {loading ? (
        <div className="h-64 bg-slate-50 rounded-xl animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          لا توجد بيانات
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
            <XAxis
              dataKey="name"
              tick={{ fontFamily: 'Tajawal', fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontFamily: 'Tajawal', fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [value.toLocaleString('ar-SA'), 'الطلبات']}
              contentStyle={{ fontFamily: 'Tajawal', direction: 'rtl', borderRadius: '12px', border: '1px solid #e2e8f0' }}
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
