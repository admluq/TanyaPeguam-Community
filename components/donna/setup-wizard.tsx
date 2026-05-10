'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Plus, X } from 'lucide-react';

interface FormData {
  practiceAreas: string[];
  jurisdiction: string;
  availabilityStart: string;
  availabilityEnd: string;
  triageRules: TriageRule[];
  emailAddress: string;
  tier: string;
}

interface TriageRule {
  id: string;
  keyword: string;
  action: 'accept' | 'reject' | 'email';
}

const PRACTICE_AREAS = [
  'Corporate',
  'Employment',
  'Family',
  'Real Estate',
  'Litigation',
  'Intellectual Property',
  'Criminal',
  'Immigration',
];

const JURISDICTIONS = ['Federal', 'State', 'Local', 'International'];

const TIERS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Professional' },
  { value: 'enterprise', label: 'Enterprise' },
];

export function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    practiceAreas: [],
    jurisdiction: '',
    availabilityStart: '09:00',
    availabilityEnd: '17:00',
    triageRules: [],
    emailAddress: '',
    tier: 'pro',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const steps = [
    { title: 'Practice Areas', id: 'areas' },
    { title: 'Jurisdiction', id: 'jurisdiction' },
    { title: 'Availability', id: 'availability' },
    { title: 'Triage Rules', id: 'triage' },
    { title: 'Email & Tier', id: 'email' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');

    try {
      const response = await fetch('/api/donna/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      // Success — could redirect or show confirmation
      console.log('Configuration saved successfully');
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const togglePracticeArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      practiceAreas: prev.practiceAreas.includes(area)
        ? prev.practiceAreas.filter((a) => a !== area)
        : [...prev.practiceAreas, area],
    }));
  };

  const addTriageRule = () => {
    const newRule: TriageRule = {
      id: crypto.randomUUID(),
      keyword: '',
      action: 'accept',
    };
    setFormData((prev) => ({
      ...prev,
      triageRules: [...prev.triageRules, newRule],
    }));
  };

  const removeTriageRule = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      triageRules: prev.triageRules.filter((r) => r.id !== id),
    }));
  };

  const updateTriageRule = (
    id: string,
    field: keyof TriageRule,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      triageRules: prev.triageRules.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      ),
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Step indicators */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className="flex items-center gap-2 flex-1"
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  idx <= currentStep
                    ? 'bg-gold text-ink-400'
                    : 'bg-ink-200 text-cream-muted border border-ink-50'
                )}
              >
                {idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 rounded-full transition-all',
                    idx < currentStep ? 'bg-gold' : 'bg-ink-50'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-cream text-lg font-display">
          {steps[currentStep].title}
        </p>
      </div>

      {/* Step content */}
      <div className="bg-ink-200 border border-ink-50 rounded-2xl p-6 mb-6">
        {currentStep === 0 && (
          <div>
            <p className="text-cream-muted text-sm mb-4">
              Select all practice areas you offer
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PRACTICE_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => togglePracticeArea(area)}
                  className={cn(
                    'p-3 rounded-lg border text-sm font-medium transition-all',
                    formData.practiceAreas.includes(area)
                      ? 'bg-gold/15 border-gold/40 text-gold'
                      : 'bg-ink-300 border-ink-50 text-cream hover:border-gold/20'
                  )}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <p className="text-cream-muted text-sm mb-4">
              Select your primary jurisdiction
            </p>
            <div className="space-y-2">
              {JURISDICTIONS.map((j) => (
                <label
                  key={j}
                  className="flex items-center gap-3 p-3 rounded-lg border border-ink-50 hover:border-gold/20 cursor-pointer transition-all"
                >
                  <input
                    type="radio"
                    name="jurisdiction"
                    value={j}
                    checked={formData.jurisdiction === j}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        jurisdiction: e.target.value,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-cream text-sm">{j}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <p className="text-cream-muted text-sm mb-4">
              Set your availability window
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-cream text-sm font-medium mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.availabilityStart}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      availabilityStart: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-ink-300 border border-ink-50 rounded-lg text-cream"
                />
              </div>
              <div>
                <label className="block text-cream text-sm font-medium mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.availabilityEnd}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      availabilityEnd: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-ink-300 border border-ink-50 rounded-lg text-cream"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <p className="text-cream-muted text-sm mb-4">
              Add keyword-based triage rules
            </p>
            <div className="space-y-3 mb-4">
              {formData.triageRules.map((rule) => (
                <div key={rule.id} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Keyword"
                    value={rule.keyword}
                    onChange={(e) =>
                      updateTriageRule(rule.id, 'keyword', e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-ink-300 border border-ink-50 rounded-lg text-cream text-sm"
                  />
                  <select
                    value={rule.action}
                    onChange={(e) =>
                      updateTriageRule(
                        rule.id,
                        'action',
                        e.target.value as 'accept' | 'reject' | 'email'
                      )
                    }
                    className="px-3 py-2 bg-ink-300 border border-ink-50 rounded-lg text-cream text-sm"
                  >
                    <option value="accept">Accept</option>
                    <option value="reject">Reject</option>
                    <option value="email">Email</option>
                  </select>
                  <button
                    onClick={() => removeTriageRule(rule.id)}
                    className="p-2 hover:bg-danger/10 rounded-lg text-danger transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addTriageRule}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gold/30 text-gold text-sm font-medium hover:bg-gold/5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-cream text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    emailAddress: e.target.value,
                  }))
                }
                placeholder="your@law.com"
                className="w-full px-4 py-2 bg-ink-300 border border-ink-50 rounded-lg text-cream"
              />
            </div>
            <div>
              <label className="block text-cream text-sm font-medium mb-2">
                Service Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIERS.map((tier) => (
                  <button
                    key={tier.value}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        tier: tier.value,
                      }))
                    }
                    className={cn(
                      'p-3 rounded-lg border text-sm font-medium transition-all',
                      formData.tier === tier.value
                        ? 'bg-gold/15 border-gold/40 text-gold'
                        : 'bg-ink-300 border-ink-50 text-cream hover:border-gold/20'
                    )}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {saveError && (
          <div className="mt-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
            {saveError}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between gap-3">
        <button
          onClick={handleBack}
          disabled={currentStep === 0 || isSaving}
          className={cn(
            'px-6 py-2 rounded-lg border text-sm font-medium transition-all',
            currentStep === 0 || isSaving
              ? 'opacity-50 cursor-not-allowed'
              : 'border-ink-50 text-cream hover:border-gold/30 hover:bg-ink-200'
          )}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={isSaving}
          className={cn(
            'flex items-center gap-2 px-6 py-2 rounded-lg border border-gold/30 text-gold font-medium transition-all',
            isSaving
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gold/5'
          )}
        >
          {currentStep === steps.length - 1 ? (
            isSaving ? (
              'Saving...'
            ) : (
              'Save Configuration'
            )
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
