import React from 'react';
import { useAuth } from '../../context/useAuth';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toast } = useAuth();

  if (!toast) return null;

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-900/20';
      case 'warning':
      case 'error':
        return 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-900/20';
      case 'info':
      default:
        return 'bg-blue-950/90 border-blue-500/50 text-blue-200 shadow-blue-900/20';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2 flex-shrink-0" />;
      case 'warning':
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400 mr-2 flex-shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce">
      <div
        className={`flex items-center px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md max-w-md ${getStyle()}`}
      >
        {getIcon()}
        <span className="text-sm font-medium pr-2">{toast.message}</span>
      </div>
    </div>
  );
};
