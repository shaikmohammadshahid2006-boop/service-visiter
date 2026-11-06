import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const getStyle = (s: string) => {
    switch (s.toLowerCase()) {
      case 'pending':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          dot: 'bg-amber-500',
          label: 'Pending',
        };
      case 'accepted':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          dot: 'bg-blue-500',
          label: 'Accepted',
        };
      case 'scheduled':
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-200',
          dot: 'bg-indigo-500',
          label: 'Scheduled',
        };
      case 'in_progress':
      case 'created':
        return {
          bg: 'bg-sky-50',
          text: 'text-sky-700',
          border: 'border-sky-200',
          dot: 'bg-sky-500',
          label: s === 'created' ? 'Work Order Created' : 'In Progress',
        };
      case 'completed':
      case 'approved':
      case 'resolved':
      case 'active':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          dot: 'bg-emerald-500',
          label: s.charAt(0).toUpperCase() + s.slice(1),
        };
      case 'rejected':
      case 'cancelled':
      case 'suspended':
      case 'issue_reported':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          dot: 'bg-rose-500',
          label: s === 'issue_reported' ? 'Issue Reported' : s.charAt(0).toUpperCase() + s.slice(1),
        };
      case 'opened':
      case 'under_review':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          dot: 'bg-purple-500',
          label: s === 'under_review' ? 'Under Review' : 'Dispute Open',
        };
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
          dot: 'bg-slate-400',
          label: s,
        };
    }
  };

  const config = getStyle(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

