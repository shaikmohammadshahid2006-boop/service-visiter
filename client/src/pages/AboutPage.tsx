import React from 'react';
import { ShieldCheck, FileCheck, CheckCircle2, Clock, Users, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">About Our Platform</span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Restoring Trust in Household Service Appointments
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Home repairs and maintenance are essential, yet over 40% of service visits involve disputes over unexpected additional charges, missed time windows, or misunderstandings about what work was actually agreed upon.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Our Core Philosophy: Immutable Scope</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              When a booking is accepted, the initial description becomes the immutable base scope. No contractor can alter it or bill for unauthorized extras. If unpredicted conditions are discovered during the visit, our structured Scope Change workflow requires explicit mutual approval before any further work proceeds.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Customer Sign-Off First</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A contractor marking a job complete does not finish the transaction. Our system requires before-and-after photographic evidence and customer verification. If anything was missed, customers can report an issue or open a dispute directly with admin triage.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-blue-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold">Ready to manage your appointments with transparency?</h2>
            <p className="mt-2 text-sm text-blue-100 max-w-xl">
              Create a free customer or service provider account in less than two minutes.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition shadow-sm"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

