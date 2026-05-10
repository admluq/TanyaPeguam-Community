'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Copy, Check, ArrowRight } from 'lucide-react';

interface BridgeFormData {
  source: string;
  question: string;
  practiceArea: string;
  keyFacts: string;
}

interface SuccessState {
  bridgeUrl: string;
  refCode: string;
  signoffTemplate: string;
}

const PRACTICE_AREAS = [
  'Corporate',
  'Employment',
  'Family',
  'Real Estate',
  'Litigation',
  'Intellectual Property',
];

function generateSignoffTemplate(refCode: string, practiceArea: string): string {
  return `---

**Donna AI Intake**
Powered by Donna, your AI legal assistant. All information provided remains confidential under attorney-client privilege.

*Reference: ${refCode}*
*Practice Area: ${practiceArea}*

This link is compliant with ABA Model Rule 4.4 (Rule 4 as adopted). Donna AI serves as a pre-intake filtering system and does not constitute legal advice.`;
}

export function BridgeCreator() {
  const [formData, setFormData] = useState<BridgeFormData>({
    source: '',
    question: '',
    practiceArea: '',
    keyFacts: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successState, setSuccessState] = useState<SuccessState | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/donna/bridges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create bridge');
      }

      const data = await response.json();
      const signoffTemplate = generateSignoffTemplate(
        data.refCode,
        formData.practiceArea
      );

      setSuccessState({
        bridgeUrl: data.url,
        refCode: data.refCode,
        signoffTemplate,
      });

      // Reset form
      setFormData({
        source: '',
        question: '',
        practiceArea: '',
        keyFacts: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (successState) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 border border-success/30 mb-4">
            <Check className="w-6 h-6 text-success" />
          </div>
          <h2 className="font-display text-cream text-2xl mb-2">
            Bridge Created
          </h2>
          <p className="text-cream-muted text-sm">
            Share this link with clients to initiate intake
          </p>
        </div>

        {/* Bridge URL */}
        <div className="bg-ink-200 border border-ink-50 rounded-2xl p-6 mb-4">
          <p className="text-cream-muted text-xs uppercase tracking-wider mb-2">
            Bridge Link
          </p>
          <div className="flex items-center gap-2 mb-4">
            <code className="flex-1 text-gold text-sm break-all font-mono">
              {successState.bridgeUrl}
            </code>
            <button
              onClick={() => copyToClipboard(successState.bridgeUrl, 'url')}
              className="p-2 hover:bg-gold/10 rounded-lg transition-all"
            >
              {copiedField === 'url' ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-gold" />
              )}
            </button>
          </div>
        </div>

        {/* Reference code */}
        <div className="bg-ink-200 border border-ink-50 rounded-2xl p-6 mb-4">
          <p className="text-cream-muted text-xs uppercase tracking-wider mb-2">
            Reference Code
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-gold text-lg font-mono font-bold">
              {successState.refCode}
            </code>
            <button
              onClick={() => copyToClipboard(successState.refCode, 'ref')}
              className="p-2 hover:bg-gold/10 rounded-lg transition-all"
            >
              {copiedField === 'ref' ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-gold" />
              )}
            </button>
          </div>
        </div>

        {/* Signoff template */}
        <div className="bg-ink-200 border border-ink-50 rounded-2xl p-6 mb-6">
          <p className="text-cream-muted text-xs uppercase tracking-wider mb-3">
            Suggested Sign-Off (Rule 4 Compliant)
          </p>
          <div className="relative">
            <pre className="bg-ink-300 border border-ink-50 rounded-lg p-4 text-cream text-xs leading-relaxed overflow-auto max-h-48">
              {successState.signoffTemplate}
            </pre>
            <button
              onClick={() =>
                copyToClipboard(successState.signoffTemplate, 'signoff')
              }
              className="absolute top-2 right-2 p-2 hover:bg-gold/10 rounded-lg transition-all"
            >
              {copiedField === 'signoff' ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-gold" />
              )}
            </button>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => setSuccessState(null)}
          className="w-full px-6 py-2 rounded-lg border border-gold/30 text-gold font-medium hover:bg-gold/5 transition-all"
        >
          Create Another Bridge
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="font-display text-cream text-2xl mb-2">
          Create Bridge Link
        </h2>
        <p className="text-cream-muted text-sm">
          Generate a custom intake link for a specific inquiry source
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source */}
        <div>
          <label className="block text-cream text-sm font-medium mb-2">
            Source/Platform
          </label>
          <input
            type="text"
            placeholder="e.g., Facebook, LinkedIn, Referral"
            value={formData.source}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, source: e.target.value }))
            }
            required
            className="w-full px-4 py-2 bg-ink-200 border border-ink-50 rounded-lg text-cream placeholder:text-cream-muted focus:border-gold/40 focus:outline-none transition-all"
          />
        </div>

        {/* Question/Topic */}
        <div>
          <label className="block text-cream text-sm font-medium mb-2">
            Question or Topic
          </label>
          <textarea
            placeholder="What inquiry is this bridge for?"
            value={formData.question}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, question: e.target.value }))
            }
            required
            rows={3}
            className="w-full px-4 py-2 bg-ink-200 border border-ink-50 rounded-lg text-cream placeholder:text-cream-muted focus:border-gold/40 focus:outline-none transition-all"
          />
        </div>

        {/* Practice Area */}
        <div>
          <label className="block text-cream text-sm font-medium mb-2">
            Practice Area
          </label>
          <select
            value={formData.practiceArea}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                practiceArea: e.target.value,
              }))
            }
            required
            className="w-full px-4 py-2 bg-ink-200 border border-ink-50 rounded-lg text-cream focus:border-gold/40 focus:outline-none transition-all"
          >
            <option value="">Select practice area</option>
            {PRACTICE_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Key Facts */}
        <div>
          <label className="block text-cream text-sm font-medium mb-2">
            Key Facts / Context
          </label>
          <textarea
            placeholder="Any additional context or key details"
            value={formData.keyFacts}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, keyFacts: e.target.value }))
            }
            rows={3}
            className="w-full px-4 py-2 bg-ink-200 border border-ink-50 rounded-lg text-cream placeholder:text-cream-muted focus:border-gold/40 focus:outline-none transition-all"
          />
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gold/30 text-gold font-medium transition-all',
            isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gold/5'
          )}
        >
          {isLoading ? 'Creating...' : (
            <>
              Generate Bridge Link
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
