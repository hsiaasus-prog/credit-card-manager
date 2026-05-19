import React, { useState, useEffect } from 'react';
import { Shield, Key, Save, Trash2, Building2, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';

export default function Settings() {
  const [banks, setBanks] = useState<string[]>([]);
  const [bankName, setBankName] = useState('ctbc');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<any>(null);

  const supportedBanks = [
    { id: 'ctbc', name: '中國信託' },
    { id: 'taishin', name: '台新銀行' },
    { id: 'esun', name: '玉山銀行' },
    { id: 'cathay', name: '國泰世華' },
    { id: 'fubon', name: '台北富邦' },
    { id: 'dbs', name: '星展銀行' },
  ];

  const fetchVault = async () => {
    try {
      const res = await api.get('/vault');
      setBanks(res.data);
    } catch (error) {
      console.error('Failed to fetch vault banks:', error);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveStatus(null);
    try {
      await api.post('/vault', { bank_name: bankName, password });
      setSaveStatus({ success: true, message: '密碼已安全存入保險箱' });
      setPassword('');
      fetchVault();
    } catch (error) {
      setSaveStatus({ success: false, message: '儲存失敗' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">個人設定與保險箱</h1>
        <p className="text-gray-500 mt-1">管理您的帳單解析密碼與系統偏好。所有資料均儲存於本機並加密保護。</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Vault Form */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="text-primary" />
              新增/更新密碼
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">選擇銀行</label>
                <select 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  {supportedBanks.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">PDF 解鎖密碼</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入身分證字號或生日"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                儲存至加密保險箱
              </button>
            </form>
            
            {saveStatus && (
              <div className={cn(
                "mt-4 p-3 rounded-lg flex items-center gap-2 text-sm font-bold",
                saveStatus.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}>
                {saveStatus.success ? <CheckCircle2 size={18} /> : <Trash2 size={18} />}
                {saveStatus.message}
              </div>
            )}
          </section>

          {/* Stored Banks */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">已儲存的銀行密碼</h3>
            <div className="space-y-3">
              {banks.length > 0 ? banks.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Building2 className="text-gray-400" size={20} />
                    <span className="font-bold text-gray-700">
                      {supportedBanks.find(sb => sb.id === b)?.name || b}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">已加密儲存</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-4">目前保險箱內無資料。</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white mb-4">
              <Shield size={24} />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">安全加密說明</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              您的密碼使用 AES-256 演算法進行加密，且金鑰僅存在於您的本地環境（.env）。
              任何時候都不會將原始密碼發送至雲端或 AI 服務。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
