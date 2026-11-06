import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CompletionApproval } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CheckCircle2, Star, Calendar, User, DollarSign, Camera } from 'lucide-react';

export const ProviderCompletedJobs: React.FC = () => {
  const [completions, setCompletions] = useState<CompletionApproval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/completion?status=approved')
      .then((res) => setCompletions(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading completed jobs..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Completed & Signed-Off Jobs</h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical record of all service orders inspected, approved, and reviewed by customers.
        </p>
      </div>

      {completions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No completed jobs yet</p>
          <p className="text-xs text-slate-400 mt-1">Jobs marked complete will appear here once signed off by the customer.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completions.map((comp) => (
            <div
              key={comp._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {comp.completionRecordId}
                  </span>
                  <span className="text-xs text-slate-500">Booking: {comp.bookingId}</span>
                  <StatusBadge status={comp.finalCompletionStatus} size="sm" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Total Billed:</span>
                  <span className="text-base font-extrabold text-slate-900">${comp.totalFinalCost}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Review</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{comp.rating || 5} / 5 Stars</span>
                  </div>
                  <p className="text-slate-700 italic">"{comp.customerFeedback || 'Work completed satisfactorily.'}"</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-slate-600">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Timestamps & Approval</span>
                  <p><strong>Customer:</strong> {comp.customer?.name}</p>
                  <p><strong>Sign-Off Date:</strong> {comp.customerApprovalTimestamp ? new Date(comp.customerApprovalTimestamp).toLocaleString() : '—'}</p>
                  <p><strong>Provider Completion:</strong> {new Date(comp.providerCompletionTimestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

