import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CompletionApproval } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import {
  CheckCircle,
  AlertTriangle,
  Camera,
  Star,
  FileCheck2,
  Clock,
  User,
  DollarSign,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const CustomerCompletionApprovals: React.FC = () => {
  const [approvals, setApprovals] = useState<CompletionApproval[]>([]);
  const [loading, setLoading] = useState(true);

  // Sign-Off Modal
  const [signOffModalOpen, setSignOffModalOpen] = useState(false);
  const [activeApproval, setActiveApproval] = useState<CompletionApproval | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [customerFeedback, setCustomerFeedback] = useState('');
  const [submittingSignOff, setSubmittingSignOff] = useState(false);

  // Issue Modal
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [reportedIssueDetails, setReportedIssueDetails] = useState('');
  const [submittingIssue, setSubmittingIssue] = useState(false);

  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchApprovals = async () => {
    try {
      const res = await api.get('/completion');
      if (res.data.success) {
        setApprovals(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApproveSignOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApproval) return;
    setSubmittingSignOff(true);

    try {
      const workOrderId = activeApproval.workOrder?._id || activeApproval.workOrder;
      const res = await api.post(`/completion/${workOrderId}/approve`, {
        customerFeedback,
        rating,
      });

      if (res.data.success) {
        setMessage({ text: 'Work order completion signed off successfully! Thank you!', type: 'success' });
        setTimeout(() => {
          setSignOffModalOpen(false);
          setActiveApproval(null);
          setCustomerFeedback('');
          setMessage({ text: '', type: '' });
          fetchApprovals();
        }, 1500);
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Sign-off failed.', type: 'error' });
    } finally {
      setSubmittingSignOff(false);
    }
  };

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApproval) return;
    setSubmittingIssue(true);

    try {
      const workOrderId = activeApproval.workOrder?._id || activeApproval.workOrder;
      const res = await api.post(`/completion/${workOrderId}/report-issue`, {
        reportedIssueDetails,
      });

      if (res.data.success) {
        setMessage({ text: 'Issue reported to provider and logged in audit history.', type: 'success' });
        setTimeout(() => {
          setIssueModalOpen(false);
          setActiveApproval(null);
          setReportedIssueDetails('');
          setMessage({ text: '', type: '' });
          fetchApprovals();
        }, 1500);
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to report issue.', type: 'error' });
    } finally {
      setSubmittingIssue(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading completion records..." />;
  }

  const pendingApprovals = approvals.filter((a) => a.finalCompletionStatus === 'pending');
  const finalizedRecords = approvals.filter((a) => a.finalCompletionStatus !== 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Sign-Off & Verification Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          Work is only finalized when you confirm satisfaction. Review contractor photos and approve or flag issues.
        </p>
      </div>

      {/* PENDING SIGN-OFFS */}
      {pendingApprovals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-900">
              Pending Your Inspection & Sign-Off ({pendingApprovals.length})
            </h2>
          </div>

          <div className="space-y-4">
            {pendingApprovals.map((record) => (
              <div
                key={record._id}
                className="bg-white rounded-2xl border-2 border-blue-400 p-6 shadow-md shadow-blue-500/5 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg">
                      {record.completionRecordId}
                    </span>
                    <span className="text-xs text-slate-500">
                      Work Order: {record.workOrder?.workOrderId || record.bookingId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Final Total:</span>
                    <span className="text-xl font-black text-slate-900">${record.totalFinalCost}</span>
                  </div>
                </div>

                {/* Scope Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Original Agreed Scope
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">{record.originalScope}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Approved Scope Additions
                    </span>
                    {record.approvedScopeChanges && record.approvedScopeChanges.length > 0 ? (
                      <div className="space-y-1.5">
                        {record.approvedScopeChanges.map((sc, i) => (
                          <div key={i} className="text-xs text-slate-800 flex justify-between">
                            <span className="truncate pr-2">• {sc.proposedScope}</span>
                            <span className="font-bold text-emerald-700">+${sc.additionalCost}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No scope changes were requested.</p>
                    )}
                  </div>
                </div>

                {/* Provider Completion Notes */}
                {record.providerNotes && (
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-900">
                    <span className="font-bold">Contractor Completion Report:</span> {record.providerNotes}
                  </div>
                )}

                {/* Photographic Evidence */}
                {((record.providerPhotos?.before && record.providerPhotos.before.length > 0) ||
                  (record.providerPhotos?.after && record.providerPhotos.after.length > 0)) && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-600" /> Photographic Inspection Evidence
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {record.providerPhotos?.before?.map((url, i) => (
                        <div key={`before-${i}`} className="relative rounded-xl overflow-hidden border border-slate-200">
                          <img src={url} alt="Before" className="w-full h-28 object-cover" />
                          <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                            Before Work
                          </span>
                        </div>
                      ))}
                      {record.providerPhotos?.after?.map((url, i) => (
                        <div key={`after-${i}`} className="relative rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm">
                          <img src={url} alt="After" className="w-full h-28 object-cover" />
                          <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            Verified After
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Completed {new Date(record.providerCompletionTimestamp).toLocaleString()} by {record.provider?.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setActiveApproval(record);
                        setIssueModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Report an Issue</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveApproval(record);
                        setSignOffModalOpen(true);
                      }}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Sign-Off & Rate</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FINALIZED COMPLETION RECORDS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Historical Completion Sign-Offs</h2>

        {finalizedRecords.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No finalized completion records yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sign-Off Date</th>
                  <th className="py-3 px-4">Feedback & Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {finalizedRecords.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {rec.completionRecordId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {rec.provider?.name}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ${rec.totalFinalCost}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={rec.finalCompletionStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {rec.customerApprovalTimestamp
                        ? new Date(rec.customerApprovalTimestamp).toLocaleDateString()
                        : rec.reportedIssueTimestamp
                        ? new Date(rec.reportedIssueTimestamp).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {rec.rating ? (
                        <span className="flex items-center gap-1 font-semibold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" /> {rec.rating}/5
                          <span className="text-slate-500 font-normal ml-1 truncate">"{rec.customerFeedback}"</span>
                        </span>
                      ) : rec.reportedIssueDetails ? (
                        <span className="text-rose-600 truncate" title={rec.reportedIssueDetails}>
                          Issue: {rec.reportedIssueDetails}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve Sign-Off Modal */}
      {signOffModalOpen && activeApproval && (
        <Modal
          isOpen={true}
          onClose={() => setSignOffModalOpen(false)}
          title={`Confirm Sign-Off: ${activeApproval.completionRecordId}`}
          maxWidth="md"
        >
          {message.text && message.type === 'success' ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-800">{message.text}</p>
            </div>
          ) : (
            <form onSubmit={handleApproveSignOff} className="space-y-4">
              {message.text && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {message.text}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Digital Sign-Off Confirmation</p>
                <p className="text-emerald-700">
                  By confirming, you certify that the work outlined in {activeApproval.workOrder?.workOrderId || activeApproval.bookingId} has been satisfactorily executed for the final total of ${activeApproval.totalFinalCost}.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rate Specialist Service
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">{rating} out of 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Review & Feedback
                </label>
                <textarea
                  rows={3}
                  value={customerFeedback}
                  onChange={(e) => setCustomerFeedback(e.target.value)}
                  placeholder="e.g. Excellent work, on time, kept work area spotless and explained the completed installation clearly."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSignOffModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSignOff}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
                >
                  {submittingSignOff ? 'Signing off...' : 'Confirm Sign-Off & Submit Review'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Report Issue Modal */}
      {issueModalOpen && activeApproval && (
        <Modal
          isOpen={true}
          onClose={() => setIssueModalOpen(false)}
          title={`Report Issue: ${activeApproval.workOrder?.workOrderId || activeApproval.bookingId}`}
          maxWidth="md"
        >
          {message.text && message.type === 'success' ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-800">{message.text}</p>
            </div>
          ) : (
            <form onSubmit={handleReportIssue} className="space-y-4">
              {message.text && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {message.text}
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                If the work is incomplete or does not meet agreed specifications, specify the exact issue below. The work order will be returned to active status for provider correction.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Describe What is Incomplete or Incorrect <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={reportedIssueDetails}
                  onChange={(e) => setReportedIssueDetails(e.target.value)}
                  placeholder="e.g. The leak underneath the vanity continues to drip when water pressure is restored. Faucet handles were not aligned correctly."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingIssue}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition"
                >
                  {submittingIssue ? 'Submitting...' : 'Submit Issue to Provider'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

