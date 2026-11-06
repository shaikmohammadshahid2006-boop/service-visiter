import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Appointment } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import {
  CalendarPlus,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  User,
  AlertCircle,
  FileText,
  DollarSign,
} from 'lucide-react';

export const ProviderBookingRequests: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Accept Modal
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [acceptNote, setAcceptNote] = useState('');
  const [accepting, setAccepting] = useState(false);

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchBookings = async () => {
    try {
      const res = await api.get('/appointments?status=pending');
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
    fetchBookings();
  }, []);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setAccepting(true);

    try {
      const res = await api.patch(`/appointments/${selectedAppt._id}/status`, {
        status: 'accepted',
        note: acceptNote || 'Appointment accepted by service provider.',
      });

      if (res.data.success) {
        setMessage({
          text: `Booking ${selectedAppt.bookingId} accepted! Work Order automatically generated.`,
          type: 'success',
        });
        setTimeout(() => {
          setAcceptModalOpen(false);
          setSelectedAppt(null);
          setAcceptNote('');
          setMessage({ text: '', type: '' });
          fetchBookings();
        }, 1500);
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to accept booking.', type: 'error' });
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setRejecting(true);

    try {
      const res = await api.patch(`/appointments/${selectedAppt._id}/status`, {
        status: 'rejected',
        rejectionReason: rejectionReason || 'Unavailable for requested time slot.',
      });

      if (res.data.success) {
        setMessage({
          text: `Booking ${selectedAppt.bookingId} rejected and customer notified.`,
          type: 'success',
        });
        setTimeout(() => {
          setRejectModalOpen(false);
          setSelectedAppt(null);
          setRejectionReason('');
          setMessage({ text: '', type: '' });
          fetchBookings();
        }, 1500);
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to reject booking.', type: 'error' });
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading incoming booking requests..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Incoming Booking Requests</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer repair requests. Accepting a booking automatically initializes a binding Work Order.
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <CalendarPlus className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No pending booking requests</p>
          <p className="text-xs text-slate-400 mt-1">New customer appointment requests will appear here in real time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-white rounded-2xl border-2 border-blue-200 p-6 shadow-xs hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg">
                    {appt.bookingId}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{appt.category?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Estimated Initial Billing:</span>
                  <span className="text-lg font-black text-slate-900">${appt.estimatedCost}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Requested Work Scope Description
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {appt.description}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Customer & Appointment Details
                  </span>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{appt.customer?.name}</span>
                    {appt.customer?.phone && (
                      <span className="text-slate-400 font-normal">({appt.customer.phone})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(appt.appointmentDate).toLocaleDateString()} • {appt.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{appt.address?.street}, {appt.address?.city}, {appt.address?.state} {appt.address?.zipCode}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedAppt(appt);
                    setRejectModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Reject Booking</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedAppt(appt);
                    setAcceptModalOpen(true);
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Booking & Generate Work Order</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept Modal */}
      {acceptModalOpen && selectedAppt && (
        <Modal
          isOpen={true}
          onClose={() => setAcceptModalOpen(false)}
          title={`Accept Appointment: ${selectedAppt.bookingId}`}
          maxWidth="md"
        >
          {message.text && message.type === 'success' ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-800">{message.text}</p>
            </div>
          ) : (
            <form onSubmit={handleAccept} className="space-y-4">
              {message.text && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {message.text}
                </div>
              )}

              <p className="text-xs text-slate-600">
                By accepting this appointment, you agree to arrive during the requested slot and lock the initial description into a binding Work Order.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional Note for Customer
                </label>
                <textarea
                  rows={3}
                  value={acceptNote}
                  onChange={(e) => setAcceptNote(e.target.value)}
                  placeholder="e.g. Appointment confirmed! I will have replacement parts and tools ready. See you Thursday morning."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAcceptModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={accepting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
                >
                  {accepting ? 'Generating Work Order...' : 'Confirm Acceptance'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedAppt && (
        <Modal
          isOpen={true}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Appointment: ${selectedAppt.bookingId}`}
          maxWidth="md"
        >
          {message.text && message.type === 'success' ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-800">{message.text}</p>
            </div>
          ) : (
            <form onSubmit={handleReject} className="space-y-4">
              {message.text && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {message.text}
                </div>
              )}

              <p className="text-xs text-slate-600">
                Please provide a courtesy reason for rejecting this booking so the customer can reschedule.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Schedule already committed during this window; outside service radius..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejecting}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition"
                >
                  {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

