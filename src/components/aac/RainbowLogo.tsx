// VOXAFIA brand mark: the post-rain rainbow with "VOXAFIA" in small letters below.
export const RAINBOW_COLORS = ['#E53935', '#F28C1E', '#F5C518', '#4CAF50', '#17A69E', '#2F80D1', '#7B52C1'];

export function RainbowArcs({ className, animate = false }: { className?: string; animate?: boolean }) {
  // Semicircles centred at (100,100); outer radius 92, band width 11.
  return (
    <svg viewBox="0 0 200 104" className={className} aria-hidden="true">
      {RAINBOW_COLORS.map((c, i) => {
        const r = 86 - i * 11;
        return (
          <path
            key={c}
            d={`M ${100 - r} 100 A ${r} ${r} 0 0 1 ${100 + r} 100`}
            fill="none"
            stroke={c}
            strokeWidth={11}
            strokeLinecap="round"
            pathLength={100}
            className={animate ? 'rb-paint' : undefined}
            style={animate ? { animationDelay: `${i * 0.12}s` } : undefined}
          />
        );
      })}
    </svg>
  );
}

export default function RainbowLogo({ className = '', showName = true }: { className?: string; showName?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center leading-none ${className}`}>
      <RainbowArcs className="w-full h-auto" />
      {showName && (
        <span className="font-black tracking-[0.14em] text-foreground" style={{ fontSize: '0.32em' }}>VOXAFIA</span>
      )}
    </div>
  );
}
