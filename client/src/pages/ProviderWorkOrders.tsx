import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { WorkOrder } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import {
  FileText,
  Clock,
  Calendar,
  Camera,
  CheckCircle,
  FileDiff,
  AlertCircle,
  Plus,
  Trash2,
  DollarSign,
  User,
  ArrowRight,
} from 'lucide-react';

export const ProviderWorkOrders: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Scope Change Modal
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [scopeModalOpen, setScopeModalOpen] = useState(false);
  const [proposedScope, setProposedScope] = useState('');
  const [scopeReason, setScopeReason] = useState('');
  const [additionalCost, setAdditionalCost] = useState<number>(0);
  const [submittingScope, setSubmittingScope] = useState(false);

  // Completion Sign-Off Request Modal
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [providerNotes, setProviderNotes] = useState('');
  const [beforePhotoUrl, setBeforePhotoUrl] = useState('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('');
  const [submittingCompletion, setSubmittingCompletion] = useState(false);

  // Progress Note Modal
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressNote, setProgressNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchWorkOrders = async () => {
    try {
      const res = await api.get('/work-orders');
      if (res.data.success) {
        setWorkOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handleScopeChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWO) return;
    setSubmittingScope(true);

    try {
      const res = await api.post('/scope-changes', {
        workOrderId: selectedWO._id,
        proposedScope,
        reason: scopeReason,
        additionalCost: Number(additionalCost),
      });

      if (res.data.success) {
        setMessage({ text: 'Scope change request submitted to customer for approval.', type: 'success' });
        setTimeout(() => {
          setScopeModalOpen(false);
          setSelectedWO(null);
          setProposedScope('');
          setScopeReason('');
          setAdditionalCost(0);
          setMessage({ text: '', type: '' });
          fetchWorkOrders();
        }, 1500);
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to submit scope change.', type: 'error' });
    } finally {
      setSubmittingScope(false);
    }
  };

  const handleRequestCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWO) return;
    setSubmittingCompletion(true);

    try {
      const beforePhotos = beforePhotoUrl ? [beforePhotoUrl] : (selectedWO.beforePhotos || []);
      const afterPhotos = afterPhotoUrl ? [afterPhotoUrl] : (selectedWO.afterPhotos || []);

      const res = await api.post(`/completion/${selectedWO._id}/request`, {
        providerNotes,
        beforePhotos,
        afterPhotos,
      });

      if (res.data.success) {
        setMessage({
          text: 'Job marked complete and customer sign-off requested!',
          type: 'success',
        });
        setTimeout(() => {
          setCompletionModalOpen(false);
          setSelectedWO(null);
          setProviderNotes('');
          setBeforePhotoUrl('');
          setAfterPhotoUrl('');
          setMessage({ text: '', type: '' });
          fetchWorkOrders();
        }, 1500);
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to request completion.', type: 'error' });
    } finally {
      setSubmittingCompletion(false);
    }
  };

  const handleAddProgressNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWO || !progressNote.trim()) return;
    setSubmittingNote(true);

    try {
      const res = await api.patch(`/work-orders/${selectedWO._id}/status`, {
        note: progressNote,
      });

      if (res.data.success) {
        setProgressModalOpen(false);
        setSelectedWO(null);
        setProgressNote('');
        fetchWorkOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading work orders..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Work Orders & Job Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update real-time job status, attach photo proof, request scope modifications, and request customer sign-off.
        </p>
      </div>

      {workOrders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No work orders found</p>
          <p className="text-xs text-slate-400 mt-1">Accept booking requests from customers to generate work orders.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workOrders.map((wo) => {
            const isCompleted = wo.status === 'completed';
            return (
              <div
                key={wo._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-200 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-slate-900">{wo.workOrderId}</span>
                    <StatusBadge status={wo.status} size="sm" />
                    <span className="text-xs text-slate-400">Booking: {wo.bookingId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Total Agreed:</span>
                    <span className="text-lg font-black text-slate-900">${wo.finalCost}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Locked Original Scope
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">{wo.originalScope}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Customer & Schedule
                    </span>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">{wo.customer?.name}</span>
                      {wo.customer?.phone && (
                        <span className="text-slate-400 font-normal">({wo.customer.phone})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(wo.scheduledDate).toLocaleDateString()} • {wo.timeSlot}</span>
                    </div>
                    {wo.workHistory && wo.workHistory.length > 0 && (
                      <p className="text-[11px] text-slate-500 pt-1">
                        Latest: {wo.workHistory[wo.workHistory.length - 1].note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Photos if present */}
                {((wo.beforePhotos && wo.beforePhotos.length > 0) || (wo.afterPhotos && wo.afterPhotos.length > 0)) && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Attached Inspection Photos
                    </span>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {wo.beforePhotos?.map((url, i) => (
                        <div key={`b-${i}`} className="relative shrink-0">
                          <img src={url} alt="Before" className="w-24 h-20 rounded-xl object-cover border border-slate-200" />
                          <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] px-1 rounded">Before</span>
                        </div>
                      ))}
                      {wo.afterPhotos?.map((url, i) => (
                        <div key={`a-${i}`} className="relative shrink-0">
                          <img src={url} alt="After" className="w-24 h-20 rounded-xl object-cover border border-emerald-300" />
                          <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[9px] px-1 rounded font-bold">After</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedWO(wo);
                        setProgressModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                    >
                      + Add Progress Note
                    </button>

                    <button
                      onClick={() => {
                        setSelectedWO(wo);
                        setScopeModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                    >
                      <FileDiff className="w-3.5 h-3.5 text-blue-600" /> Submit Scope Change
                    </button>
                  </div>

                  {!isCompleted ? (
                    <button
                      onClick={() => {
                        setSelectedWO(wo);
                        setCompletionModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete Job & Request Sign-Off</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle className="w-4 h-4" /> Completion Sign-Off Requested
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Scope Change Modal */}
      {scopeModalOpen && selectedWO && (
        <Modal
          isOpen={true}
          onClose={() => setScopeModalOpen(false)}
          title={`Submit Scope Change: ${selectedWO.workOrderId}`}
          maxWidth="lg"
        >
          {message.text && message.type === 'success' ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-800">{message.text}</p>
            </div>
          ) : (
            <form onSubmit={handleScopeChange} className="space-y-4">
              {message.text && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {message.text}
                </div>
              )}

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Original Locked Scope (Preserved Forever)
                </span>
                <p className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  {selectedWO.originalScope}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proposed Additional Scope / Tasks <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={proposedScope}
                  onChange={(e) => setProposedScope(e.target.value)}
                  placeholder="e.g. Replace corroded secondary drain pan and install float safety switch..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Technical Reason / Discovery on Site <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={scopeReason}
                  onChange={(e) => setScopeReason(e.target.value)}
                  placeholder="e.g. Discovered rusted secondary pan with small pinhole leak while inspecting evaporator..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Estimated Cost ($)
                </label>
                <input
                  type="number"
                  min={0}
                  value={additionalCost}
                  onChange={(e) => setAdditionalCost(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScopeModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingScope}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
                >
                  {submittingScope ? 'Submitting...' : 'Send Request to Customer'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Complete Job & Request Sign-Off Modal */}
      {completionModalOpen && selectedWO && (
        <Modal
          isOpen={true}
          onClose={() => setCompletionModalOpen(false)}
          title={`Mark Job Complete: ${selectedWO.workOrderId}`}
          maxWidth="lg"
        >
          {message.text && message.type === 'success' ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-800">{message.text}</p>
            </div>
          ) : (
            <form onSubmit={handleRequestCompletion} className="space-y-4">
              {message.text && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {message.text}
                </div>
              )}

              <p className="text-xs text-slate-600">
                Provide notes on the completed work and upload proof photographs. The customer will be prompted to review and sign off.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Provider Completion Summary & Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={providerNotes}
                  onChange={(e) => setProviderNotes(e.target.value)}
                  placeholder="e.g. Installed new outlet, verified 242V across poles, tested ground fault safety mechanism, and cleaned area."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Before Photo (Image URL)
                  </label>
                  <input
                    type="url"
                    value={beforePhotoUrl}
                    onChange={(e) => setBeforePhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Pre-repair photo demonstrating condition.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    After Photo (Image URL)
                  </label>
                  <input
                    type="url"
                    value={afterPhotoUrl}
                    onChange={(e) => setAfterPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Completed work photo for customer sign-off.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCompletionModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCompletion}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
                >
                  {submittingCompletion ? 'Submitting...' : 'Submit Completion & Request Sign-Off'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Progress Note Modal */}
      {progressModalOpen && selectedWO && (
        <Modal
          isOpen={true}
          onClose={() => setProgressModalOpen(false)}
          title={`Add Work Progress Log: ${selectedWO.workOrderId}`}
          maxWidth="sm"
        >
          <form onSubmit={handleAddProgressNote} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Progress Note
              </label>
              <textarea
                rows={3}
                required
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                placeholder="e.g. Arrived on site, began diagnostic teardown..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProgressModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingNote}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
              >
                {submittingNote ? 'Saving...' : 'Add Log'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

