import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Trophy, 
  Zap, 
  Store,
  BrainCircuit,
  Lock,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import api from '../lib/api';

export default function SmartSuggestions() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('蝦皮購物');
  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSuggestion = async (merchant: string) => {
    if (!merchant) return;
    setLoading(true);
    try {
      const res = await api.get(`/suggest?merchant=${merchant}`);
      setSuggestion(res.data);
    } catch (error) {
      console.error('Failed to fetch suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestion(query);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSuggestion(query);
  };

  return (
    <div className="space-y-10 pb-20">
      <section className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">最佳刷卡建議</h1>
          <p className="text-lg text-gray-500 max-w-xl">
            輸入您即將消費的店家或平台，我們將為您即時計算最優惠的信用卡。
          </p>
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={28} />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="您要在哪裡消費？ (例如：蝦皮購物、加油站)"
              className="w-full pl-16 pr-24 py-5 bg-gray-50 border border-gray-200 rounded-2xl text-xl font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={24} />}
            </button>
          </form>
        </div>
      </section>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Store size={22} />
            </div>
            「{query}」的最佳卡片
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {suggestion && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg shadow-blue-900/5 relative flex flex-col"
                >
                  <div className="h-2 w-full bg-gradient-to-r from-primary via-blue-500 to-indigo-600"></div>
                  <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-primary text-white text-[10px] uppercase font-black tracking-widest rounded-md flex items-center gap-1.5">
                            <Trophy size={12} fill="white" />
                            最佳推薦
                          </span>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900">{suggestion.best_card}</h3>
                        <p className="text-sm font-medium text-gray-400">{suggestion.bank_name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">預估回饋率</p>
                        <p className="text-6xl font-black text-primary font-mono">{(suggestion.estimated_rate * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="bg-blue-50/50 rounded-2xl p-6 flex gap-5 border border-blue-100">
                      <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-md">
                        <BrainCircuit size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">系統分析建議</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          根據您目前的卡片組合與規則，此卡片在「{query}」消費可獲得最佳回饋。
                          系統已考慮卡片特定通路加碼規則。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border-t border-gray-100 p-6 md:px-10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                      <Lock size={14} />
                      安全分析確保隱私
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
