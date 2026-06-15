export function NexovaLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nx-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="nx-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      {/* Hexagon */}
      <path
        d="M16 2.5L28.1 9.25V22.75L16 29.5L3.9 22.75V9.25L16 2.5Z"
        fill="url(#nx-grad)"
      />
      {/* N letterform */}
      <path
        d="M10 22V10L22 22V10"
        stroke="url(#nx-glow)"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Diagonal bar of N */}
      <line x1="10" y1="10" x2="22" y2="22" stroke="url(#nx-glow)" strokeWidth="2.75" strokeLinecap="round" />
    </svg>
  )
}
