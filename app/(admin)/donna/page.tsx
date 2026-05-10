'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DonnaConfigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    kbContext: '',
    personality: 'PROFESSIONAL' as 'PROFESSIONAL' | 'SOFT' | 'STRICT',
    triageRules: {
      practiceAreas: [] as string[],
      deflectPatterns: [] as string[],
    },
  });

  const [practiceAreaInput, setPracticeAreaInput] = useState('');
  const [deflectPatternInput, setDeflectPatternInput] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Load existing config if any
    if (session?.user?.id) {
      fetchConfig();
    }
  }, [session]);

  async function fetchConfig() {
    try {
      const res = await fetch('/api/admin/donna-config');
      if (res.ok) {
        const data = await res.json();
        setForm({
          kbContext: data.config.kbContext || '',
          personality: data.config.personality || 'PROFESSIONAL',
          triageRules: data.config.triageRules || {
            practiceAreas: [],
            deflectPatterns: [],
          },
        });
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
    }
  }

  function addPracticeArea() {
    if (practiceAreaInput.trim()) {
      setForm({
        ...form,
        triageRules: {
          ...form.triageRules,
          practiceAreas: [...form.triageRules.practiceAreas, practiceAreaInput.trim()],
        },
      });
      setPracticeAreaInput('');
    }
  }

  function removePracticeArea(index: number) {
    setForm({
      ...form,
      triageRules: {
        ...form.triageRules,
        practiceAreas: form.triageRules.practiceAreas.filter((_, i) => i !== index),
      },
    });
  }

  function addDeflectPattern() {
    if (deflectPatternInput.trim()) {
      setForm({
        ...form,
        triageRules: {
          ...form.triageRules,
          deflectPatterns: [...form.triageRules.deflectPatterns, deflectPatternInput.trim()],
        },
      });
      setDeflectPatternInput('');
    }
  }

  function removeDeflectPattern(index: number) {
    setForm({
      ...form,
      triageRules: {
        ...form.triageRules,
        deflectPatterns: form.triageRules.deflectPatterns.filter((_, i) => i !== index),
      },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/donna-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save config');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/profile" className="text-purple-400 hover:text-purple-300 inline-block">
              ← Back to Digital Card
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Step 2 of 3</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">🤖 Donna AI Configuration</h1>
          <p className="text-gray-300">Set up AI behavior, personality, and triage rules</p>
        </div>

        {/* Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* KB Context */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Knowledge Base Context
              </label>
              <textarea
                value={form.kbContext}
                onChange={(e) => setForm({ ...form, kbContext: e.target.value })}
                placeholder="Describe your expertise, practice areas, availability, fees, etc. This helps Donna AI understand your capabilities..."
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                This context is used by Donna AI to understand client requests and triage appropriately.
              </p>
            </div>

            {/* Personality */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Donna Personality
              </label>
              <select
                value={form.personality}
                onChange={(e) =>
                  setForm({
                    ...form,
                    personality: e.target.value as 'PROFESSIONAL' | 'SOFT' | 'STRICT',
                  })
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="PROFESSIONAL">Professional (Formal, detailed)</option>
                <option value="SOFT">Soft (Friendly, approachable)</option>
                <option value="STRICT">Strict (Direct, no-nonsense)</option>
              </select>
            </div>

            {/* Practice Areas */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Practice Areas
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={practiceAreaInput}
                  onChange={(e) => setPracticeAreaInput(e.target.value)}
                  placeholder="e.g. Family Law"
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addPracticeArea();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addPracticeArea}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {form.triageRules.practiceAreas.map((area, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-700 px-4 py-2 rounded-lg">
                    <span className="text-gray-200">{area}</span>
                    <button
                      type="button"
                      onClick={() => removePracticeArea(idx)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Deflect Patterns */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Deflect Patterns (auto-reject keywords)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={deflectPatternInput}
                  onChange={(e) => setDeflectPatternInput(e.target.value)}
                  placeholder="e.g. criminal, tax"
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDeflectPattern();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addDeflectPattern}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {form.triageRules.deflectPatterns.map((pattern, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-700 px-4 py-2 rounded-lg">
                    <span className="text-gray-200">{pattern}</span>
                    <button
                      type="button"
                      onClick={() => removeDeflectPattern(idx)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-lg">
                ✓ Configuration saved successfully!
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
              <Link href="/bridges" className="flex-1">
                <button
                  type="button"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  Next: Step 3 →
                </button>
              </Link>
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Configuration Details</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>✓ <span className="text-purple-400">Knowledge Base:</span> Helps Donna understand your practice</li>
            <li>✓ <span className="text-purple-400">Personality:</span> Controls Donna's tone when talking to clients</li>
            <li>✓ <span className="text-purple-400">Practice Areas:</span> What types of cases you handle</li>
            <li>✓ <span className="text-purple-400">Deflect Patterns:</span> Auto-reject cases with certain keywords</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
