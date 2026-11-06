import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Dispute } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Search,
  User,
  Clock,
  FileText,
} from 'lucide-react';

export const AdminDisputes: React.FC = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  // Message reply
  const [adminMessage, setAdminMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Resolve Modal
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveStatus, setResolveStatus] = useState<'resolved' | 'rejected'>('resolved');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submittingResolve, setSubmittingResolve] = useState(false);

  const fetchDisputes = async () => {
    try {
      const res = await api.get('/disputes');
      if (res.data.success) {
        setDisputes(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !adminMessage.trim()) return;
    setSendingMessage(true);

    try {
      const res = await api.post(`/disputes/${selectedDispute._id}/messages`, {
        message: adminMessage,
      });

      if (res.data.success) {
        setSelectedDispute(res.data.data);
        setAdminMessage('');
        fetchDisputes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    setSubmittingResolve(true);

    try {
      const res = await api.patch(`/disputes/${selectedDispute._id}`, {
        status: resolveStatus,
        resolutionSummary,
        adminNotes,
      });

      if (res.data.success) {
        setResolveModalOpen(false);
        setResolutionSummary('');
        setAdminNotes('');
        setSelectedDispute(res.data.data);
        fetchDisputes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingResolve(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading disputes for triage..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dispute Triage & Mediation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer complaints, inspect agreement scope integrity, and issue binding resolutions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="lg:col-span-1 space-y-3">
          {disputes.map((d) => {
            const isSelected = selectedDispute?._id === d._id;
            return (
              <div
                key={d._id}
                onClick={() => setSelectedDispute(d)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-900">{d.disputeId}</span>
                  <StatusBadge status={d.status} size="sm" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">{d.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  Raised by: {d.raisedBy?.name} vs {d.againstUser?.name}
                </p>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="capitalize">{d.reason?.replace('_', ' ')}</span>
                  <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Details & Messages */}
        <div className="lg:col-span-2">
          {selectedDispute ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px]">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{selectedDispute.disputeId}</span>
                    <StatusBadge status={selectedDispute.status} size="sm" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedDispute.title}</h3>
                  <p className="text-[11px] text-slate-500">
                    Claimant: <strong>{selectedDispute.raisedBy?.name}</strong> • Opposing: <strong>{selectedDispute.againstUser?.name}</strong>
                  </p>
                </div>

                {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'rejected' && (
                  <button
                    onClick={() => setResolveModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition shadow-sm"
                  >
                    Issue Resolution
                  </button>
                )}
              </div>

              {/* Resolution Summary Banner if present */}
              {selectedDispute.resolutionSummary && (
                <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900">
                  <p className="font-bold">Official Admin Resolution:</p>
                  <p className="mt-0.5">{selectedDispute.resolutionSummary}</p>
                  {selectedDispute.adminNotes && (
                    <p className="text-[11px] text-emerald-700 mt-1">Admin Internal Notes: {selectedDispute.adminNotes}</p>
                  )}
                </div>
              )}

              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {selectedDispute.messages?.map((msg, i) => {
                  const isAdmin = msg.senderRole === 'admin';
                  const senderId = msg.sender?._id || msg.sender?.id;
                  const claimantId = selectedDispute.raisedBy?._id || selectedDispute.raisedBy?.id;
                  const isClaimant = senderId === claimantId;
                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${isAdmin ? 'items-center' : isClaimant ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-700">
                          {msg.sender?.name || msg.senderRole}
                        </span>
                        <span className="capitalize">({msg.senderRole})</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-purple-100 text-purple-950 border border-purple-300 font-medium'
                            : isClaimant
                            ? 'bg-blue-50 text-blue-950 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Admin Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="Post administrative inquiry or instruction..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400 h-[650px] flex items-center justify-center">
              Select a dispute to review claims and mediate communication.
            </div>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {resolveModalOpen && selectedDispute && (
        <Modal
          isOpen={true}
          onClose={() => setResolveModalOpen(false)}
          title={`Resolve Dispute: ${selectedDispute.disputeId}`}
          maxWidth="md"
        >
          <form onSubmit={handleResolve} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resolution Decision <span className="text-rose-500">*</span>
              </label>
              <select
                value={resolveStatus}
                onChange={(e) => setResolveStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="resolved">Resolved (Scope Upheld or Remedy Enforced)</option>
                <option value="rejected">Rejected (Claim Invalid under Agreement Scope)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resolution Summary for Parties <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
                placeholder="e.g. Work Order original estimate of $190 covers snaking. Trap replacement requires separate scope approval before billing..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Internal Administrative Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal audit notes regarding platform policy compliance..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResolveModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingResolve}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
              >
                {submittingResolve ? 'Applying...' : 'Enforce Resolution'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
