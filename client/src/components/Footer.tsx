import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900">ServiceVisit Tracker</span>
            </div>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              Transparent home service management with immutable scope change records, verified before/after proof, and digital customer sign-offs.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Features</h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Transparent Bookings</li>
              <li className="flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5 text-blue-600" /> Scope Change Auditing</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Customer Sign-Off Guarantee</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Navigation</h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
              <li><Link to="/services" className="hover:text-blue-600">Service Categories</Link></li>
              <li><Link to="/about" className="hover:text-blue-600">About Platform</Link></li>
              <li><Link to="/login" className="hover:text-blue-600">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Dispute Resolution</h4>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              Our triple-check audit trail ensures neither customer nor provider can unilaterally alter project agreements without verified mutual authorization.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} ServiceVisit Tracker Inc. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span>Production Grade v1.0.0</span>
            <span>•</span>
            <span>Security & Audit Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

