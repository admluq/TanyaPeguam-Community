import { useState } from 'react';

type Status = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';

interface StatusSelectorProps {
  value: Status;
  onChange: (status: Status) => void;
  disabled?: boolean;
}

const statusOptions = [
  { value: 'AVAILABLE' as Status, label: 'Boleh Dihubungi', color: 'text-[#34d399]', bgColor: 'bg-[rgba(52,211,153,0.08)]', borderColor: 'border-[rgba(52,211,153,0.2)]' },
  { value: 'BUSY' as Status, label: 'Sibuk', color: 'text-gold', bgColor: 'bg-[rgba(212,168,83,0.08)]', borderColor: 'border-[rgba(212,168,83,0.2)]' },
  { value: 'AWAY' as Status, label: 'Jauh', color: 'text-[#fb923c]', bgColor: 'bg-[rgba(251,146,60,0.08)]', borderColor: 'border-[rgba(251,146,60,0.2)]' },
];

export function StatusSelector({ value, onChange, disabled = false }: StatusSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {statusOptions.map((status) => (
        <button
          key={status.value}
          onClick={() => onChange(status.value)}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-left transition-all text-sm ${
            value === status.value
              ? `${status.bgColor} ${status.borderColor} text-text-primary`
              : 'border-border text-text-secondary hover:border-border-hover'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className={`w-4 h-4 rounded-full ${status.color}`} />
          {status.label}
        </button>
      ))}
    </div>
  );
}

export function getStatusColor(status: Status): string {
  const option = statusOptions.find(opt => opt.value === status);
  return option?.color || 'text-text-muted';
}

export function getStatusLabel(status: Status): string {
  const option = statusOptions.find(opt => opt.value === status);
  return option?.label || 'Unknown';
}
