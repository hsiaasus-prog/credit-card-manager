import React from 'react';
import { Search, Bell, Settings, Menu } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 md:px-8 md:pl-72">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-72 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="搜尋交易、設定或卡片..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400"
          />
        </div>
        
        <span className="md:hidden text-lg font-bold text-primary">信用卡管家</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Settings size={20} />
        </button>
        
        <div className="md:hidden w-8 h-8 rounded-full overflow-hidden ml-2">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
