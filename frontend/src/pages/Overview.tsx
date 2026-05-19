import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  Star, 
  CreditCard, 
  CalendarDays,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Utensils,
  Plane as PlaneIcon,
  ShoppingBag,
  Car,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import api from '../lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function Overview() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, transRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/transactions')
        ]);
        setDashboardData(dashRes.data);
        setRecentTransactions(transRes.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch overview data:', error);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { title: '本月總消費', value: `NT$ ${dashboardData?.total_spending.toLocaleString() || 0}`, trend: '較上月增加 0%', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: '累積回饋價值', value: `NT$ ${dashboardData?.total_cashback.toLocaleString() || 0}`, trend: `平均回饋率 ${(dashboardData?.total_cashback / (dashboardData?.total_spending || 1) * 100).toFixed(1)}%`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', fill: true },
    { title: '活躍信用卡', value: `${dashboardData?.card_cashback.length || 0} 張`, trend: '回饋持續累積中', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50', warning: false },
  ];

  const deadlines: any[] = []; // Placeholder

  const progressData = dashboardData?.card_cashback.map((c: any) => ({
    name: c.card_name,
    rate: '回饋累積中',
    percent: Math.min((c.cashback / 1000) * 100, 100), // Dummy progress
    spent: '-',
    total: '1,000',
    color: 'bg-blue-600'
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">本月財務總覽</h1>
          <p className="text-gray-500 mt-1">即時分析您的消費與回饋數據。</p>
        </div>
        <button 
          onClick={() => navigate('/suggestions')}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
        >
          <Sparkles size={18} />
          智能推薦最佳卡片
        </button>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            onClick={() => navigate('/analysis')}
            className="bg-white rounded-xl p-6 border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow group relative overflow-hidden cursor-pointer"
          >
            {card.fill && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-bl-full opacity-30 -mr-8 -mt-8 pointer-events-none"></div>
            )}
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="text-sm font-medium text-gray-500">{card.title}</span>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", card.bg, card.color)}>
                <card.icon size={20} />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <p className={cn(
                "text-xs mt-1 flex items-center gap-1 font-medium",
                card.warning ? "text-amber-600" : card.color === 'text-blue-600' ? "text-green-600" : "text-gray-400"
              )}>
                {card.color === 'text-blue-600' && <TrendingUp size={14} className="rotate-180" />}
                {card.warning && <AlertTriangle size={14} />}
                {card.trend}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Deadlines Card - Placeholder */}
        <motion.div 
          variants={itemVariants} 
          onClick={() => navigate('/import')}
          className="bg-white rounded-xl p-6 border border-red-100 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-500">近期繳款期限</span>
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <CalendarDays size={20} />
            </div>
          </div>
          <div className="space-y-3 text-xs text-gray-400">
            目前無即將到期的繳款。
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Grid */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 border border-gray-200 lg:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
              卡片回饋累積
            </h2>
          </div>
          <div className="space-y-6">
            {progressData.length > 0 ? progressData.map((item: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                    <p className="text-[10px] text-gray-400 tracking-wider font-mono">{item.rate}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 font-mono">{item.percent.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            )) : <p className="text-sm text-gray-400">尚無數據</p>}
          </div>
        </motion.div>

        {/* Transactions Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl p-0 border border-gray-200 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">近期交易</h2>
              <p className="text-xs text-gray-400 mt-0.5">AI 自動分類與回饋計算</p>
            </div>
            <button 
              onClick={() => navigate('/analysis')}
              className="text-sm font-bold text-primary hover:underline"
            >
              完整明細
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100 uppercase tracking-widest font-mono">
                  <th className="p-4 font-medium pl-6">交易對象 / 時間</th>
                  <th className="p-4 font-medium">分類</th>
                  <th className="p-4 font-medium">回饋</th>
                  <th className="p-4 font-medium text-right pr-6">金額 (NT$)</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {recentTransactions.map((t, i) => {
                  const Icon = getIconForCategory(t.category);
                  return (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors border-b border-gray-50 group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{t.clean_name || t.raw_name}</p>
                            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">{t.trans_date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          {t.category}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-amber-600 font-bold">+{t.cashback.toFixed(1)}</td>
                      <td className="p-4 text-right pr-6 font-bold font-mono text-gray-900">
                        {t.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
