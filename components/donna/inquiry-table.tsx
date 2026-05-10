'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Filter } from 'lucide-react';

interface Inquiry {
  id: string;
  caller: string;
  practiceArea: string;
  concretenessScore: number;
  tier: string;
  status: 'CAPTURED' | 'EMAILED' | 'ACCEPTED' | 'REJECTED' | 'PENDING';
  date: string;
  phoneNumber?: string;
  email?: string;
  issueSummary?: string;
  location?: string;
}

interface InquiryTableProps {
  initialInquiries?: Inquiry[];
}

const STATUS_COLORS: Record<Inquiry['status'], string> = {
  CAPTURED: 'bg-ink-200 text-cream-muted',
  EMAILED: 'bg-warning/10 text-warning',
  ACCEPTED: 'bg-success/10 text-success',
  REJECTED: 'bg-danger/10 text-danger',
  PENDING: 'bg-gold/10 text-gold',
};

const TIER_COLORS: Record<string, string> = {
  free: 'bg-ink-200 text-cream-muted',
  pro: 'bg-gold/10 text-gold',
  enterprise: 'bg-success/10 text-success',
};

export function InquiryTable({ initialInquiries = [] }: InquiryTableProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | Inquiry['status']>(
    'ALL'
  );

  const filteredInquiries = useMemo(() => {
    if (statusFilter === 'ALL') return inquiries;
    return inquiries.filter((i) => i.status === statusFilter);
  }, [inquiries, statusFilter]);

  const statusOptions: Array<{ value: 'ALL' | Inquiry['status']; label: string }> = [
    { value: 'ALL', label: 'All' },
    { value: 'CAPTURED', label: 'Captured' },
    { value: 'EMAILED', label: 'Emailed' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'PENDING', label: 'Pending' },
  ];

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
    });
  };

  const getConcretenessColor = (score: number) => {
    if (score >= 0.75) return 'text-success';
    if (score >= 0.5) return 'text-warning';
    return 'text-cream-muted';
  };

  if (inquiries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-cream-muted">No inquiries yet</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-all border',
              statusFilter === opt.value
                ? 'bg-gold/15 border-gold/40 text-gold'
                : 'bg-ink-200 border-ink-50 text-cream-muted hover:border-gold/20'
            )}
          >
            <Filter className="w-3 h-3 inline mr-1" />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table header */}
      <div className="hidden md:grid grid-cols-7 gap-4 px-4 py-3 bg-ink-200 rounded-t-2xl border border-ink-50 border-b-0 text-xs uppercase tracking-wider text-cream-muted font-medium">
        <div>Caller</div>
        <div>Practice Area</div>
        <div className="text-center">Concreteness</div>
        <div className="text-center">Tier</div>
        <div className="text-center">Status</div>
        <div>Date</div>
        <div />
      </div>

      {/* Table rows */}
      <div className="space-y-2">
        {filteredInquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="bg-ink-200 border border-ink-50 rounded-2xl overflow-hidden transition-all duration-300"
          >
            {/* Row content */}
            <div className="p-4 md:p-0">
              {/* Mobile view */}
              <div className="md:hidden">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-cream font-medium">{inquiry.caller}</p>
                    <p className="text-cream-muted text-xs mt-1">
                      {inquiry.practiceArea}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleExpanded(inquiry.id)}
                    className="p-1 hover:bg-gold/10 rounded transition-all flex-shrink-0"
                  >
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-cream-muted transition-transform',
                        expandedId === inquiry.id && 'rotate-180'
                      )}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={cn(
                      'px-2 py-1 rounded font-medium',
                      STATUS_COLORS[inquiry.status]
                    )}
                  >
                    {inquiry.status}
                  </span>
                  <span className="text-cream-muted">
                    {formatDate(inquiry.date)}
                  </span>
                </div>
              </div>

              {/* Desktop view */}
              <div className="hidden md:grid grid-cols-7 gap-4 items-center">
                <div className="text-cream text-sm">{inquiry.caller}</div>
                <div className="text-cream-muted text-sm">
                  {inquiry.practiceArea}
                </div>
                <div className={cn('text-sm text-center font-bold', getConcretenessColor(inquiry.concretenessScore))}>
                  {(inquiry.concretenessScore * 100).toFixed(0)}%
                </div>
                <div className="text-center">
                  <span
                    className={cn(
                      'inline-block px-2 py-1 rounded text-xs font-medium',
                      TIER_COLORS[inquiry.tier] || TIER_COLORS.free
                    )}
                  >
                    {inquiry.tier.charAt(0).toUpperCase() +
                      inquiry.tier.slice(1)}
                  </span>
                </div>
                <div className="text-center">
                  <span
                    className={cn(
                      'inline-block px-2 py-1 rounded text-xs font-medium',
                      STATUS_COLORS[inquiry.status]
                    )}
                  >
                    {inquiry.status}
                  </span>
                </div>
                <div className="text-cream-muted text-sm">
                  {formatDate(inquiry.date)}
                </div>
                <div className="text-right">
                  <button
                    onClick={() => toggleExpanded(inquiry.id)}
                    className="p-1 hover:bg-gold/10 rounded transition-all"
                  >
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-cream-muted transition-transform',
                        expandedId === inquiry.id && 'rotate-180'
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded details */}
            {expandedId === inquiry.id && (
              <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-ink-50 pt-4 space-y-3 animate-fade-in">
                {inquiry.phoneNumber && (
                  <div>
                    <p className="text-cream-muted text-xs uppercase tracking-wider mb-1">
                      Phone
                    </p>
                    <p className="text-cream font-mono text-sm">
                      {inquiry.phoneNumber}
                    </p>
                  </div>
                )}

                {inquiry.email && (
                  <div>
                    <p className="text-cream-muted text-xs uppercase tracking-wider mb-1">
                      Email
                    </p>
                    <p className="text-cream text-sm break-all">
                      {inquiry.email}
                    </p>
                  </div>
                )}

                {inquiry.location && (
                  <div>
                    <p className="text-cream-muted text-xs uppercase tracking-wider mb-1">
                      Location
                    </p>
                    <p className="text-cream text-sm">{inquiry.location}</p>
                  </div>
                )}

                {inquiry.issueSummary && (
                  <div>
                    <p className="text-cream-muted text-xs uppercase tracking-wider mb-1">
                      Issue Summary
                    </p>
                    <p className="text-cream text-sm leading-relaxed">
                      {inquiry.issueSummary}
                    </p>
                  </div>
                )}

                {/* Score breakdown */}
                <div className="bg-ink-300 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cream-muted text-xs uppercase tracking-wider">
                      Concreteness
                    </span>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        getConcretenessColor(inquiry.concretenessScore)
                      )}
                    >
                      {(inquiry.concretenessScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-ink-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        inquiry.concretenessScore >= 0.75
                          ? 'bg-success'
                          : inquiry.concretenessScore >= 0.5
                            ? 'bg-warning'
                            : 'bg-cream-muted'
                      )}
                      style={{
                        width: `${inquiry.concretenessScore * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredInquiries.length === 0 && (
        <div className="text-center py-8">
          <p className="text-cream-muted text-sm">
            No inquiries match the selected filter
          </p>
        </div>
      )}
    </div>
  );
}
