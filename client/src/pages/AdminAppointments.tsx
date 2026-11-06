import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Appointment } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { Search, Calendar, User, Eye, Trash2, Clock, MapPin } from 'lucide-react';

export const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment as administrator?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchAppointments();
      if (selectedAppt?._id === id) setSelectedAppt(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = appointments.filter((a) => {
    const matchesStatus = activeStatus === 'all' || a.status === activeStatus;
    const matchesSearch =
      !search ||
      a.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.provider?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner message="Loading global appointments..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System-Wide Appointment Oversight</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete database of all bookings, locked work scopes, and status audit histories.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, customer, provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveStatus(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
              activeStatus === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Booking ID</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Provider</th>
              <th className="py-3 px-4">Date & Slot</th>
              <th className="py-3 px-4">Estimate</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((appt) => (
              <tr key={appt._id} className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                  {appt.bookingId}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-800">
                  {appt.category?.name}
                </td>
                <td className="py-3.5 px-4 text-slate-700">
                  {appt.customer?.name}
                </td>
                <td className="py-3.5 px-4 text-slate-700">
                  {appt.provider?.name}
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  {new Date(appt.appointmentDate).toLocaleDateString()}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  ${appt.estimatedCost}
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={appt.status} size="sm" />
                </td>
                <td className="py-3.5 px-4 text-right space-x-1">
                  <button
                    onClick={() => setSelectedAppt(appt)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(appt._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAppt(null)}
          title={`Admin Audit: ${selectedAppt.bookingId}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <StatusBadge status={selectedAppt.status} />
              <span className="text-base font-extrabold text-slate-900">${selectedAppt.estimatedCost}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold">Customer</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedAppt.customer?.name}</p>
                <p className="text-slate-500">{selectedAppt.customer?.email}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold">Assigned Specialist</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedAppt.provider?.name}</p>
                <p className="text-slate-500">{selectedAppt.provider?.email}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Locked Work Scope</h4>
              <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                {selectedAppt.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Status Transitions Log</h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedAppt.statusHistory?.map((h, i) => (
                  <div key={i} className="text-[11px] p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between">
                    <span>
                      <strong className="capitalize">{h.status.replace('_', ' ')}</strong>: {h.note || 'State transitioned'}
                    </span>
                    <span className="text-slate-400 text-[10px] shrink-0">
                      {new Date(h.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAppt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

