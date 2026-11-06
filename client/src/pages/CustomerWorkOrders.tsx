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
  CheckCircle,
  FileDiff,
  Camera,
  Eye,
  AlertCircle,
  PlusCircle,
  DollarSign,
  User,
} from 'lucide-react';

export const CustomerWorkOrders: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);

  // Scope change modal from work order
  const [scopeModalOpen, setScopeModalOpen] = useState(false);
  const [proposedScope, setProposedScope] = useState('');
  const [scopeReason, setScopeReason] = useState('');
  const [additionalCost, setAdditionalCost] = useState<number>(0);
  const [submittingScope, setSubmittingScope] = useState(false);
  const [scopeSuccess, setScopeSuccess] = useState('');
  const [scopeError, setScopeError] = useState('');

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

  const handleRequestScopeChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWO) return;
    setSubmittingScope(true);
    setScopeError('');

    try {
      const res = await api.post('/scope-changes', {
        workOrderId: selectedWO._id,
        proposedScope,
        reason: scopeReason,
        additionalCost: Number(additionalCost),
      });

      if (res.data.success) {
        setScopeSuccess('Scope change request submitted to specialist!');
        setTimeout(() => {
          setScopeModalOpen(false);
          setScopeSuccess('');
          setProposedScope('');
          setScopeReason('');
          setAdditionalCost(0);
          fetchWorkOrders();
        }, 1500);
      }
    } catch (err: any) {
      setScopeError(err.response?.data?.message || 'Failed to submit scope change');
    } finally {
      setSubmittingScope(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading work orders..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active & Completed Work Orders</h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable contracts generated upon appointment acceptance. Track scope evolution and verified costs.
        </p>
      </div>

      {workOrders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No work orders generated yet</p>
          <p className="text-xs text-slate-400 mt-1">Work orders are created automatically when a specialist accepts your booking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workOrders.map((wo) => {
            const hasApprovedScopeChanges = wo.finalCost > wo.estimatedCost;
            return (
              <div
                key={wo._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-200 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900">{wo.workOrderId}</span>
                        <StatusBadge status={wo.status} size="sm" />
                      </div>
                      <span className="text-[11px] text-slate-400">Linked to Booking: {wo.bookingId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Total Agreement Cost</span>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-lg font-black text-slate-900">${wo.finalCost}</span>
                        {hasApprovedScopeChanges && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                            +${wo.finalCost - wo.estimatedCost} scope addition
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Original Locked Scope</h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {wo.originalScope}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contractor Details</h4>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">{wo.provider?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(wo.scheduledDate).toLocaleDateString()} • {wo.timeSlot}</span>
                    </div>
                    {wo.workHistory && wo.workHistory.length > 0 && (
                      <p className="text-[11px] text-slate-500 pt-1">
                        Latest update: {wo.workHistory[wo.workHistory.length - 1].note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Photos if any */}
                {((wo.beforePhotos && wo.beforePhotos.length > 0) || (wo.afterPhotos && wo.afterPhotos.length > 0)) && (
                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-600" /> Verified On-Site Photos
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {wo.beforePhotos?.map((url, i) => (
                        <div key={i} className="relative group shrink-0">
                          <img src={url} alt="Before" className="w-24 h-20 rounded-xl object-cover border border-slate-200" />
                          <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] px-1 rounded">Before</span>
                        </div>
                      ))}
                      {wo.afterPhotos?.map((url, i) => (
                        <div key={i} className="relative group shrink-0">
                          <img src={url} alt="After" className="w-24 h-20 rounded-xl object-cover border border-emerald-300 ring-2 ring-emerald-500/20" />
                          <span className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[9px] px-1 rounded font-bold">After</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedWO(wo);
                        setScopeModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                    >
                      <FileDiff className="w-3.5 h-3.5 text-blue-600" /> Request Scope Change
                    </button>
                    <Link
                      to="/customer/scope-change-history"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
                    >
                      View Scope History
                    </Link>
                  </div>

                  {wo.status === 'completed' && (
                    <Link
                      to="/customer/completion-approvals"
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Sign-Off Center
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scope Change Request Modal */}
      {scopeModalOpen && selectedWO && (
        <Modal
          isOpen={true}
          onClose={() => setScopeModalOpen(false)}
          title={`Request Scope Change for ${selectedWO.workOrderId}`}
          maxWidth="lg"
        >
          {scopeSuccess ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-800">{scopeSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleRequestScopeChange} className="space-y-4">
              {scopeError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{scopeError}</span>
                </div>
              )}

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Original Locked Work Scope (Will Never Be Overwritten)
                </span>
                <p className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  {selectedWO.originalScope}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proposed Additional Scope / Modification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={proposedScope}
                  onChange={(e) => setProposedScope(e.target.value)}
                  placeholder="e.g. In addition to repairing the kitchen faucet, please also replace the braided supply hoses leading to the water filter..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Scope Modification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={scopeReason}
                  onChange={(e) => setScopeReason(e.target.value)}
                  placeholder="e.g. Discovered wear on old hoses during inspection; would like preventative replacement."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Estimated Budget ($)
                </label>
                <input
                  type="number"
                  min={0}
                  value={additionalCost}
                  onChange={(e) => setAdditionalCost(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Leave at 0 if no extra cost was quoted yet.
                </span>
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
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {submittingScope ? 'Submitting Request...' : 'Send Scope Change Request'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

