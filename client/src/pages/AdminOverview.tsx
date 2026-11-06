import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import {
  Users,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/activity'),
    ])
      .then(([statsRes, actRes]) => {
        setStats(statsRes.data.data);
        setActivity(actRes.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating real platform metrics..." />;
  }

  const statCards = [
    { label: 'Registered Customers', value: stats?.totalCustomers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/customers' },
    { label: 'Service Providers', value: stats?.totalProviders || 0, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/providers' },
    { label: 'Total Appointments', value: stats?.totalAppointments || 0, icon: Calendar, color: 'text-slate-900', bg: 'bg-slate-100', link: '/admin/appointments' },
    { label: 'Pending Bookings', value: stats?.pendingBookings || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/appointments?status=pending' },
    { label: 'Completed Jobs', value: stats?.completedAppointments || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/appointments?status=completed' },
    { label: 'Cancelled Visits', value: stats?.cancelledAppointments || 0, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', link: '/admin/appointments?status=cancelled' },
    { label: 'Active Disputes', value: stats?.activeDisputes || 0, icon: AlertTriangle, color: 'text-purple-600', bg: 'bg-purple-50', link: '/admin/disputes' },
    { label: 'Platform Volume', value: `$${stats?.totalRevenue || 0}`, icon: DollarSign, color: 'text-teal-600', bg: 'bg-teal-50', link: '/admin/reports' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Operations & Oversight</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
              Live Database
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time auditable database metrics across all customers, providers, and scope changes.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/categories"
            className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
          >
            Manage Categories
          </Link>
          <Link
            to="/admin/disputes"
            className="px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition shadow-sm"
          >
            Triage Disputes ({stats?.activeDisputes || 0})
          </Link>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              to={card.link}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-2xl font-black text-slate-900">{card.value}</p>
              <span className="text-xs font-medium text-slate-400 mt-1 block">{card.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Audit Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Appointment Bookings</h3>
            <Link to="/admin/appointments" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {activity?.recentAppointments?.slice(0, 5).map((appt: any) => (
              <div
                key={appt._id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{appt.bookingId}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-700">{appt.category?.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Customer: {appt.customer?.name} → Provider: {appt.provider?.name}
                  </p>
                </div>
                <StatusBadge status={appt.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Scope Changes & Disputes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Audit Stream: Scope Adjustments</h3>
            <Link to="/admin/disputes" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              Disputes ({stats?.activeDisputes || 0})
            </Link>
          </div>

          <div className="space-y-3">
            {activity?.recentScopeChanges?.slice(0, 5).map((sc: any) => (
              <div
                key={sc._id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{sc.changeId}</span>
                    <span className="font-bold text-amber-700">+${sc.additionalCost}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">
                    {sc.proposedScope}
                  </p>
                </div>
                <StatusBadge status={sc.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

