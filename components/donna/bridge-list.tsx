'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Eye, Link2, Trash2 } from 'lucide-react';

interface Bridge {
  id: string;
  refCode: string;
  source: string;
  question: string;
  practiceArea: string;
  url: string;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
}

interface BridgeListProps {
  initialBridges?: Bridge[];
}

export function BridgeList({ initialBridges = [] }: BridgeListProps) {
  const [bridges, setBridges] = useState<Bridge[]>(initialBridges);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bridge? This action cannot be undone.')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/donna/bridges/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bridge');
      }

      setBridges((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/donna/bridges/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bridge');
      }

      setBridges((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, isActive: !currentActive } : b
        )
      );
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  if (bridges.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink-200 border border-ink-50 mb-4">
          <Link2 className="w-6 h-6 text-cream-muted" />
        </div>
        <p className="text-cream-muted">No bridges created yet</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-3">
        {bridges.map((bridge) => (
          <div
            key={bridge.id}
            className="bg-ink-200 border border-ink-50 rounded-2xl overflow-hidden transition-all duration-300"
          >
            {/* Card header */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        bridge.isActive ? 'bg-success' : 'bg-ink-50'
                      )}
                    />
                    <span className="text-cream font-display text-lg">
                      {bridge.source}
                    </span>
                  </div>
                  <p className="text-cream-muted text-sm line-clamp-1">
                    {bridge.question}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Active badge */}
                  <button
                    onClick={() =>
                      toggleActive(bridge.id, bridge.isActive)
                    }
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium transition-all',
                      bridge.isActive
                        ? 'bg-success/10 text-success border border-success/30'
                        : 'bg-ink-300 text-cream-muted border border-ink-50'
                    )}
                  >
                    {bridge.isActive ? 'Active' : 'Inactive'}
                  </button>

                  {/* Expand toggle */}
                  <button
                    onClick={() => toggleExpanded(bridge.id)}
                    className="p-1 hover:bg-gold/10 rounded transition-all"
                  >
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-cream-muted transition-transform',
                        expandedId === bridge.id && 'rotate-180'
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-4 text-xs text-cream-muted">
                <span className="inline-flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-ink-300">
                    {bridge.practiceArea}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {bridge.clickCount} clicks
                </span>
                <span>
                  {new Date(bridge.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Expanded content */}
            {expandedId === bridge.id && (
              <div className="px-6 pb-6 border-t border-ink-50 pt-4 space-y-4 animate-fade-in">
                {/* Bridge URL */}
                <div>
                  <p className="text-cream text-xs uppercase tracking-wider mb-2">
                    Bridge URL
                  </p>
                  <code className="block text-gold text-xs font-mono break-all p-3 bg-ink-300 rounded-lg">
                    {bridge.url}
                  </code>
                </div>

                {/* Reference code */}
                <div>
                  <p className="text-cream text-xs uppercase tracking-wider mb-2">
                    Reference Code
                  </p>
                  <code className="block text-gold text-sm font-mono font-bold p-3 bg-ink-300 rounded-lg">
                    {bridge.refCode}
                  </code>
                </div>

                {/* Full question */}
                <div>
                  <p className="text-cream text-xs uppercase tracking-wider mb-2">
                    Full Question
                  </p>
                  <p className="text-cream text-sm p-3 bg-ink-300 rounded-lg">
                    {bridge.question}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(bridge.url);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-gold/30 text-gold text-sm font-medium hover:bg-gold/5 transition-all"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => handleDelete(bridge.id)}
                    disabled={isLoading}
                    className={cn(
                      'flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-danger/30 text-danger text-sm font-medium transition-all',
                      isLoading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-danger/5'
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
