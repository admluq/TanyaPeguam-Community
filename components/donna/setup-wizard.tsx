'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, ChevronLeft, Loader2, Plus, X } from 'lucide-react';

const PRACTICE_AREAS = [
  'Defamasi & Reputasi',
  'Probet & Harta Pusaka',
  'Hartanah',
  'Pekerjaan & Buruh',
  'Jenayah',
  'Keluarga & Perkahwinan',
  'Korporat & Perniagaan',
  'Sivil Am',
];

const STATES = [
  'Wilayah Persekutuan Kuala Lumpur',
  'Wilayah Persekutuan Putrajaya',
  'Wilayah Persekutuan Labuan',
  'Selangor', 'Johor', 'Kedah', 'Kelantan', 'Melaka',
  'Negeri Sembilan', 'Pahang', 'Perak', 'Perlis',
  'Pulau Pinang', 'Sabah', 'Sarawak', 'Terengganu',
];

const BAR_COUNCILS = [
  { value: 'WP', label: 'Majlis Peguam Malaysia (Bar Council)' },
  { value: 'Sabah', label: 'Persatuan Peguam Sabah' },
  { value: 'Sarawak', label: 'Persatuan Peguam Sarawak' },
];

const HOURS_PRESETS = [
  { label: 'Isnin–Jumaat, 9am–5pm', value: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false, open: '09:00', close: '17:00' } },
  { label: 'Isnin–Sabtu, 9am–6pm', value: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false, open: '09:00', close: '18:00' } },
  { label: 'Setiap hari, 9am–5pm', value: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true, open: '09:00', close: '17:00' } },
];

const STEPS = [
  { id: 1, label: 'Bidang Amalan' },
  { id: 2, label: 'Bidang Kuasa' },
  { id: 3, label: 'Waktu & Yuran' },
  { id: 4, label: 'Peraturan Triage' },
  { id: 5, label: 'E-mel & Tier' },
];

type FormData = {
  practiceAreas: string[];
  jurisdiction: string;
  barCouncil: string[];
  hoursPreset: number;
  firstConsultMode: 'free' | 'paid';
  consultFee: string;
  urgencyFee: string;
  showVideoMeetingFees: boolean;
  videoMeetingFee: string;
  videoMeetingUrgencyFee: string;
  showPhysicalMeetingFees: boolean;
  physicalMeetingFee: string;
  physicalMeetingUrgencyFee: string;
  sensitivityLevel: number;
  deflectPatterns: string[];
  emailTo: string;
  lowTierLabel: string;
  medTierLabel: string;
  highTierLabel: string;
};

const DEFAULTS: FormData = {
  practiceAreas: [],
  jurisdiction: '',
  barCouncil: ['WP'],
  hoursPreset: 0,
  firstConsultMode: 'paid',
  consultFee: '50',
  urgencyFee: '150',
  showVideoMeetingFees: false,
  videoMeetingFee: '100',
  videoMeetingUrgencyFee: '300',
  showPhysicalMeetingFees: false,
  physicalMeetingFee: '200',
  physicalMeetingUrgencyFee: '500',
  sensitivityLevel: 5,
  deflectPatterns: [],
  emailTo: '',
  lowTierLabel: 'Pertanyaan umum, semakan pantas',
  medTierLabel: 'Pertanyaan khusus, semakan peguam perlu kemaskini',
  highTierLabel: 'Pertanyaan kompleks, semakan peguam perlu teliti dan kemaskini',
};

export function SetupWizard({ initial, userEmail }: {
  initial: Partial<FormData> | null;
  userEmail: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<FormData>({
    ...DEFAULTS,
    emailTo: userEmail,
    ...initial,
  });
  const [newPattern, setNewPattern] = useState('');
  const [newPracticeArea, setNewPracticeArea] = useState('');

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArea(area: string) {
    setData((prev) => ({
      ...prev,
      practiceAreas: prev.practiceAreas.includes(area)
        ? prev.practiceAreas.filter((a) => a !== area)
        : [...prev.practiceAreas, area],
    }));
  }

  function addPracticeArea() {
    const area = newPracticeArea.trim();
    if (area && !data.practiceAreas.includes(area)) {
      setData((prev) => ({
        ...prev,
        practiceAreas: [...prev.practiceAreas, area],
      }));
      setNewPracticeArea('');
    }
  }

  function addPattern() {
    const p = newPattern.trim();
    if (p && !data.deflectPatterns.includes(p)) {
      update('deflectPatterns', [...data.deflectPatterns, p]);
    }
    setNewPattern('');
  }

  function toggleBarCouncil(value: string) {
    setData((prev) => ({
      ...prev,
      barCouncil: prev.barCouncil.includes(value)
        ? prev.barCouncil.filter((c) => c !== value)
        : [...prev.barCouncil, value],
    }));
  }

  function toggleVideoMeetingFees() {
    setData((prev) => ({ ...prev, showVideoMeetingFees: !prev.showVideoMeetingFees }));
  }

  function togglePhysicalMeetingFees() {
    setData((prev) => ({ ...prev, showPhysicalMeetingFees: !prev.showPhysicalMeetingFees }));
  }

  function removePattern(p: string) {
    update('deflectPatterns', data.deflectPatterns.filter((x) => x !== p));
  }

  async function save(isComplete: boolean) {
    const body = { ...data, isComplete };
    const res = await fetch('/api/donna/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Gagal menyimpan');
  }

  function next() {
    if (step < 5) {
      startTransition(async () => {
        await save(false);
        setStep((s) => s + 1);
      });
    } else {
      startTransition(async () => {
        await save(true);
        router.push('/dashboard');
        router.refresh();
      });
    }
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                step > s.id ? 'bg-[#34d399] text-white' :
                step === s.id ? 'bg-lia text-white' :
                'bg-bg-3 text-text-muted border border-border'
              }`}>
                {step > s.id ? <Check size={12} /> : s.id}
              </div>
              <span className={`text-xs font-medium hidden sm:block transition-colors ${
                step >= s.id ? 'text-text-primary' : 'text-text-muted'
              }`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 transition-colors ${step > s.id ? 'bg-[#34d399]' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="glass-card rounded-2xl p-8 mb-6">
        {step === 1 && (
          <Step1 
            practiceAreas={data.practiceAreas} 
            toggle={toggleArea}
            newPracticeArea={newPracticeArea}
            setNewPracticeArea={setNewPracticeArea}
            addPracticeArea={addPracticeArea}
          />
        )}
        {step === 2 && (
          <Step2
            jurisdiction={data.jurisdiction}
            barCouncil={data.barCouncil}
            onJurisdiction={(v) => update('jurisdiction', v)}
            onBarCouncil={toggleBarCouncil}
          />
        )}
        {step === 3 && (
          <Step3
            hoursPreset={data.hoursPreset}
            firstConsultMode={data.firstConsultMode}
            consultFee={data.consultFee}
            urgencyFee={data.urgencyFee}
            showVideoMeetingFees={data.showVideoMeetingFees}
            videoMeetingFee={data.videoMeetingFee}
            videoMeetingUrgencyFee={data.videoMeetingUrgencyFee}
            showPhysicalMeetingFees={data.showPhysicalMeetingFees}
            physicalMeetingFee={data.physicalMeetingFee}
            physicalMeetingUrgencyFee={data.physicalMeetingUrgencyFee}
            onHoursPreset={(v) => update('hoursPreset', v)}
            onConsultMode={(v) => update('firstConsultMode', v)}
            onConsultFee={(v) => update('consultFee', v)}
            onUrgencyFee={(v) => update('urgencyFee', v)}
            onToggleVideoMeetingFees={toggleVideoMeetingFees}
            onTogglePhysicalMeetingFees={togglePhysicalMeetingFees}
            onVideoMeetingFee={(v) => update('videoMeetingFee', v)}
            onVideoMeetingUrgencyFee={(v) => update('videoMeetingUrgencyFee', v)}
            onPhysicalMeetingFee={(v) => update('physicalMeetingFee', v)}
            onPhysicalMeetingUrgencyFee={(v) => update('physicalMeetingUrgencyFee', v)}
          />
        )}
        {step === 4 && (
          <Step4
            level={data.sensitivityLevel}
            patterns={data.deflectPatterns}
            newPattern={newPattern}
            onLevel={(v) => update('sensitivityLevel', v)}
            onNewPattern={setNewPattern}
            onAdd={addPattern}
            onRemove={removePattern}
          />
        )}
        {step === 5 && (
          <Step5
            emailTo={data.emailTo}
            lowLabel={data.lowTierLabel}
            medLabel={data.medTierLabel}
            highLabel={data.highTierLabel}
            onEmail={(v) => update('emailTo', v)}
            onLow={(v) => update('lowTierLabel', v)}
            onMed={(v) => update('medTierLabel', v)}
            onHigh={(v) => update('highTierLabel', v)}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={back}
          disabled={step === 1 || isPending}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
          Kembali
        </button>
        <button
          onClick={next}
          disabled={isPending || (step === 1 && data.practiceAreas.length === 0)}
          className="flex items-center gap-2 bg-lia hover:bg-lia/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          {isPending ? (
            <><Loader2 size={15} className="animate-spin" /> Menyimpan...</>
          ) : step === 5 ? (
            <><Check size={15} /> Selesai</>
          ) : (
            <>Seterusnya <ChevronRight size={15} /></>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Step 1: Practice areas ──────────────────────────────

function Step1({ practiceAreas, toggle, newPracticeArea, setNewPracticeArea, addPracticeArea }: { 
  practiceAreas: string[]; 
  toggle: (a: string) => void;
  newPracticeArea: string;
  setNewPracticeArea: (v: string) => void;
  addPracticeArea: () => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-1">Bidang Amalan</h2>
      <p className="text-sm text-text-secondary mb-6">Pilih bidang amalan yang Donna akan terima</p>
      <div className="grid grid-cols-2 gap-2.5">
        {PRACTICE_AREAS.map((area) => {
          const selected = practiceAreas.includes(area);
          return (
            <button
              key={area}
              onClick={() => toggle(area)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                selected
                  ? 'border-lia-border bg-lia-dim text-text-primary'
                  : 'border-border bg-bg-3 text-text-secondary hover:border-border-hover hover:text-text-primary'
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                selected ? 'bg-lia border-lia' : 'border-border'
              }`}>
                {selected && <Check size={10} className="text-white" strokeWidth={3} />}
              </div>
              <span className="text-sm font-medium">{area}</span>
            </button>
          );
        })}
      </div>
      
      {/* Other practice area input */}
      <div className="mt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newPracticeArea}
            onChange={(e) => setNewPracticeArea(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPracticeArea(); } }}
            placeholder="Tambah kawasan amalan lain..."
            className="flex-1 bg-bg-3 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors"
          />
          <button
            onClick={addPracticeArea}
            disabled={!newPracticeArea.trim()}
            className="px-4 py-2.5 bg-lia hover:bg-lia/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl transition-colors"
          >
            Tambah
          </button>
        </div>
      </div>
      
      {/* Selected practice areas list */}
      {practiceAreas.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-text-primary mb-3">Bidang amalan dipilih:</h3>
          <div className="flex flex-wrap gap-2">
            {practiceAreas.map((area, index) => {
              const isCustom = !PRACTICE_AREAS.includes(area);
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                    isCustom 
                      ? 'bg-lia-dim border-lia-border text-lia-light' 
                      : 'bg-bg-3 border-border text-text-secondary'
                  }`}
                >
                  <span>{area}</span>
                  <button
                    onClick={() => toggle(area)}
                    className="text-text-muted hover:text-[#f87171] transition-colors"
                    title="Buang"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {practiceAreas.length === 0 && (
        <p className="text-xs text-[#fb923c] mt-3">Pilih sekurang-kurangnya satu kawasan amalan.</p>
      )}
    </div>
  );
}

// ── Step 2: Jurisdiction ────────────────────────────────

function Step2({ jurisdiction, barCouncil, onJurisdiction, onBarCouncil }: {
  jurisdiction: string; barCouncil: string[];
  onJurisdiction: (v: string) => void; onBarCouncil: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-1">Bidang Kuasa</h2>
      <p className="text-sm text-text-secondary mb-6">Negeri operasi dan badan peguam anda.</p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Negeri Operasi Utama</label>
          <select
            value={jurisdiction}
            onChange={(e) => onJurisdiction(e.target.value)}
            className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-lia transition-colors appearance-none"
          >
            <option value="">-- Pilih negeri --</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Badan Peguam</label>
          <div className="space-y-2">
            {BAR_COUNCILS.map((b) => {
              const selected = barCouncil.includes(b.value);
              return (
                <label key={b.value} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selected ? 'border-lia-border bg-lia-dim' : 'border-border hover:border-border-hover'
                }`}>
                  <input
                    type="checkbox"
                    value={b.value}
                    checked={selected}
                    onChange={() => onBarCouncil(b.value)}
                    className="accent-lia rounded"
                  />
                  <span className="text-sm text-text-primary">{b.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Availability & fees ─────────────────────────

function Step3({ hoursPreset, firstConsultMode, consultFee, urgencyFee, showVideoMeetingFees, videoMeetingFee, videoMeetingUrgencyFee, showPhysicalMeetingFees, physicalMeetingFee, physicalMeetingUrgencyFee, onHoursPreset, onConsultMode, onConsultFee, onUrgencyFee, onToggleVideoMeetingFees, onTogglePhysicalMeetingFees, onVideoMeetingFee, onVideoMeetingUrgencyFee, onPhysicalMeetingFee, onPhysicalMeetingUrgencyFee }: {
  hoursPreset: number; firstConsultMode: 'free' | 'paid'; consultFee: string; urgencyFee: string;
  showVideoMeetingFees: boolean; videoMeetingFee: string; videoMeetingUrgencyFee: string;
  showPhysicalMeetingFees: boolean; physicalMeetingFee: string; physicalMeetingUrgencyFee: string;
  onHoursPreset: (v: number) => void; onConsultMode: (v: 'free' | 'paid') => void;
  onConsultFee: (v: string) => void; onUrgencyFee: (v: string) => void;
  onToggleVideoMeetingFees: () => void; onTogglePhysicalMeetingFees: () => void;
  onVideoMeetingFee: (v: string) => void; onVideoMeetingUrgencyFee: (v: string) => void;
  onPhysicalMeetingFee: (v: string) => void; onPhysicalMeetingUrgencyFee: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-1">Waktu & Yuran</h2>
      <p className="text-sm text-text-secondary mb-6">Tetapkan waktu operasi dan struktur yuran anda.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Waktu Operasi</label>
          <div className="space-y-2">
            {HOURS_PRESETS.map((preset, i) => (
              <label key={i} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                hoursPreset === i ? 'border-lia-border bg-lia-dim' : 'border-border hover:border-border-hover'
              }`}>
                <input type="radio" name="hours" checked={hoursPreset === i} onChange={() => onHoursPreset(i)} className="accent-lia" />
                <span className="text-sm text-text-primary">{preset.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Mod Konsultasi Pertama</label>
          <div className="flex gap-3">
            {(['free', 'paid'] as const).map((mode) => (
              <label key={mode} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                firstConsultMode === mode ? 'border-lia-border bg-lia-dim text-text-primary' : 'border-border text-text-secondary hover:border-border-hover'
              }`}>
                <input type="radio" name="consultMode" checked={firstConsultMode === mode} onChange={() => onConsultMode(mode)} className="accent-lia" />
                <span className="text-sm font-medium">{mode === 'free' ? 'Percuma' : 'Berbayar'}</span>
              </label>
            ))}
          </div>
        </div>

        {firstConsultMode === 'paid' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Yuran Konsultasi (RM)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">RM</span>
                  <input
                    type="number" value={consultFee} onChange={(e) => onConsultFee(e.target.value)}
                    className="w-full bg-bg-3 border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:border-lia transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Yuran Kecemasan (RM)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">RM</span>
                  <input
                    type="number" value={urgencyFee} onChange={(e) => onUrgencyFee(e.target.value)}
                    className="w-full bg-bg-3 border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:border-lia transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Additional Fee Types */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <button
                  onClick={onToggleVideoMeetingFees}
                  className="text-left text-sm text-lia hover:text-lia/80 transition-colors underline"
                >
                  {showVideoMeetingFees ? 'Remove' : 'Add'} Yuran Video Meeting / Video Meeting Kecemasan
                </button>
                
                {showVideoMeetingFees && (
                  <div className="grid grid-cols-2 gap-4 ml-4">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Video Meeting (RM)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">RM</span>
                        <input
                          type="number" value={videoMeetingFee} onChange={(e) => onVideoMeetingFee(e.target.value)}
                          className="w-full bg-bg-3 border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:border-lia transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Video Meeting Kecemasan (RM)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">RM</span>
                        <input
                          type="number" value={videoMeetingUrgencyFee} onChange={(e) => onVideoMeetingUrgencyFee(e.target.value)}
                          className="w-full bg-bg-3 border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:border-lia transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={onTogglePhysicalMeetingFees}
                  className="text-left text-sm text-lia hover:text-lia/80 transition-colors underline"
                >
                  {showPhysicalMeetingFees ? 'Remove' : 'Add'} Yuran Meeting Fizikal / Meeting Fizikal Kecemasan
                </button>
                
                {showPhysicalMeetingFees && (
                  <div className="grid grid-cols-2 gap-4 ml-4">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Meeting Fizikal (RM)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">RM</span>
                        <input
                          type="number" value={physicalMeetingFee} onChange={(e) => onPhysicalMeetingFee(e.target.value)}
                          className="w-full bg-bg-3 border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:border-lia transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Meeting Fizikal Kecemasan (RM)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">RM</span>
                        <input
                          type="number" value={physicalMeetingUrgencyFee} onChange={(e) => onPhysicalMeetingUrgencyFee(e.target.value)}
                          className="w-full bg-bg-3 border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:border-lia transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step 4: Triage rules ────────────────────────────────

function Step4({ level, patterns, newPattern, onLevel, onNewPattern, onAdd, onRemove }: {
  level: number; patterns: string[]; newPattern: string;
  onLevel: (v: number) => void; onNewPattern: (v: string) => void;
  onAdd: () => void; onRemove: (p: string) => void;
}) {
  const sensitivity = level <= 3 ? 'Longgar' : level <= 6 ? 'Sederhana' : 'Ketat';
  const sensitivityColor = level <= 3 ? 'text-[#34d399]' : level <= 6 ? 'text-gold' : 'text-[#f87171]';

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-1">Peraturan Triage</h2>
      <p className="text-sm text-text-secondary mb-6">Kawal bagaimana Donna menapis pertanyaan masuk.</p>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-text-primary">Tahap Sensitiviti Triage</label>
            <span className={`text-sm font-semibold ${sensitivityColor}`}>{sensitivity} ({level}/10)</span>
          </div>
          <input
            type="range" min={1} max={10} value={level} onChange={(e) => onLevel(Number(e.target.value))}
            className="w-full accent-lia h-2 rounded-full bg-bg-3"
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-text-muted">Terima lebih banyak</span>
            <span className="text-[11px] text-text-muted">Tapis lebih ketat</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Corak Auto-Deflect</label>
          <p className="text-xs text-text-muted mb-3">Kata kunci yang menyebabkan Donna menolak pertanyaan secara automatik (cth: "insurans", "syarikat besar").</p>

          <div className="flex gap-2 mb-3">
            <input
              value={newPattern}
              onChange={(e) => onNewPattern(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
              placeholder="Tambah corak..."
              className="flex-1 bg-bg-3 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors"
            />
            <button
              onClick={onAdd}
              className="w-10 h-10 rounded-xl bg-lia flex items-center justify-center hover:bg-lia/90 transition-colors"
            >
              <Plus size={16} className="text-white" />
            </button>
          </div>

          {patterns.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {patterns.map((p) => (
                <span key={p} className="flex items-center gap-1.5 bg-bg-3 border border-border px-3 py-1 rounded-full text-sm text-text-secondary">
                  {p}
                  <button onClick={() => onRemove(p)} className="text-text-muted hover:text-[#f87171] transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 5: Email & conversion tiers ───────────────────

function Step5({ emailTo, lowLabel, medLabel, highLabel, onEmail, onLow, onMed, onHigh }: {
  emailTo: string; lowLabel: string; medLabel: string; highLabel: string;
  onEmail: (v: string) => void; onLow: (v: string) => void;
  onMed: (v: string) => void; onHigh: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-1">E-mel & Tier Perkhidmatan</h2>
      <p className="text-sm text-text-secondary mb-6">Konfigurasi penerima ringkasan dan label tier.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">E-mel Penerima Ringkasan</label>
          <input
            type="email" value={emailTo} onChange={(e) => onEmail(e.target.value)}
            placeholder="nama@firma.com"
            className="w-full bg-bg-3 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lia transition-colors"
          />
          <p className="text-xs text-text-muted mt-1.5">Donna akan hantar ringkasan pertanyaan ke e-mel ini.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">Label Tier Perkhidmatan</label>
          <div className="space-y-3">
            <TierInput label="Tier RENDAH" color="text-[#34d399]" value={lowLabel} onChange={onLow} hint="Pertanyaan umum, semakan pantas" />
            <TierInput label="Tier SEDERHANA" color="text-gold" value={medLabel} onChange={onMed} hint="Pertanyaan khusus, semakan peguam diperlukan" />
            <TierInput label="Tier TINGGI" color="text-[#fb923c]" value={highLabel} onChange={onHigh} hint="Pertanyaan kompleks, semakan teliti peguam diperlukan" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TierInput({ label, color, value, onChange, hint }: {
  label: string; color: string; value: string; onChange: (v: string) => void; hint: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-bg-3">
      <div className="flex-1">
        <p className={`text-xs font-bold mb-0.5 ${color}`}>{label}</p>
        <p className="text-[11px] text-text-muted">{hint}</p>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-44 bg-bg-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-lia transition-colors text-right"
      />
    </div>
  );
}
