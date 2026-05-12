'use client';

import { useState } from 'react';

const WORD_LIMIT = 50;

export default function NasihatPeguam({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  const needsTruncation = words.length > WORD_LIMIT;
  const [expanded, setExpanded] = useState(false);

  const displayed =
    needsTruncation && !expanded
      ? words.slice(0, WORD_LIMIT).join(' ') + '…'
      : text;

  return (
    <div className="rounded-xl border border-purple-500/25 bg-purple-900/10 p-5 mb-4">
      <p className="text-[10px] text-purple-400 uppercase tracking-widest font-semibold mb-3">
        Nasihat Peguam
      </p>
      <p className="text-sm text-cream/85 whitespace-pre-wrap leading-relaxed">
        {displayed}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition font-medium"
        >
          {expanded ? 'Minimumkan ▲' : 'Baca lebih ▼'}
        </button>
      )}
    </div>
  );
}
