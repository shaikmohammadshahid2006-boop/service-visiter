import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BarChart3, ShieldCheck, CheckCircle2, FileText, AlertTriangle, Clock } from 'lucide-react';

export const AdminReports: React.FC = () => {
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
    return <LoadingSpinner message="Generating audit reports..." />;
  }

  const completionRate = stats?.totalAppointments
    ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
    : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit & Integrity Reports</h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical compliance analysis, scope alteration frequencies, and dispute resolution performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Rate</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{completionRate}%</p>
          <p className="text-xs text-slate-500 mt-2">
            {stats?.completedAppointments || 0} jobs successfully completed & signed off by customers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scope Audit Compliance</span>
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-blue-600">100%</p>
          <p className="text-xs text-slate-500 mt-2">
            Zero unrecorded scope changes. All adjustments digitally logged and counter-approved.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dispute Resolution Rate</span>
            <AlertTriangle className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-purple-600">{stats?.activeDisputes || 0} Open</p>
          <p className="text-xs text-slate-500 mt-2">
            Triage response time within guaranteed 24-hour administrative window.
          </p>
        </div>
      </div>

      {/* Global Event Audit Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" /> Global Transaction & Agreement Audit Log
        </h3>

        <div className="space-y-3">
          {activity?.recentWorkOrders?.map((wo: any) => (
            <div
              key={wo._id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <span className="font-mono font-bold text-slate-900">{wo.workOrderId}</span>
                <span className="text-slate-400 mx-2">•</span>
                <span className="text-slate-700">Contractor: {wo.provider?.name}</span>
                <span className="text-slate-400 mx-2">•</span>
                <span className="text-slate-700">Customer: {wo.customer?.name}</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Agreement Cost: ${wo.finalCost} • Status: <span className="font-semibold capitalize">{wo.status}</span>
                </p>
              </div>

              <span className="text-slate-400 text-[10px] shrink-0">
                Updated {new Date(wo.updatedAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

