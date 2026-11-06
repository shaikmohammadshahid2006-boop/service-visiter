import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Search, Star, ShieldCheck, ShieldAlert, DollarSign } from 'lucide-react';

export const AdminProviders: React.FC = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProviders = async () => {
    try {
      const res = await api.get('/admin/users?role=provider');
      if (res.data.success) {
        setProviders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/admin/users/${user._id}/status`, { status: newStatus });
      setProviders((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = providers.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.profile?.businessName && p.profile.businessName.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return <LoadingSpinner message="Loading provider directory..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Service Provider Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Certified trade contractors, verified licenses, billing rates, and quality ratings.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search provider, business, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Specialist & Business</th>
              <th className="py-3 px-4">Categories</th>
              <th className="py-3 px-4">Rate & Rating</th>
              <th className="py-3 px-4">License / Verification</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-500">{p.profile?.businessName}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {p.profile?.categories?.map((c: any) => (
                      <span key={c._id || c} className="bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-0.5 rounded">
                        {c.name || 'Trade'}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <span>${p.profile?.hourlyRate || 65}/hr</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                      <Star className="w-3 h-3 fill-current" /> {p.profile?.ratingAverage?.toFixed(1) || '5.0'}
                    </span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-slate-600">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>{p.profile?.licenseNumber || 'State Verified'}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <StatusBadge status={p.status} size="sm" />
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleToggleStatus(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      p.status === 'active'
                        ? 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                        : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {p.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

