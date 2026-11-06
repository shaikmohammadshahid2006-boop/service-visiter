import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Search, ShieldAlert, ShieldCheck, UserCheck, Phone, Mail, MapPin } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/users?role=customer');
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/admin/users/${user._id}/status`, { status: newStatus });
      setCustomers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner message="Loading customer directory..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Account Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered homeowner accounts, verified contact information, and access control.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
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
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Contact Info</th>
              <th className="py-3 px-4">Registered Service Address</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <span className="text-[10px] text-slate-400">ID: {c._id.slice(-6)}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-slate-600">
                  <p>{c.email}</p>
                  <p className="text-slate-400 text-[11px]">{c.phone || 'No phone provided'}</p>
                </td>

                <td className="py-3.5 px-4 text-slate-600">
                  {c.profile?.address?.street ? (
                    <div>
                      <p className="font-medium text-slate-800">{c.profile.address.street}</p>
                      <p className="text-[11px] text-slate-400">
                        {c.profile.address.city}, {c.profile.address.state} {c.profile.address.zipCode}
                      </p>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No address on file</span>
                  )}
                </td>

                <td className="py-3.5 px-4">
                  <StatusBadge status={c.status} size="sm" />
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleToggleStatus(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      c.status === 'active'
                        ? 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                        : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {c.status === 'active' ? 'Suspend Account' : 'Activate Account'}
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

