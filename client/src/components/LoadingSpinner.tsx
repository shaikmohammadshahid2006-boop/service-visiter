import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="mt-3 text-sm text-slate-500 font-medium">{message}</p>
    </div>
  );
};

