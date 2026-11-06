import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User as UserIcon, Wrench, Sparkles } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { user, switchDemoAccount } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = async (role: 'admin' | 'customer' | 'provider', email?: string, path?: string) => {
    try {
      await switchDemoAccount(role, email);
      if (path) {
        navigate(path);
      } else if (role === 'admin') {
        navigate('/admin/overview');
      } else if (role === 'provider') {
        navigate('/provider/overview');
      } else {
        navigate('/customer/overview');
      }
    } catch (err) {
      console.error('Demo switch failed:', err);
    }
  };

  return (
    <div className="bg-slate-900 text-white text-xs py-1.5 px-4 flex flex-wrap items-center justify-between border-b border-slate-800 shadow-inner z-50">
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
        <span className="font-semibold text-slate-200">Interactive Demo Mode:</span>
        <span className="text-slate-400 hidden sm:inline">
          Switch active user with complete seeded workflow history in 1-click:
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mt-1 sm:mt-0">
        <button
          onClick={() => handleSwitch('customer', 'alex@example.com')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition font-medium ${
            user?.email === 'alex@example.com'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="Customer with pending sign-off & dispute"
        >
          <UserIcon className="w-3 h-3 text-blue-400" />
          <span>Customer (Alex)</span>
        </button>

        <button
          onClick={() => handleSwitch('customer', 'david@example.com')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition font-medium ${
            user?.email === 'david@example.com'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="Customer with pending scope change approval"
        >
          <UserIcon className="w-3 h-3 text-cyan-400" />
          <span>Customer (David)</span>
        </button>

        <button
          onClick={() => handleSwitch('provider', 'marcus@vanceelectric.com')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition font-medium ${
            user?.email === 'marcus@vanceelectric.com'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="Service Provider with incoming booking request"
        >
          <Wrench className="w-3 h-3 text-emerald-400" />
          <span>Provider (Marcus)</span>
        </button>

        <button
          onClick={() => handleSwitch('provider', 'liam@apexair.com')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition font-medium ${
            user?.email === 'liam@apexair.com'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="Service Provider with active in-progress job"
        >
          <Wrench className="w-3 h-3 text-teal-400" />
          <span>Provider (Liam)</span>
        </button>

        <button
          onClick={() => handleSwitch('admin', 'admin@servicevisit.com')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition font-medium ${
            user?.role === 'admin'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="Platform Administrator"
        >
          <ShieldCheck className="w-3 h-3 text-purple-400" />
          <span>Admin</span>
        </button>
      </div>
    </div>
  );
};

