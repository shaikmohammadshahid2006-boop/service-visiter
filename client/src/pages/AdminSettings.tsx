import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, Bell, CheckCircle2, Lock } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoExpireHours, setAutoExpireHours] = useState(48);
  const [allowInstantSignOff, setAllowInstantSignOff] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Configuration & Policies</h1>
        <p className="text-xs text-slate-500 mt-1">
          Platform-level scope rules, dispute escalation periods, and security settings.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        {saved && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Settings saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Scope Integrity Policies
            </h3>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">Mandatory Photographic Proof</p>
                <p className="text-[11px] text-slate-500">
                  Require specialists to submit at least one before-and-after photo prior to completion request.
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                disabled
                className="h-4 w-4 text-blue-600 rounded cursor-not-allowed"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">Explicit Customer Sign-Off</p>
                <p className="text-[11px] text-slate-500">
                  Enforce that jobs remain unfinalized until homeowner digital confirmation or admin mediation.
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                disabled
                className="h-4 w-4 text-blue-600 rounded cursor-not-allowed"
              />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-900">
                Scope Change Decision Window (Hours)
              </label>
              <input
                type="number"
                min={12}
                max={168}
                value={autoExpireHours}
                onChange={(e) => setAutoExpireHours(Number(e.target.value))}
                className="w-32 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400">
                Maximum time a customer or provider has to accept or reject an open scope change request.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              System Health & Architecture
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Database Engine:</span>
                <span className="font-semibold text-slate-900">MongoDB with Mongoose ODM (Auto-failover enabled)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authentication:</span>
                <span className="font-semibold text-slate-900">JWT + bcrypt (Role-based access control)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Validation:</span>
                <span className="font-semibold text-slate-900">Zod schemas + Centralized error middleware</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

