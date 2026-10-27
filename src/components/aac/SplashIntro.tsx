import { useEffect, useState } from 'react';
import spectraLogo from '@/assets/spectra-logo.png';

// Startup story: rain from grey clouds → sky clears → rainbow with sparkles →
// rainbow spins into the Spectra Speech logo → VOXAFIA pops in letter by
// letter with the tagline → app appears. Skippable at any moment.
const NAME = 'VOXAFIA';
const TOTAL_MS = 6800;

export default function SplashIntro({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), TOTAL_MS - 500);
    const t2 = setTimeout(onDone, TOTAL_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  const drops = Array.from({ length: 40 }, (_, i) => i);
  const sparkles = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div className={`splash-root ${leaving ? 'splash-leave' : ''}`} role="presentation">
      <div className="splash-sky" />

      {/* Clouds + rain */}
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

      {/* Rainbow */}
      <div className="splash-rainbow">
        {[0, 1, 2, 3, 4, 5, 6].map(i => <span key={i} className={`splash-band splash-band-${i}`} style={{ top: i * 14, left: i * 14, right: i * 14, height: `calc(200% - ${i * 28}px)` }} />)}
      </div>
      <div className="splash-sparkles">
        {sparkles.map(i => (
          <span key={i} className="splash-sparkle" style={{ left: `${10 + ((i * 53) % 80)}%`, top: `${15 + ((i * 37) % 50)}%`, animationDelay: `${2 + (i % 6) * 0.15}s` }}>✦</span>
        ))}
      </div>

      {/* Logo + name */}
      <div className="splash-brand">
        <img src={spectraLogo} alt="Spectra Speech" className="splash-logo" />
        <h1 className="splash-name" aria-label={NAME}>
          {NAME.split('').map((ch, i) => (
            <span key={i} style={{ animationDelay: `${4.6 + i * 0.12}s` }}>{ch}</span>
          ))}
        </h1>
        <p className="splash-tagline">Every Voice Deserves to Be Heard</p>
      </div>

      <button onClick={onDone} className="splash-skip">Skip ›</button>
    </div>
  );
}
