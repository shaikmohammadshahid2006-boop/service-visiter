import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ServiceCategory } from '../types';
import {
  ShieldCheck,
  FileCheck2,
  Camera,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Droplet,
  Thermometer,
  Wrench,
  Hammer,
  Paintbrush,
  Clock,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, switchDemoAccount } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  useEffect(() => {
    api.get('/services/categories')
      .then((res) => setCategories(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  const getCategoryIcon = (icon: string) => {
    switch (icon) {
      case 'Zap': return Zap;
      case 'Droplet': return Droplet;
      case 'Thermometer': return Thermometer;
      case 'Hammer': return Hammer;
      case 'Paintbrush': return Paintbrush;
      default: return Wrench;
    }
  };

  const handleDemoLogin = async (role: 'customer' | 'provider' | 'admin', email?: string) => {
    await switchDemoAccount(role, email);
    if (role === 'admin') navigate('/admin/overview');
    else if (role === 'provider') navigate('/provider/overview');
    else navigate('/customer/overview');
  };

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Zero Scope Creep • Verifiable Audit Trail • Explicit Customer Sign-Off</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Transparent Home Service Management with <span className="text-blue-600">Auditable Scope Records</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate disputes about appointment timings, unrecorded work changes, and surprise bills. ServiceVisit Tracker locks agreements, tracks every scope adjustment with mutual approvals, and guarantees customer sign-offs before jobs close.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/services"
              className="px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span>Explore Services & Book</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 transition"
            >
              Join as Customer or Provider
            </Link>
          </div>

          {/* Quick Demo Launchers */}
          <div className="mt-12 max-w-3xl mx-auto p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              One-Click Interactive Demo Testing
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleDemoLogin('customer', 'alex@example.com')}
                className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/60 text-left transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-blue-900">Customer View</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[11px] text-slate-500">Pending sign-off & dispute thread demo</p>
              </button>

              <button
                onClick={() => handleDemoLogin('provider', 'marcus@vanceelectric.com')}
                className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/60 text-left transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-900">Provider View</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[11px] text-slate-500">Incoming bookings & job status controls</p>
              </button>

              <button
                onClick={() => handleDemoLogin('admin')}
                className="p-3 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/60 text-left transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-900">Admin View</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-500 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[11px] text-slate-500">Live analytics, dispute triage & audits</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Solving Real Service Problems */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Pain Points Solved</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Traditional Home Services Lead to Disagreements
            </p>
            <p className="mt-4 text-sm text-slate-600">
              ServiceVisit Tracker was engineered to address the 5 most common reasons homeowner-contractor relationships fail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Immutable Scope Protection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Neither customer nor contractor can retroactively alter the agreed scope. Any new tasks require formal Scope Change requests with itemized costs and mutual digital approval.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Synchronized Schedule Logs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent appointment status history records the exact minute bookings are accepted, scheduled, started on-site, and completed with full timestamp verification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Mandatory Customer Sign-Off</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Work is never automatically finalized just because a provider marks it done. Customers must inspect before/after photos and explicitly confirm completion or report an issue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Service Categories */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Verified Categories</h2>
              <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
                Household Services with Fixed Base Rates
              </p>
            </div>
            <Link
              to="/services"
              className="mt-4 sm:mt-0 text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View all categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              return (
                <div
                  key={cat._id}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-200 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                    <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Starting from</span>
                      <p className="font-bold text-slate-900 text-sm">${cat.basePrice} <span className="text-slate-400 text-xs font-normal">est.</span></p>
                    </div>
                    <Link
                      to={`/services?category=${cat._id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Step-by-Step */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">How It Works</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
              A Transparent 4-Step Job Lifecycle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg mb-4 shadow-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Appointment Booking</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Customer selects verified provider, date slot, address, and provides detailed problem description.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg mb-4 shadow-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Work Order Generation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upon provider acceptance, an auditable Work Order is generated with initial estimated costs locked.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg mb-4 shadow-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Scope Change Auditing</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                If unforeseen issues arise, contractor submits a Scope Change request. No extra charges without customer sign-off.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg mb-4 shadow-sm">
                4
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Completion & Review</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Provider uploads before/after photos. Customer confirms satisfaction or flags an issue before final settlement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

