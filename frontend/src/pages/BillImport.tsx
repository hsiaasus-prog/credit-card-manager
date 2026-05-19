import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CloudUpload, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Key,
  ShieldCheck,
  Building2,
  History as HistoryIcon,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import api from '../lib/api';

export default function BillImport() {
  const navigate = useNavigate();
  const [selectedBank, setSelectedBank] = useState('ctbc');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedBanks = [
    { id: 'ctbc', name: '中國信託', color: '#00A88F' },
    { id: 'taishin', name: '台新銀行', color: '#E50012' },
    { id: 'esun', name: '玉山銀行', color: '#00A859' },
    { id: 'cathay', name: '國泰世華', color: '#00A94F' },
    { id: 'fubon', name: '台北富邦', color: '#004A99' },
    { id: 'dbs', name: '星展銀行', color: '#FF0000' },
  ];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post(`/upload?bank_name=${selectedBank}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus({ success: true, message: res.data.message });
    } catch (error: any) {
      setUploadStatus({ success: false, message: error.response?.data?.detail || '上傳失敗' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">匯入帳單資料</h1>
        <p className="text-gray-500 mt-1 max-w-2xl">
          安全上傳您的信用卡電子帳單，AI 將自動解析明細並更新消費分析。
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Bank Selection */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-primary" />
              選擇發卡銀行
            </h3>
            <div className="flex flex-wrap gap-3">
              {supportedBanks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBank(bank.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                    selectedBank === bank.id 
                      ? "bg-primary/10 border-primary text-primary shadow-sm" 
                      : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                  )}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bank.color }}></div>
                  {bank.name}
                </button>
              ))}
            </div>
          </section>

          {/* Upload Zone */}
          <section 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "bg-white border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center min-h-[350px] transition-all cursor-pointer group relative",
              isUploading ? "opacity-50 cursor-not-allowed" : "border-gray-200 hover:border-primary/40 hover:bg-blue-50/30"
            )}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUpload} 
              accept=".pdf" 
              className="hidden" 
              disabled={isUploading}
            />
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              {isUploading ? <Loader2 size={40} className="animate-spin" /> : <CloudUpload size={40} />}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {isUploading ? "解析帳單中..." : "點擊或拖曳 PDF 帳單至此處"}
            </h3>
            <p className="text-sm text-gray-400 mt-2 text-center max-w-xs">
              目前選擇：{supportedBanks.find(b => b.id === selectedBank)?.name}
            </p>
            
            {uploadStatus && (
              <div className={cn(
                "mt-6 p-4 rounded-lg flex items-center gap-3 text-sm font-bold",
                uploadStatus.success ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
              )}>
                {uploadStatus.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {uploadStatus.message}
              </div>
            )}

            <div className="mt-12 flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold border border-green-100">
              <ShieldCheck size={16} />
              本機端處理，隱私安全無虞
            </div>
          </section>

          {/* History Section - Placeholder */}
          <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <HistoryIcon size={20} className="text-primary" />
                帳單解析說明
              </h2>
            </div>
            <div className="p-6 text-sm text-gray-500 space-y-2">
              <p>1. 本工具使用 AI 進行店家名稱清理與分類。</p>
              <p>2. 解析過程約需 5-10 秒，視交易筆數而定。</p>
              <p>3. 若 PDF 有加密，請先在「保險箱」設定解鎖密碼。</p>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-primary">
                <Key size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">密碼提示</h3>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed relative z-10">
              電子帳單密碼通常為「身分證字號」或「出生年月日」。
            </p>
            <button 
              onClick={() => navigate('/settings')}
              className="w-full mt-6 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors relative z-10"
            >
              前往保險箱設定
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
