import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Dispute, Appointment, WorkOrder } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  PlusCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export const CustomerDisputes: React.FC = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // New Dispute Modal
  const [newDisputeModal, setNewDisputeModal] = useState(false);
  const [selectedWOId, setSelectedWOId] = useState('');
  const [reason, setReason] = useState<string>('incomplete_work');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [desiredResolution, setDesiredResolution] = useState('');
  const [submittingNew, setSubmittingNew] = useState(false);

  // Selected Dispute Thread
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [error, setError] = useState('');

  const fetchDisputes = async () => {
    try {
      const [dispRes, apptRes, woRes] = await Promise.all([
        api.get('/disputes'),
        api.get('/appointments'),
        api.get('/work-orders'),
      ]);
      if (dispRes.data.success) setDisputes(dispRes.data.data);
      if (apptRes.data.success) setAppointments(apptRes.data.data);
      if (woRes.data.success) setWorkOrders(woRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmittingNew(true);

    try {
      const res = await api.post('/disputes', {
        workOrderId: selectedWOId || undefined,
        reason,
        title,
        description,
        desiredResolution,
      });

      if (res.data.success) {
        setNewDisputeModal(false);
        setTitle('');
        setDescription('');
        setDesiredResolution('');
        fetchDisputes();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to file dispute.');
    } finally {
      setSubmittingNew(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !replyMessage.trim()) return;
    setSendingReply(true);

    try {
      const res = await api.post(`/disputes/${selectedDispute._id}/messages`, {
        message: replyMessage,
      });

      if (res.data.success) {
        setSelectedDispute(res.data.data);
        setReplyMessage('');
        fetchDisputes();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading disputes..." />;
  }

  const disputeReasons = [
    { value: 'incomplete_work', label: 'Incomplete Work' },
    { value: 'incorrect_work', label: 'Incorrect Work / Poor Quality' },
    { value: 'unauthorized_charges', label: 'Unauthorized Additional Charges' },
    { value: 'missed_appointment', label: 'Missed Appointment' },
    { value: 'scope_disagreement', label: 'Scope Disagreement' },
    { value: 'other', label: 'Other Issue' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dispute Resolution Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Fair and transparent conflict resolution backed by locked agreement scopes and auditable records.
          </p>
        </div>

        <button
          onClick={() => setNewDisputeModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Raise New Dispute</span>
        </button>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No active or past disputes</p>
          <p className="text-xs text-slate-400 mt-1">
            All your appointments and work orders are progressing without conflicts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispute List */}
          <div className="lg:col-span-1 space-y-3">
            {disputes.map((d) => {
              const isSelected = selectedDispute?._id === d._id;
              return (
                <div
                  key={d._id}
                  onClick={() => setSelectedDispute(d)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{d.disputeId}</span>
                    <StatusBadge status={d.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{d.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{d.description}</p>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{d.messages?.length || 1} message(s)</span>
                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conversation Thread / Dispute Details */}
          <div className="lg:col-span-2">
            {selectedDispute ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[600px]">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{selectedDispute.disputeId}</span>
                      <StatusBadge status={selectedDispute.status} size="sm" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedDispute.title}</h3>
                    <p className="text-[11px] text-slate-400 capitalize">
                      Category: {selectedDispute.reason?.replace('_', ' ')} • Against: {selectedDispute.againstUser?.name}
                    </p>
                  </div>

                  {selectedDispute.desiredResolution && (
                    <div className="text-right text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">Desired Resolution:</span>
                      <span className="text-slate-800 font-medium">{selectedDispute.desiredResolution}</span>
                    </div>
                  )}
                </div>

                {/* Admin Resolution Banner if resolved */}
                {selectedDispute.resolutionSummary && (
                  <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900">
                    <span className="font-bold">Admin Resolution:</span> {selectedDispute.resolutionSummary}
                  </div>
                )}

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {selectedDispute.messages?.map((msg, i) => {
                    const senderId = msg.sender?._id || msg.sender?.id;
                    const myId = user?.id || user?._id;
                    const isMe = senderId === myId;
                    const isAdmin = msg.senderRole === 'admin';
                    return (
                      <div
                        key={i}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-600">
                            {isMe ? 'You' : msg.sender?.name || msg.senderRole}
                          </span>
                          {isAdmin && (
                            <span className="bg-purple-100 text-purple-700 px-1.5 rounded font-bold">Admin Support</span>
                          )}
                          <span>•</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : isAdmin
                              ? 'bg-purple-50 text-purple-950 border border-purple-200 rounded-bl-none'
                              : 'bg-slate-100 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'rejected' ? (
                  <form onSubmit={handleSendReply} className="p-3 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type a response to provider and platform admin..."
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={sendingReply}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
                    This dispute has been closed and resolved.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400 h-[600px] flex items-center justify-center">
                Select a dispute from the left to view the messages and audit discussion.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raise New Dispute Modal */}
      {newDisputeModal && (
        <Modal
          isOpen={true}
          onClose={() => setNewDisputeModal(false)}
          title="Raise a Service Dispute"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateDispute} className="space-y-4">
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Associated Work Order / Appointment <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedWOId}
                onChange={(e) => setSelectedWOId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose work order --</option>
                {workOrders.map((wo) => (
                  <option key={wo._id} value={wo._id}>
                    {wo.workOrderId} - {wo.provider?.name} (${wo.finalCost})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dispute Reason <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {disputeReasons.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dispute Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unapproved extra fee added on-site"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Explanation <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the specific disagreement, what was promised in the original scope, and what happened on-site..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Desired Resolution
              </label>
              <input
                type="text"
                value={desiredResolution}
                onChange={(e) => setDesiredResolution(e.target.value)}
                placeholder="e.g. Adhere to original $190 estimate without extra charge"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNewDisputeModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingNew}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition"
              >
                {submittingNew ? 'Submitting...' : 'File Dispute'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
