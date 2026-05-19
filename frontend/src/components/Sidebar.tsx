import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileUp, 
  Sparkles, 
  BarChart3, 
  Settings, 
  HelpCircle,
  LogOut,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const navigate = useNavigate();
  const navItems = [
    { title: '總覽面板', href: '/', icon: LayoutDashboard },
    { title: '帳單匯入', href: '/import', icon: FileUp },
    { title: '聰明消費', href: '/suggestions', icon: Sparkles },
    { title: '消費分析', href: '/analysis', icon: BarChart3 },
    { title: '系統設定', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 z-40">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">信用卡管家</h1>
        <p className="text-xs text-on-surface-variant mt-1">專業金融管家</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium",
              isActive 
                ? "bg-primary-container text-primary" 
                : "text-on-surface-variant hover:bg-gray-50"
            )}
          >
            <item.icon size={20} />
            {item.title}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 space-y-4">
        <button 
          onClick={() => navigate('/import')}
          className="w-full h-11 bg-primary text-white rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={18} />
          匯入新帳單
        </button>
        
        <div className="space-y-1 pt-4 border-t border-gray-100">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant hover:bg-gray-50 text-sm">
            <HelpCircle size={20} />
            幫助中心
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant hover:bg-gray-50 text-sm">
            <LogOut size={20} />
            登出
          </button>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">使用者姓名</p>
            <p className="text-xs text-gray-500">Premium 會員</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
