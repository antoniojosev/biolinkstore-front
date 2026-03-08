import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Bio Link Store — Tu tienda de Instagram, en un solo link'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0f14 0%, #0d2b3e 50%, #1a5c52 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <svg viewBox="0 0 64 64" width="72" height="72" fill="none">
            <rect width="44" height="38" x="10" y="20" fill="url(#a)" rx="8"/>
            <ellipse cx="18" cy="18" fill="#1a3a4a" rx="8" ry="5"/>
            <ellipse cx="32" cy="18" fill="#1f5c5a" rx="8" ry="5"/>
            <ellipse cx="46" cy="18" fill="#2a7d6e" rx="8" ry="5"/>
            <path stroke="#0d2b3e" strokeLinecap="round" strokeWidth="3" d="M24 16v-4a8 8 0 0 1 16 0v4"/>
            <g strokeWidth="2.5">
              <path stroke="#5bbf9a" d="M25 36a6 6 0 1 1 0 8 6 6 0 0 1 0-8z"/>
              <path stroke="#7de8b8" d="M33 36a6 6 0 1 1 0 8 6 6 0 0 1 0-8z"/>
            </g>
            <defs>
              <linearGradient id="a" x1="10" x2="54" y1="20" y2="58" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0d2b3e"/>
                <stop offset="1" stopColor="#1a5c52"/>
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontSize: 48, fontWeight: 700, color: '#ffffff', letterSpacing: '-1px' }}>
            Bio Link Store
          </span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 28, color: 'rgba(255,255,255,0.7)', margin: 0, textAlign: 'center', maxWidth: 700 }}>
          Tu tienda de Instagram, en un solo link
        </p>

        {/* Sub */}
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', margin: '16px 0 0', textAlign: 'center' }}>
          Catálogo digital · Checkout por WhatsApp · Sin comisiones
        </p>

        {/* Bottom pill */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(51,179,128,0.15)',
          border: '1px solid rgba(51,179,128,0.3)',
          borderRadius: 999,
          padding: '8px 20px',
        }}>
          <span style={{ fontSize: 15, color: '#33b380', fontWeight: 600 }}>biolinkstore.com</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
