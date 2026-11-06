import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Appointment, WorkOrder, ScopeChange, CompletionApproval } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  FileDiff,
  FileText,
  ArrowRight,
  PlusCircle,
  MapPin,
  DollarSign,
} from 'lucide-react';

export const CustomerOverview: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [pendingScopeChanges, setPendingScopeChanges] = useState<ScopeChange[]>([]);
  const [pendingCompletions, setPendingCompletions] = useState<CompletionApproval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments'),
      api.get('/work-orders'),
      api.get('/scope-changes?status=pending'),
      api.get('/completion?status=pending'),
    ])
      .then(([apptsRes, woRes, scRes, compRes]) => {
        setAppointments(apptsRes.data.data);
        setWorkOrders(woRes.data.data);
        setPendingScopeChanges(scRes.data.data);
        setPendingCompletions(compRes.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading customer dashboard..." />;
  }

  const upcomingAppointment = appointments.find(
    (a) => a.status === 'accepted' || a.status === 'scheduled' || a.status === 'in_progress'
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Track your home appointments, review work scopes, and sign off on verified completions.
          </p>
        </div>

        <Link
          to="/customer/book"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book New Service</span>
        </Link>
      </div>

      {/* Action Items / Alerts Banner */}
      {(pendingScopeChanges.length > 0 || pendingCompletions.length > 0) && (
        <div className="space-y-3">
          {pendingScopeChanges.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <FileDiff className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    {pendingScopeChanges.length} Scope Change Request{pendingScopeChanges.length > 1 ? 's' : ''} Awaiting Your Approval
                  </h4>
                  <p className="text-[11px] text-amber-700">
                    A service provider requested an adjustment to original scope with additional estimated cost.
                  </p>
                </div>
              </div>
              <Link
                to="/customer/scope-change-history"
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition shrink-0"
              >
                Review Now
              </Link>
            </div>
          )}

          {pendingCompletions.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-900">
                    Job Finished: Customer Sign-Off Required ({pendingCompletions.length})
                  </h4>
                  <p className="text-[11px] text-blue-700">
                    Provider marked work complete and uploaded proof. Review work photos and confirm satisfaction.
                  </p>
                </div>
              </div>
              <Link
                to="/customer/completion-approvals"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shrink-0"
              >
                Inspect & Sign Off
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Bookings</span>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{appointments.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Work Orders</span>
          <p className="mt-1 text-2xl font-extrabold text-blue-600">
            {workOrders.filter((wo) => wo.status === 'created' || wo.status === 'in_progress').length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Pending Approvals</span>
          <p className="mt-1 text-2xl font-extrabold text-amber-600">
            {pendingScopeChanges.length + pendingCompletions.length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Completed Jobs</span>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">
            {appointments.filter((a) => a.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Highlighted Upcoming Appointment */}
      {upcomingAppointment && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
              Next Upcoming Visit
            </span>
            <span className="text-xs font-mono text-blue-300">
              {upcomingAppointment.bookingId}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-white">
                {upcomingAppointment.category?.name || 'Home Service'}
              </h3>
              <p className="text-xs text-blue-200 mt-1 line-clamp-2">
                {upcomingAppointment.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-blue-200">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  {new Date(upcomingAppointment.appointmentDate).toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                  {upcomingAppointment.timeSlot}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  {upcomingAppointment.address?.street}, {upcomingAppointment.address?.city}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:items-end justify-center border-t md:border-t-0 md:border-l border-blue-800/80 pt-4 md:pt-0 md:pl-6">
              <span className="text-[11px] text-blue-300">Assigned Provider</span>
              <p className="text-sm font-bold text-white mt-0.5">
                {upcomingAppointment.provider?.name}
              </p>
              <Link
                to={`/customer/my-appointments`}
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-white text-blue-900 text-xs font-bold hover:bg-blue-50 transition"
              >
                View Booking Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Appointments & Work Orders Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Recent Appointments</h3>
          <Link
            to="/customer/my-appointments"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            You have no appointments booked yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Service Category</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Estimated Cost</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.slice(0, 5).map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {appt.bookingId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {appt.category?.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {appt.provider?.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(appt.appointmentDate).toLocaleDateString()} • {appt.timeSlot}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      ${appt.estimatedCost}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={appt.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

