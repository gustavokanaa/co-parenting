import { useState, useEffect, type ReactNode } from 'react'

function useTime() {
  const fmt = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function IPhoneFrame({ children }: { children: ReactNode }) {
  const time = useTime()
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
            }}
          >
            {children}
          </div>

          {/* Status bar — overlaid */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 54,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              padding: '0 28px 10px',
              pointerEvents: 'none',
              zIndex: 50,
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.3px',
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              }}
            >
              {time}
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {/* Signal bars */}
              <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
                <rect x="0" y="9" width="3" height="3" rx="0.5" />
                <rect x="4.7" y="6" width="3" height="6" rx="0.5" />
                <rect x="9.4" y="3" width="3" height="9" rx="0.5" />
                <rect x="14.1" y="0" width="3" height="12" rx="0.5" />
              </svg>
              {/* WiFi */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <circle cx="8" cy="11" r="1.5" fill="white" />
                <path d="M4.5 7.5C5.5 6.4 6.7 5.8 8 5.8s2.5.6 3.5 1.7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M1.5 4.5C3.2 2.8 5.5 1.8 8 1.8s4.8 1 6.5 2.7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {/* Battery */}
              <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
                <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="white" strokeOpacity="0.4" />
                <rect x="2" y="2" width="17" height="8" rx="2" fill="white" />
                <path d="M23 3.8v4.4a2.2 2.2 0 0 0 0-4.4z" fill="white" fillOpacity="0.35" />
              </svg>
            </div>
          </div>

          {/* Dynamic Island */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 120,
              height: 34,
              background: '#000',
              borderRadius: 20,
              zIndex: 60,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  )
}
