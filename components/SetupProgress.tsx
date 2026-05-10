/**
 * SetupProgress Component
 * Shows a progress bar for the 5-step setup flow
 * Only visible when user is in initial setup (setupCompleted === false)
 */

interface SetupProgressProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

export function SetupProgress({ currentStep }: SetupProgressProps) {
  const steps = [
    { num: 1, label: 'Digital Card' },
    { num: 2, label: 'Legal Service' },
    { num: 3, label: 'Donna AI' },
    { num: 4, label: 'Bridge' },
    { num: 5, label: 'Billing' },
  ];

  return (
    <div className="px-6 py-4 border-b border-purple/20 bg-ink-300/50">
      {/* Progress Bar Title */}
      <p className="text-xs text-cream/60 uppercase tracking-wider mb-3 font-semibold">
        Setup Progress
      </p>

      {/* Step Indicators */}
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => (
          <div key={step.num} className="flex items-center gap-2 flex-1">
            {/* Step Circle */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition ${
                step.num < currentStep
                  ? 'bg-green-500 text-ink-500' // Completed
                  : step.num === currentStep
                    ? 'bg-purple-500 text-ink-500 ring-2 ring-purple-400' // Current
                    : 'bg-ink-200/30 text-cream/40' // Upcoming
              }`}
            >
              {step.num < currentStep ? '✓' : step.num}
            </div>

            {/* Connector Line */}
            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 transition ${
                  step.num < currentStep
                    ? 'bg-green-500'
                    : 'bg-ink-200/20'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Label */}
      <p className="text-xs text-cream/50 mt-2">
        {currentStep === 1 && 'Step 1 of 5: Create your Digital Card'}
        {currentStep === 2 && 'Step 2 of 5: Configure Legal Service'}
        {currentStep === 3 && 'Step 3 of 5: Setup Donna AI'}
        {currentStep === 4 && 'Step 4 of 5: Manage Bridge Sessions'}
        {currentStep === 5 && 'Step 5 of 5: Coming Soon - Billing'}
      </p>
    </div>
  );
}
