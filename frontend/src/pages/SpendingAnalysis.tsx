import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { 
  Wallet, 
  Gift, 
  Percent, 
  TrendingUp, 
  Utensils, 
  ShoppingBag, 
  Car, 
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';

const COLORS = ['#1a56db', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

export default function SpendingAnalysis() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch analysis data:', error);
      }
    };
    fetchData();
  }, []);

  const kpis = [
    { title: '總消費金額', value: `NT$ ${data?.total_spending.toLocaleString() || 0}`, trend: '+0%', icon: Wallet, trendColor: 'text-gray-400', trendBg: 'bg-gray-50' },
    { title: '總獲得回饋', value: `NT$ ${data?.total_cashback.toLocaleString() || 0}`, trend: '+0%', icon: Gift, trendColor: 'text-green-600', trendBg: 'bg-green-50', special: true },
    { title: '平均回饋率', value: `${(data?.total_cashback / (data?.total_spending || 1) * 100).toFixed(2)}%`, trend: '穩定', icon: Percent, trendColor: 'text-gray-400', trendBg: 'bg-gray-50' },
  ];

  const pieData = data?.category_spending.map((item: any) => ({
    name: item.category,
    value: item.amount
  })) || [];

  const barData = data?.card_cashback.map((item: any) => ({
    name: item.card_name,
    cashback: item.cashback
  })) || [];

  const getIconForCategory = (cat: string) => {
    switch (cat) {
      case '食': return Utensils;
      case '行': return Car;
      case '網購': return ShoppingBag;
      case '樂': return Sparkles;
      default: return Wallet;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">消費與回饋分析</h1>
          <p className="text-gray-500 mt-1">深入了解您的支出結構與各銀行回饋效益。</p>
        </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all relative overflow-hidden group">
            {kpi.special && <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-40 -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110"></div>}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">
              <kpi.icon size={16} className="text-gray-300" />
              {kpi.title}
            </div>
            <div className="flex items-end gap-3">
              <span className={cn("text-2xl font-black", kpi.special ? "text-primary" : "text-gray-900")}>
                {kpi.value}
              </span>
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 mb-1", kpi.trendBg, kpi.trendColor)}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Trend Chart (Cashback by Card) */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-lg font-bold text-gray-900">各卡片回饋貢獻</h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">獲得回饋</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} dx={-10} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="cashback" fill="#1a56db" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Chart */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-6 flex flex-col shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-8">消費類別佔比</h2>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">最大宗</span>
              <span className="text-base font-black text-gray-900">{pieData[0]?.name || '-'}</span>
            </div>
          </div>
          <div className="mt-auto space-y-3">
            {pieData.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="font-bold text-gray-700">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-gray-900">NT$ {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ranking Table */}
      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">銀行回饋貢獻排行</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-[10px] uppercase font-mono tracking-widest text-gray-400">
                <th className="px-6 py-4 font-medium">排名</th>
                <th className="px-6 py-4 font-medium">信用卡名稱</th>
                <th className="px-6 py-4 font-medium text-right">獲得回饋</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data?.card_cashback.sort((a: any, b: any) => b.cashback - a.cashback).map((item: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={cn(
                      "w-6 h-6 rounded flex items-center justify-center font-mono font-black text-xs",
                      i === 0 ? "bg-amber-100/50 text-amber-600" : "bg-gray-100 text-gray-500"
                    )}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-700">
                      {item.card_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-primary">NT$ {item.cashback.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
