/**
 * The static layer under everything: deep navy gradient, a faint perspective
 * grid and a cyan glow. It's the whole background when WebGL is off, and the
 * first paint while the 3D world streams in.
 */
export function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px 700px at 72% 18%, rgb(30 80 130 / 0.22), transparent 60%),' +
            'radial-gradient(900px 600px at 12% 85%, rgb(40 70 160 / 0.14), transparent 60%),' +
            'linear-gradient(180deg, #03060c 0%, #050b16 45%, #040810 100%)',
        }}
      />
      <div
        className="absolute inset-x-[-50%] bottom-[-10%] h-[60%] opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(80 150 210 / 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgb(80 150 210 / 0.12) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          transform: 'perspective(600px) rotateX(62deg)',
          transformOrigin: 'center top',
          maskImage: 'linear-gradient(to top, black, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to top, black, transparent 85%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}
