import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ScopeChange } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FileDiff, DollarSign, Calendar, User, Clock, CheckCircle2 } from 'lucide-react';

export const ProviderScopeChanges: React.FC = () => {
  const [scopeChanges, setScopeChanges] = useState<ScopeChange[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <LoadingSpinner message="Loading scope change requests..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Scope Change Tracking</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review status of scope modification requests submitted to customers.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        {scopeChanges.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No scope changes requested yet.
          </div>
        ) : (
          <div className="space-y-4">
            {scopeChanges.map((sc) => (
              <div
                key={sc._id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {sc.changeId}
                    </span>
                    <span className="text-xs text-slate-500">
                      Work Order: {sc.workOrder?.workOrderId || sc.bookingId}
                    </span>
                    <StatusBadge status={sc.status} size="sm" />
                  </div>

                  <span className="text-sm font-extrabold text-slate-900">
                    +${sc.additionalCost}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Original Locked Scope Snapshot
                    </span>
                    <p className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600">
                      {sc.originalScopeSnapshot}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                      Proposed Additional Scope
                    </span>
                    <p className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-200 text-slate-800 font-medium">
                      {sc.proposedScope}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700">Reason:</span> {sc.reason}
                </div>

                {sc.decisionNotes && (
                  <div className="text-xs text-slate-700 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-800">Customer Decision Notes:</span> {sc.decisionNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

