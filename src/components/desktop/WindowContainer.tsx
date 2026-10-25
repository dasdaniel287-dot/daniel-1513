import React from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { ModuleKey } from '../../types/nexus';

interface WindowContainerProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

export const WindowContainer: React.FC<WindowContainerProps> = ({
  title,
  subtitle,
  icon,
  children,
  isMaximized,
  onToggleMaximize,
  onMinimize,
  onClose,
}) => {
  return (
    <div 
      className={`flex flex-col bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-200 ${
        isMaximized 
          ? 'fixed inset-x-2 top-12 bottom-18 z-20' 
          : 'w-full max-w-7xl mx-auto my-3 h-[calc(100vh-130px)] z-10'
      }`}
    >
      {/* Window Title Bar */}
      <div className="h-10 bg-slate-900/90 border-b border-slate-800/90 px-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-cyan-400">{icon}</span>}
          <h2 className="font-semibold text-slate-100 text-sm tracking-wide">
            {title}
          </h2>
          {subtitle && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-400 font-mono">{subtitle}</span>
            </>
          )}
        </div>

        {/* Window action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onMinimize}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Minimize window"
            aria-label="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleMaximize}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={isMaximized ? 'Restore window size' : 'Maximize window'}
            aria-label="Maximize"
          >
            {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
            title="Close module"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-slate-100">
        {children}
      </div>
    </div>
  );
};
