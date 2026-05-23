'use client';

import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// CyclingHeadline — types + erases through a list of words
// Used inside the hero h1: "Automate the [cycling word]."
//
// Erases down to ONE letter and swaps directly to the next phrase's first
// letter — never reaches empty. Eliminates the broken-headline flash that
// previously read "Automate the |. Scale the important." for ~350ms.
// ─────────────────────────────────────────────────────────────────────────

const PHRASES = ['boring', 'manual', 'repetitive', 'expensive'] as const;
const TYPE_SPEED = 80;
const ERASE_SPEED = 40;
const PAUSE_AT_FULL = 1800;

export function CyclingHeadline() {
  // Initialise to the first phrase already typed — avoids an empty render on hydration.
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [text, setText] = useState<string>(PHRASES[0]);
  const [phase, setPhase] = useState<'typing' | 'pausing-full' | 'erasing'>('pausing-full');

  useEffect(() => {
    const phrase = PHRASES[phraseIdx];

    if (phase === 'typing') {
      if (text.length < phrase.length) {
        const t = setTimeout(() => setText(phrase.slice(0, text.length + 1)), TYPE_SPEED + Math.random() * 30);
        return () => clearTimeout(t);
      }
      setPhase('pausing-full');
      return;
    }

    if (phase === 'pausing-full') {
      const t = setTimeout(() => setPhase('erasing'), PAUSE_AT_FULL);
      return () => clearTimeout(t);
    }

    if (phase === 'erasing') {
      // Erase down to ONE letter — never empty. At length 1, swap straight to
      // the first letter of the next phrase and resume typing.
      if (text.length > 1) {
        const t = setTimeout(() => setText(phrase.slice(0, text.length - 1)), ERASE_SPEED);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        const nextIdx = (phraseIdx + 1) % PHRASES.length;
        setPhraseIdx(nextIdx);
        setText(PHRASES[nextIdx][0]); // first letter of new phrase — single-char swap, no empty state
        setPhase('typing');
      }, ERASE_SPEED);
      return () => clearTimeout(t);
    }
  }, [text, phase, phraseIdx]);

  // Wrap in a fixed-width inline slot so the headline doesn't re-flow as the
  // phrase length changes. The slot is sized to the longest phrase plus the
  // caret — keeps the rest of the H1 stable through the whole cycle.
  // Note: styles for .ch-slot, .ch-caret + ch-blink keyframes live in globals.css.
  // Keeping them OUT of the JSX prevents a <style> tag landing inside the
  // parent <h1> (which made screen readers + crawlers read the CSS as text).
  return (
    <span className="ch-slot">
      <span className="text-grad">{text}</span>
      <span className="ch-caret" aria-hidden>|</span>
    </span>
  );
}
