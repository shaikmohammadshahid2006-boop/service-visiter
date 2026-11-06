import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Appointment } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  PlusCircle,
  Eye,
  XCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  Phone,
  User,
} from 'lucide-react';

export const CustomerAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

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

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    setCancelling(true);
    try {
      await api.patch(`/appointments/${selectedAppointment._id}/status`, {
        status: 'cancelled',
        cancellationReason,
      });
      setCancelModalOpen(false);
      setSelectedAppointment(null);
      setCancellationReason('');
      fetchAppointments();
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  const filtered = appointments.filter((appt) => {
    const matchesTab = activeTab === 'all' || appt.status === activeTab;
    const matchesSearch =
      !searchQuery ||
      appt.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.provider?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner message="Loading your appointments..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time appointment status, inspection timings, and work orders.
          </p>
        </div>

        <Link
          to="/customer/book"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Appointments List */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No appointments found</p>
          <p className="text-xs text-slate-400 mt-1">There are no appointments matching your filter selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((appt) => (
            <div
              key={appt._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-200 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {appt.bookingId}
                  </span>
                  <StatusBadge status={appt.status} size="sm" />
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  {appt.category?.name || 'Home Service'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {appt.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-800 font-medium">{appt.provider?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(appt.appointmentDate).toLocaleDateString()} • {appt.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{appt.address?.street}, {appt.address?.city}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Estimated Cost</span>
                  <span className="text-sm font-extrabold text-slate-900">${appt.estimatedCost}</span>
                </div>

                <div className="flex items-center gap-2">
                  {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                    <button
                      onClick={() => {
                        setSelectedAppointment(appt);
                        setCancelModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedAppointment(appt)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && !cancelModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAppointment(null)}
          title={`Booking Details: ${selectedAppointment.bookingId}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400">Current Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedAppointment.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Agreed Initial Estimate</span>
                <p className="text-lg font-extrabold text-slate-900">${selectedAppointment.estimatedCost}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Assigned Specialist</h4>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <img
                  src={selectedAppointment.provider?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAppointment.provider?.name}`}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">{selectedAppointment.provider?.name}</p>
                  <p className="text-[11px] text-slate-500">{selectedAppointment.provider?.email}</p>
                  {selectedAppointment.provider?.phone && (
                    <p className="text-[11px] text-slate-500">{selectedAppointment.provider?.phone}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Locked Initial Work Scope</h4>
              <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {selectedAppointment.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Appointment Schedule & Location</h4>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p><strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                <p><strong>Window:</strong> {selectedAppointment.timeSlot}</p>
                <p><strong>Address:</strong> {selectedAppointment.address?.street}, {selectedAppointment.address?.city}, {selectedAppointment.address?.state} {selectedAppointment.address?.zipCode}</p>
                {selectedAppointment.address?.landmark && (
                  <p><strong>Landmark:</strong> {selectedAppointment.address.landmark}</p>
                )}
              </div>
            </div>

            {/* Audit Trail of Status Changes */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Status Audit History</h4>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {selectedAppointment.statusHistory?.map((h, i) => (
                  <div key={i} className="text-[11px] p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 capitalize">{h.status.replace('_', ' ')}</span>
                      {h.note && <p className="text-slate-500 mt-0.5">{h.note}</p>}
                    </div>
                    <span className="text-slate-400 shrink-0 text-[10px]">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && selectedAppointment && (
        <Modal
          isOpen={true}
          onClose={() => setCancelModalOpen(false)}
          title={`Cancel Appointment: ${selectedAppointment.bookingId}`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel this appointment? The provider will be notified immediately.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Cancellation
              </label>
              <textarea
                rows={3}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Schedule conflict or resolved the issue..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Never mind
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={cancelling}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

