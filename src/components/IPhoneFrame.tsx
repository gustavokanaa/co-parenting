import { useState, useEffect, type ReactNode } from 'react'

export default function IPhoneFrame({ children }: { children: ReactNode }) {
  const [desktop, setDesktop] = useState(() => window.innerWidth >= 768)

  useEffect(() => {
    const fn = () => setDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  if (!desktop) return <>{children}</>

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '40px 20px',
      }}
    >
      {/* Device casing */}
      <div
        style={{
          position: 'relative',
          width: 417,
          height: 876,
          borderRadius: 67,
          background: '#1a1a1a',
          boxShadow:
            '0 50px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.18)',
          flexShrink: 0,
        }}
      >
        {/* Volume up buttons */}
        <div
          style={{
            position: 'absolute',
            left: -3,
            top: 158,
            width: 3,
            height: 34,
            background: '#2e2e2e',
            borderRadius: '2px 0 0 2px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -3,
            top: 208,
            width: 3,
            height: 34,
            background: '#2e2e2e',
            borderRadius: '2px 0 0 2px',
          }}
        />
        {/* Mute toggle */}
        <div
          style={{
            position: 'absolute',
            left: -3,
            top: 120,
            width: 3,
            height: 28,
            background: '#2e2e2e',
            borderRadius: '2px 0 0 2px',
          }}
        />
        {/* Power button */}
        <div
          style={{
            position: 'absolute',
            right: -3,
            top: 196,
            width: 3,
            height: 72,
            background: '#2e2e2e',
            borderRadius: '0 2px 2px 0',
          }}
        />

        {/* Screen bezel */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            bottom: 12,
            borderRadius: 55,
            overflow: 'hidden',
            background: '#000',
          }}
        >
          {/* App content — scrollable */}
          <div
            style={{
              width: '100%',
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              position: 'relative',
              scrollbarWidth: 'none',
              transform: 'translateZ(0)',
            }}
          >
            {children}
          </div>

        </div>
      </div>
    </div>
  )
}
