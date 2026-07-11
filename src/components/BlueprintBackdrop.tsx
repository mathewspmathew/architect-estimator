// Purely decorative background layer: a faint blueprint-style building
// elevation with dimension lines, plus corner registration marks.
// Fixed position, pointer-events disabled, z-indexed behind all content.
// Does not affect any functionality or layout of interactive elements.
export function BlueprintBackdrop() {
  return (
    <>
      <div className="blueprint-frame" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <svg
          className="absolute -right-24 -bottom-24 h-[520px] w-[520px] opacity-[0.06] md:h-[640px] md:w-[640px]"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simple house elevation line-drawing */}
          <path
            d="M60 220 L200 110 L340 220"
            stroke="#2563eb"
            strokeWidth="2"
          />
          <rect x="80" y="220" width="240" height="140" stroke="#2563eb" strokeWidth="2" />
          <rect x="110" y="260" width="50" height="70" stroke="#2563eb" strokeWidth="1.5" />
          <rect x="240" y="260" width="50" height="50" stroke="#2563eb" strokeWidth="1.5" />
          <line x1="110" y1="295" x2="160" y2="295" stroke="#2563eb" strokeWidth="1.5" />
          <line x1="265" y1="260" x2="265" y2="310" stroke="#2563eb" strokeWidth="1.5" />
          {/* Dimension lines */}
          <line x1="80" y1="380" x2="320" y2="380" stroke="#2563eb" strokeWidth="1" />
          <line x1="80" y1="374" x2="80" y2="386" stroke="#2563eb" strokeWidth="1" />
          <line x1="320" y1="374" x2="320" y2="386" stroke="#2563eb" strokeWidth="1" />
          <line x1="40" y1="220" x2="40" y2="360" stroke="#2563eb" strokeWidth="1" />
          <line x1="34" y1="220" x2="46" y2="220" stroke="#2563eb" strokeWidth="1" />
          <line x1="34" y1="360" x2="46" y2="360" stroke="#2563eb" strokeWidth="1" />
        </svg>

        <svg
          className="absolute -left-16 -top-16 h-72 w-72 opacity-[0.05] md:h-96 md:w-96"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Compass / drafting circle motif */}
          <circle cx="100" cy="100" r="70" stroke="#2563eb" strokeWidth="1" />
          <circle cx="100" cy="100" r="3" fill="#2563eb" />
          <line x1="100" y1="20" x2="100" y2="180" stroke="#2563eb" strokeWidth="1" />
          <line x1="20" y1="100" x2="180" y2="100" stroke="#2563eb" strokeWidth="1" />
        </svg>
      </div>
    </>
  );
}
