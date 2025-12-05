import React from 'react';
import { Shirt, Wand2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-lg shadow-lg shadow-orange-500/20">
            <Shirt className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              JerseyFusion AI
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">GEMINI 2.5 POWERED</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
          <Wand2 size={14} className="text-orange-400" />
          <span>Virtual Kit Try-On</span>
        </div>
      </div>
    </header>
  );
};