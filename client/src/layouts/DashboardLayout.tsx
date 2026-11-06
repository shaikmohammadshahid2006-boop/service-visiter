import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DemoBanner } from '../components/DemoBanner';
import { NotificationDropdown } from '../components/NotificationDropdown';
import {
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  FileText,
  FileDiff,
  CheckCircle,
  AlertTriangle,
  Bell,
  User,
  LogOut,
  Users,
  Briefcase,
  Layers,
  BarChart3,
  Settings,
  Star,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Wrench,
  UserCheck,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (role === 'admin') {
      return [
        { label: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
        { label: 'Customers', path: '/admin/customers', icon: Users },
        { label: 'Service Providers', path: '/admin/providers', icon: Briefcase },
        { label: 'All Appointments', path: '/admin/appointments', icon: Calendar },
        { label: 'Service Categories', path: '/admin/categories', icon: Layers },
        { label: 'Disputes', path: '/admin/disputes', icon: AlertTriangle },
        { label: 'Reports & Audit', path: '/admin/reports', icon: BarChart3 },
        { label: 'System Settings', path: '/admin/settings', icon: Settings },
      ];
    }

    if (role === 'provider') {
      return [
        { label: 'Overview', path: '/provider/overview', icon: LayoutDashboard },
        { label: 'Booking Requests', path: '/provider/booking-requests', icon: CalendarPlus },
        { label: 'My Appointments', path: '/provider/my-appointments', icon: Calendar },
        { label: 'Work Orders', path: '/provider/work-orders', icon: FileText },
        { label: 'Scope Change Requests', path: '/provider/scope-change-requests', icon: FileDiff },
        { label: 'Completed Jobs', path: '/provider/completed-jobs', icon: CheckCircle },
        { label: 'Reviews', path: '/provider/reviews', icon: Star },
        { label: 'Profile Settings', path: '/provider/profile', icon: User },
      ];
    }

    // Default Customer
    return [
      { label: 'Overview', path: '/customer/overview', icon: LayoutDashboard },
      { label: 'Book a Service', path: '/customer/book', icon: CalendarPlus },
      { label: 'My Appointments', path: '/customer/my-appointments', icon: Calendar },
      { label: 'Work Orders', path: '/customer/work-orders', icon: FileText },
      { label: 'Scope Changes', path: '/customer/scope-change-history', icon: FileDiff },
      { label: 'Completion Approvals', path: '/customer/completion-approvals', icon: CheckCircle },
      { label: 'Disputes', path: '/customer/disputes', icon: AlertTriangle },
      { label: 'Notifications', path: '/customer/notifications', icon: Bell },
      { label: 'Profile Settings', path: '/customer/profile', icon: User },
    ];
  };

  const navLinks = getNavLinks();

  const getRoleBadge = () => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
          <ShieldCheck className="w-3.5 h-3.5" /> Administrator
        </span>
      );
    }
    if (role === 'provider') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
          <Wrench className="w-3.5 h-3.5" /> Service Provider
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
        <UserCheck className="w-3.5 h-3.5" /> Customer
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DemoBanner />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 shrink-0">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                S
              </div>
              <div>
                <span className="font-bold text-slate-900 tracking-tight text-sm">ServiceVisit</span>
                <span className="text-blue-600 font-bold text-sm ml-1">Tracker</span>
              </div>
            </div>
          </div>

          <div className="px-5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
                alt={user?.name}
                className="w-10 h-10 rounded-full border border-slate-200 object-cover bg-slate-100"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                <div className="mt-0.5">{getRoleBadge()}</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-slate-900/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">ServiceVisit Tracker</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt=""
                  className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                  <div className="mt-0.5">{getRoleBadge()}</div>
                </div>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-700 capitalize font-semibold">
                  {location.pathname.split('/').pop()?.replace(/-/g, ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2.5">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt=""
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                />
                <span className="text-xs font-semibold text-slate-800">{user?.name}</span>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

