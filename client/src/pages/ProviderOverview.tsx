import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Appointment, WorkOrder, ScopeChange } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  CalendarPlus,
  FileText,
  FileDiff,
  CheckCircle,
  Star,
  DollarSign,
  ArrowRight,
  Clock,
  MapPin,
  AlertCircle,
} from 'lucide-react';

export const ProviderOverview: React.FC = () => {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [scopeChanges, setScopeChanges] = useState<ScopeChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments'),
      api.get('/work-orders'),
      api.get('/scope-changes'),
    ])
      .then(([apptsRes, woRes, scRes]) => {
        setAppointments(apptsRes.data.data);
        setWorkOrders(woRes.data.data);
        setScopeChanges(scRes.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading specialist dashboard..." />;
  }

  const incomingBookings = appointments.filter((a) => a.status === 'pending');
  const activeWorkOrders = workOrders.filter((wo) => wo.status === 'created' || wo.status === 'in_progress');
  const pendingScopeChanges = scopeChanges.filter((sc) => sc.status === 'pending');
  const completedJobs = workOrders.filter((wo) => wo.status === 'completed');

  const totalEarnings = completedJobs.reduce((sum, wo) => sum + (wo.finalCost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Specialist Dashboard: {profile?.businessName || user?.name}
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Manage incoming household booking requests, update real-time job progress, and submit transparent change orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>{profile?.ratingAverage?.toFixed(1) || '5.0'}</span>
            <span className="text-amber-600 font-normal">({profile?.reviewCount || 0} reviews)</span>
          </div>

          <Link
            to="/provider/booking-requests"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm"
          >
            Review Bookings ({incomingBookings.length})
          </Link>
        </div>
      </div>

      {/* Action Banners */}
      {incomingBookings.length > 0 && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-900">
                You have {incomingBookings.length} incoming booking request{incomingBookings.length > 1 ? 's' : ''}
              </h4>
              <p className="text-[11px] text-blue-700">
                Accepting a booking will automatically generate a locked Work Order with the customer.
              </p>
            </div>
          </div>
          <Link
            to="/provider/booking-requests"
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shrink-0"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">New Bookings</span>
          <p className="mt-1 text-2xl font-extrabold text-blue-600">{incomingBookings.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Jobs</span>
          <p className="mt-1 text-2xl font-extrabold text-indigo-600">{activeWorkOrders.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Pending Scope Changes</span>
          <p className="mt-1 text-2xl font-extrabold text-amber-600">{pendingScopeChanges.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Completed Earnings</span>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">${totalEarnings}</p>
        </div>
      </div>

      {/* Active Work Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Current Active Jobs</h3>
          <Link
            to="/provider/work-orders"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Manage All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeWorkOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No active jobs at the moment. Accept incoming bookings to start work.
          </div>
        ) : (
          <div className="space-y-3">
            {activeWorkOrders.map((wo) => (
              <div
                key={wo._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{wo.workOrderId}</span>
                    <StatusBadge status={wo.status} size="sm" />
                  </div>
                  <p className="text-xs font-medium text-slate-800 mt-1 line-clamp-1">
                    {wo.originalScope}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Customer: {wo.customer?.name} • Scheduled: {new Date(wo.scheduledDate).toLocaleDateString()} ({wo.timeSlot})
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Agreed Cost</span>
                    <span className="text-sm font-bold text-slate-900">${wo.finalCost}</span>
                  </div>
                  <Link
                    to="/provider/work-orders"
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Update Status
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

