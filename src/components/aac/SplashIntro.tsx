import { useEffect, useState } from 'react';
import { RAINBOW_COLORS } from './RainbowLogo';

// Startup story: rain → sky clears → full-screen rainbow paints across the
// whole screen with sparkles → it shrinks into the VOXAFIA rainbow logo →
// VOXAFIA pops in letter by letter → credentials + tagline → app.
const NAME = 'VOXAFIA';
const TOTAL_MS = 7600;

export default function SplashIntro({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), TOTAL_MS - 500);
    const t2 = setTimeout(onDone, TOTAL_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  const drops = Array.from({ length: 50 }, (_, i) => i);
  const sparkles = Array.from({ length: 14 }, (_, i) => i);

  return (
    <div className={`splash-root ${leaving ? 'splash-leave' : ''}`} role="presentation">
      <div className="splash-sky" />

      <div className="splash-clouds">
        <div className="splash-cloud" style={{ left: '8%', top: '10%' }} />
        <div className="splash-cloud" style={{ left: '42%', top: '4%', transform: 'scale(1.3)' }} />
        <div className="splash-cloud" style={{ left: '72%', top: '12%' }} />
      </div>
      <div className="splash-rain">
        {drops.map(i => (
          <span key={i} className="splash-drop" style={{ left: `${(i * 97) % 100}%`, animationDelay: `${(i % 10) * 0.12}s`, animationDuration: `${0.7 + (i % 5) * 0.1}s` }} />
        ))}
      </div>

      {/* Full-screen rainbow — covers every screen size */}
      <svg className="splash-bigbow" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {RAINBOW_COLORS.map((c, i) => {
          const r = 900 - i * 125;
          return (
            <path key={c} d={`M ${500 - r} 1000 A ${r} ${r} 0 0 1 ${500 + r} 1000`} fill="none" stroke={c} strokeWidth={125} strokeLinecap="round"
              pathLength={100} className="rb-paint" style={{ animationDelay: `${2 + i * 0.12}s` }} />
          );
        })}
      </svg>
      <div className="splash-sparkles">
        {sparkles.map(i => (
          <span key={i} className="splash-sparkle" style={{ left: `${8 + ((i * 53) % 84)}%`, top: `${10 + ((i * 37) % 60)}%`, animationDelay: `${2.6 + (i % 6) * 0.15}s` }} />
        ))}
      </div>

      <div className="splash-brand">
        <svg viewBox="0 0 200 104" className="splash-logo" aria-label="VOXAFIA rainbow logo">
          {RAINBOW_COLORS.map((c, i) => {
            const r = 86 - i * 11;
            return <path key={c} d={`M ${100 - r} 100 A ${r} ${r} 0 0 1 ${100 + r} 100`} fill="none" stroke={c} strokeWidth={11} strokeLinecap="round" />;
          })}
        </svg>
        <h1 className="splash-name" aria-label={NAME}>
          {NAME.split('').map((ch, i) => (
            <span key={i} style={{ animationDelay: `${5 + i * 0.12}s` }}>{ch}</span>
          ))}
        </h1>
        <p className="splash-cred">Research &amp; evidence-based app by a Speech Language Therapist</p>
        <p className="splash-tagline">Every Voice Deserves to Be Heard</p>
      </div>

      <button onClick={onDone} className="splash-skip">Skip ›</button>
    </div>
  );
}
