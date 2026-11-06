import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Appointment } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Search,
  Eye,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
} from 'lucide-react';

export const ProviderAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleUpdateStatus = async (apptId: string, newStatus: string) => {
    try {
      await api.patch(`/appointments/${apptId}/status`, {
        status: newStatus,
        note: `Status updated to ${newStatus} by provider`,
      });
      fetchAppointments();
      if (selectedAppt && selectedAppt._id === apptId) {
        setSelectedAppt(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = appointments.filter((appt) => {
    const matchesTab = activeTab === 'all' || appt.status === activeTab;
    const matchesSearch =
      !searchQuery ||
      appt.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner message="Loading your schedule..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Specialist Appointment Schedule</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your daily appointment routes, customer contact information, and job start triggers.
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['all', 'accepted', 'scheduled', 'in_progress', 'completed', 'cancelled'].map((tab) => (
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
            placeholder="Search by ID or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Cards List */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No appointments found</p>
          <p className="text-xs text-slate-400 mt-1">There are no appointments matching this tab filter.</p>
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
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
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
                    <span className="text-slate-800 font-medium">{appt.customer?.name}</span>
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
                    <span className="truncate">{appt.address?.street}, {appt.address?.city}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Initial Estimate</span>
                  <span className="text-sm font-extrabold text-slate-900">${appt.estimatedCost}</span>
                </div>

                <div className="flex items-center gap-2">
                  {appt.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(appt._id, 'in_progress')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
                    >
                      <PlayCircle className="w-3.5 h-3.5" /> Start Job
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedAppt(appt)}
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
      {selectedAppt && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAppt(null)}
          title={`Booking Schedule: ${selectedAppt.bookingId}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400">Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedAppt.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Estimate</span>
                <p className="text-lg font-extrabold text-slate-900">${selectedAppt.estimatedCost}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Customer Details</h4>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-700">
                <p><strong>Name:</strong> {selectedAppt.customer?.name}</p>
                <p><strong>Email:</strong> {selectedAppt.customer?.email}</p>
                <p><strong>Phone:</strong> {selectedAppt.customer?.phone || 'Not provided'}</p>
                <p><strong>Location:</strong> {selectedAppt.address?.street}, {selectedAppt.address?.city}, {selectedAppt.address?.state} {selectedAppt.address?.zipCode}</p>
                {selectedAppt.address?.landmark && (
                  <p><strong>Special Instructions:</strong> {selectedAppt.address.landmark}</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Customer Problem Description</h4>
              <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {selectedAppt.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {selectedAppt.status === 'accepted' ? (
                <button
                  onClick={() => handleUpdateStatus(selectedAppt._id, 'in_progress')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <PlayCircle className="w-4 h-4" /> Start On-Site Work
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedAppt(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
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

