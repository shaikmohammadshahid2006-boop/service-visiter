import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ScopeChange } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  FileDiff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const CustomerScopeChanges: React.FC = () => {
  const { user } = useAuth();
  const [scopeChanges, setScopeChanges] = useState<ScopeChange[]>([]);
  const [loading, setLoading] = useState(true);

  // Decision Modal
  const [selectedSC, setSelectedSC] = useState<ScopeChange | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchScopeChanges = async () => {
    try {
      const res = await api.get('/scope-changes');
      if (res.data.success) {
        setScopeChanges(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScopeChanges();
  }, []);

  const handleDecision = async () => {
    if (!selectedSC) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await api.patch(`/scope-changes/${selectedSC._id}/decision`, {
        decision,
        decisionNotes,
      });

      if (res.data.success) {
        setSuccess(`Scope change successfully ${decision}!`);
        setTimeout(() => {
          setSelectedSC(null);
          setSuccess('');
          setDecisionNotes('');
          fetchScopeChanges();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process decision.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading scope changes..." />;
  }

  const currentUserId = user?.id || user?._id;

  const pendingIncoming = scopeChanges.filter((sc) => {
    const reqId = sc.requestedBy?._id || sc.requestedBy?.id;
    return sc.status === 'pending' && reqId !== currentUserId;
  });

  const historical = scopeChanges.filter((sc) => {
    const reqId = sc.requestedBy?._id || sc.requestedBy?.id;
    return sc.status !== 'pending' || reqId === currentUserId;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Scope Change Tracking & Approvals</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete audit trail of all scope adjustments. Original descriptions are immutable and preserved.
        </p>
      </div>

      {/* PENDING APPROVAL SECTION */}
      {pendingIncoming.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-900">
              Awaiting Your Decision ({pendingIncoming.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingIncoming.map((sc) => (
              <div
                key={sc._id}
                className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-md shadow-amber-500/5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg">
                      {sc.changeId}
                    </span>
                    <span className="text-xs text-slate-500">
                      Work Order: {sc.workOrder?.workOrderId || sc.bookingId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Additional Cost Quote:</span>
                    <span className="text-base font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      +${sc.additionalCost}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Original Locked Agreement Scope
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {sc.originalScopeSnapshot}
                    </p>
                  </div>

                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                      Proposed Additional Work Scope
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {sc.proposedScope}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs text-amber-900">
                  <span className="font-bold">Provider Justification:</span> {sc.reason}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Requested by {sc.requestedBy?.name} on {new Date(sc.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedSC(sc);
                        setDecision('rejected');
                      }}
                      className="px-4 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Reject Change</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSC(sc);
                        setDecision('approved');
                      }}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve (+${sc.additionalCost})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HISTORICAL / OUTGOING SCOPE CHANGES */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Complete Scope Change History</h2>

        {historical.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No historical scope adjustments recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Change ID</th>
                  <th className="py-3 px-4">Requested By</th>
                  <th className="py-3 px-4">Proposed Modification</th>
                  <th className="py-3 px-4">Cost Added</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historical.map((sc) => (
                  <tr key={sc._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {sc.changeId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {sc.requestedBy?.name} ({sc.requestedByRole})
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={sc.proposedScope}>
                      {sc.proposedScope}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      +${sc.additionalCost}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={sc.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(sc.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {selectedSC && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSC(null)}
          title={`Confirm Decision for Scope Change: ${selectedSC.changeId}`}
          maxWidth="md"
        >
          {success ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-800">{success}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Decision Mode:</span>
                  <span className={`font-bold uppercase ${decision === 'approved' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {decision}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Additional Cost:</span>
                  <span className="font-extrabold text-slate-900">+${selectedSC.additionalCost}</span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  {decision === 'approved'
                    ? 'Approving will formally add this amount to your work order agreement.'
                    : 'Rejecting ensures your original scope and billing remain unchanged.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional Decision Notes for Provider
                </label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="e.g. Approved, proceed with the replacement capacitor as advised..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedSC(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDecision}
                  disabled={submitting}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition ${
                    decision === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submitting ? 'Processing...' : `Confirm ${decision.toUpperCase()}`}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
