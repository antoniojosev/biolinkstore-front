export const BS_RATE = 36.5

export interface StoreState {
  name: string
  slug: string
  vertical: string | null
  instagram: string
  template: string | null
  payments: string[]
  referral: string | null
}

export const SCRAPED = {
  handle: "@rosa.atelier",
  name: "Rosa Atelier",
  bio: "Moda femenina hecha en Caracas 🌹\nEnvíos a toda Venezuela",
  followers: "8.4K",
  posts: 247,
  avatar: "linear-gradient(135deg, #C63E2A, #7A1F10)",
  photos: [
    "linear-gradient(135deg, #C63E2A, #7A1F10)",
    "linear-gradient(135deg, #E8C07A, #B8860B)",
    "linear-gradient(135deg, #8A6B4C, #5A3D1D)",
    "linear-gradient(135deg, #2A3B5C, #0A1F4D)",
    "linear-gradient(135deg, #D4AF37, #8B7500)",
    "linear-gradient(135deg, #DC4A3D, #F97066)",
  ],
}

export const VERTICALS = [
  { id: "moda", emoji: "👗", label: "Moda y accesorios", desc: "Ropa, calzado, joyas" },
  { id: "restaurante", emoji: "🍕", label: "Restaurante o comida", desc: "Delivery, postres, repostería" },
  { id: "belleza", emoji: "💄", label: "Belleza y bienestar", desc: "Cosméticos, spa, peluquería" },
  { id: "inmobiliaria", emoji: "🏠", label: "Inmobiliaria", desc: "Venta y alquiler" },
  { id: "servicios", emoji: "✨", label: "Servicios profesionales", desc: "Diseño, asesorías, clases" },
  { id: "otro", emoji: "🎯", label: "Otra cosa", desc: "No te preocupes, también funciona" },
]

export const TEMPLATES = [
  { id: "minimal", label: "Minimal", desc: "Limpio y elegante", bg: "#FFF", accent: "#0F172A" },
  { id: "warm", label: "Cálido", desc: "Tonos tierra, artesanal", bg: "#FAF7F2", accent: "#C63E2A" },
  { id: "bold", label: "Bold", desc: "Colores fuertes", bg: "#FEF3C7", accent: "#DC2626" },
  { id: "dark", label: "Dark", desc: "Premium y moderno", bg: "#0F172A", accent: "#F97066" },
  { id: "pastel", label: "Pastel", desc: "Suave y femenino", bg: "#FCE7F3", accent: "#9D174D" },
  { id: "tech", label: "Tech", desc: "Futurista, electric", bg: "#0F172A", accent: "#3B82F6" },
]

export const PAYMENT_METHODS = [
  { id: "pm", emoji: "📱", label: "Pago Móvil", desc: "Banesco, Mercantil..." },
  { id: "usd", emoji: "💵", label: "Efectivo USD", desc: "Al momento de la entrega" },
  { id: "zelle", emoji: "💳", label: "Zelle", desc: "Transferencia internacional" },
  { id: "binance", emoji: "₿", label: "Binance Pay", desc: "USDT, BTC" },
  { id: "transfer", emoji: "🏦", label: "Transferencia", desc: "Bs. cuenta nacional" },
]

export const REFERRAL_SOURCES = [
  { id: "instagram", emoji: "📸", label: "Instagram" },
  { id: "tiktok", emoji: "🎵", label: "TikTok" },
  { id: "amigo", emoji: "👋", label: "Un amigo me lo recomendó" },
  { id: "google", emoji: "🔍", label: "Buscando en Google" },
  { id: "youtube", emoji: "▶️", label: "YouTube" },
  { id: "otro", emoji: "🌐", label: "Otro lugar" },
]

export const PREVIEW_PRODUCTS = [
  { name: "Vestido Camelia", price: 89, photo: "linear-gradient(135deg, #C63E2A, #7A1F10)" },
  { name: "Aretes Luna", price: 42, photo: "linear-gradient(135deg, #E8C07A, #B8860B)" },
  { name: "Bolso Cuero", price: 56, photo: "linear-gradient(135deg, #8A6B4C, #5A3D1D)" },
  { name: "Blusa Olivia", price: 38, photo: "linear-gradient(135deg, #2A3B5C, #0A1F4D)" },
]

export interface AiProduct {
  id: number
  name: string
  price: number
  photo: string
  desc: string
  confidence: number
  approved: boolean
  edited: boolean
}

export const DEFAULT_AI_PRODUCTS: AiProduct[] = [
  { id: 1, name: "Vestido Camelia", price: 89, photo: "linear-gradient(135deg, #C63E2A, #7A1F10)", desc: "Vestido midi en algodón premium, corte fluido. Perfecto para eventos y oficina.", confidence: 0.94, approved: false, edited: false },
  { id: 2, name: "Aretes Luna", price: 42, photo: "linear-gradient(135deg, #E8C07A, #B8860B)", desc: "Aretes en bronce dorado con acabado satinado. Hipoalergénicos, hechos a mano.", confidence: 0.88, approved: false, edited: false },
  { id: 3, name: "Bolso de Cuero", price: 56, photo: "linear-gradient(135deg, #8A6B4C, #5A3D1D)", desc: 'Bolso bandolera de cuero genuino, capacidad para laptop 13".', confidence: 0.92, approved: false, edited: false },
  { id: 4, name: "Blusa Olivia", price: 38, photo: "linear-gradient(135deg, #2A3B5C, #0A1F4D)", desc: "Blusa elegante en seda mate, cuello en V. Ideal para look casual-formal.", confidence: 0.81, approved: false, edited: false },
  { id: 5, name: "Collar Sol", price: 32, photo: "linear-gradient(135deg, #D4AF37, #8B7500)", desc: "Collar minimalista bañado en oro 18k. Cadena de 45cm con extensión.", confidence: 0.91, approved: false, edited: false },
  { id: 6, name: "Falda Plisada", price: 64, photo: "linear-gradient(135deg, #DC4A3D, #F97066)", desc: "Falda midi plisada en gabardina. Cintura alta con cinturón incluido.", confidence: 0.86, approved: false, edited: false },
  { id: 7, name: "Sandalias Caribe", price: 48, photo: "linear-gradient(135deg, #C4B5A0, #8B7355)", desc: "Sandalias planas con tiras trenzadas. Suela acolchada para todo el día.", confidence: 0.79, approved: false, edited: false },
  { id: 8, name: "Pulsera Trenzada", price: 22, photo: "linear-gradient(135deg, #A8DADC, #457B9D)", desc: "Pulsera trenzada en hilos de algodón con detalles dorados. Ajustable.", confidence: 0.95, approved: false, edited: false },
  { id: 9, name: "Sombrero Playa", price: 35, photo: "linear-gradient(135deg, #F5E6CC, #C9A875)", desc: "Sombrero de paja natural con cinta. Protección UV, plegable.", confidence: 0.83, approved: false, edited: false },
  { id: 10, name: "Pareo Floral", price: 28, photo: "linear-gradient(135deg, #FFB4A2, #E5989B)", desc: "Pareo en viscosa con estampado floral. Mide 180x100cm.", confidence: 0.74, approved: false, edited: false },
  { id: 11, name: "Anillo Perla", price: 52, photo: "linear-gradient(135deg, #FAF3F0, #D5C5BB)", desc: "Anillo en plata 925 con perla cultivada de 8mm. Tallas 5-8.", confidence: 0.89, approved: false, edited: false },
  { id: 12, name: "Top Crochet", price: 45, photo: "linear-gradient(135deg, #E29578, #FFDDD2)", desc: "Top tejido a mano en algodón. Diseño exclusivo de la temporada.", confidence: 0.87, approved: false, edited: false },
]

export const SCRAPED_PRODUCTS = [
  { name: "Vestido Camelia", price: 89, photo: "linear-gradient(135deg, #C63E2A, #7A1F10)" },
  { name: "Aretes Luna", price: 42, photo: "linear-gradient(135deg, #E8C07A, #B8860B)" },
  { name: "Bolso Cuero", price: 56, photo: "linear-gradient(135deg, #8A6B4C, #5A3D1D)" },
  { name: "Blusa Olivia", price: 38, photo: "linear-gradient(135deg, #2A3B5C, #0A1F4D)" },
  { name: "Collar Sol", price: 32, photo: "linear-gradient(135deg, #D4AF37, #8B7500)" },
  { name: "Falda Plisada", price: 64, photo: "linear-gradient(135deg, #DC4A3D, #F97066)" },
  { name: "Sandalias Caribe", price: 48, photo: "linear-gradient(135deg, #C4B5A0, #8B7355)" },
  { name: "Pulsera Trenzada", price: 22, photo: "linear-gradient(135deg, #A8DADC, #457B9D)" },
  { name: "Sombrero Playa", price: 35, photo: "linear-gradient(135deg, #F5E6CC, #C9A875)" },
  { name: "Pareo Floral", price: 28, photo: "linear-gradient(135deg, #FFB4A2, #E5989B)" },
  { name: "Anillo Perla", price: 52, photo: "linear-gradient(135deg, #FAF3F0, #D5C5BB)" },
  { name: "Top Crochet", price: 45, photo: "linear-gradient(135deg, #E29578, #FFDDD2)" },
]

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const AUTH_STYLES = `
.ad-root { --bg: #FFFFFF; --bg-2: #F8FAFC; --bg-3: #F1F5F9; --ink: #0F172A; --ink-2: #334155; --ink-3: #64748B; --ink-4: #94A3B8; --line: #E2E8F0; --line-2: #CBD5E1; --brand: #1E3A8A; --brand-2: #1E40AF; --brand-light: #3B5BDB; --brand-dark: #172554; --accent: #DC4A3D; --accent-2: #F97066; --success: #10B981; --whatsapp: #25D366; font-family: var(--font-sans); color: var(--ink); background: #fff; }
.ad-root .mono { font-family: var(--font-mono); }
.ad-root .serif-it { font-family: var(--font-serif); font-style: italic; font-weight: 400; }
.ad-root a { color: inherit; text-decoration: none; }
.ad-root input:focus, .ad-root textarea:focus { outline: none; }
.ad-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; font-weight: 600; letter-spacing: -0.01em; border-radius: 12px; transition: all .18s ease; white-space: nowrap; padding: 14px 22px; font-size: 15px; border: none; cursor: pointer; }
.ad-btn-primary { background: var(--brand); color: #fff; box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 8px 18px -6px rgba(30,58,138,0.45); }
.ad-btn-primary:hover { background: var(--brand-dark); transform: translateY(-1px); }
.ad-btn-primary:disabled { background: #CBD5E1; cursor: not-allowed; transform: none; box-shadow: none; }
.ad-btn-ghost { background: #fff; color: var(--ink); border: 1px solid var(--line-2); }
.ad-btn-ghost:hover { background: var(--bg-2); border-color: var(--brand); }
.ad-input { width: 100%; padding: 14px 16px; border: 1.5px solid var(--line); border-radius: 12px; background: #fff; font-size: 15px; transition: all .15s ease; color: var(--ink); }
.ad-input:focus { border-color: var(--brand); box-shadow: 0 0 0 4px rgba(30,58,138,0.08); }
.ad-input::placeholder { color: var(--ink-4); }
.ad-label { display: block; font-size: 13px; font-weight: 600; color: var(--ink-2); margin-bottom: 8px; }
.ad-opt { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1.5px solid var(--line); background: #fff; border-radius: 12px; transition: all .15s ease; cursor: pointer; text-align: left; width: 100%; }
.ad-opt:hover { border-color: var(--line-2); background: var(--bg-2); }
.ad-opt.active { border-color: var(--brand); background: rgba(30,58,138,0.04); }
.ad-opt-radio { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--line-2); flex-shrink: 0; transition: all .15s ease; position: relative; }
.ad-opt.active .ad-opt-radio { border-color: var(--brand); }
.ad-opt.active .ad-opt-radio::after { content: ''; position: absolute; inset: 4px; border-radius: 50%; background: var(--brand); }
.ad-step { animation: adStepIn .45s cubic-bezier(.2,.7,.3,1); }
@keyframes adStepIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes adPulseScale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
@keyframes adRingPulse { 0% { box-shadow: 0 0 0 0 rgba(30,58,138,0.4); } 100% { box-shadow: 0 0 0 28px rgba(30,58,138,0); } }
@keyframes adBurst { 0% { transform: translate(-50%, -50%) scale(0); opacity: 1; } 60% { opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; } }
.ad-confetti { position: absolute; top: 50%; left: 50%; width: 12px; height: 16px; border-radius: 2px; pointer-events: none; animation: adBurst 1.6s cubic-bezier(.2,.7,.3,1) forwards; }
.ad-shell { min-height: 100vh; display: grid; grid-template-columns: minmax(440px, 560px) 1fr; }
.ad-left { display: flex; flex-direction: column; padding: 28px 56px; background: #fff; border-right: 1px solid var(--line); position: relative; }
.ad-right { background: linear-gradient(160deg, #F8FAFC, #E2E8F0 60%, #CBD5E1); display: flex; align-items: center; justify-content: center; padding: 56px; position: relative; overflow: hidden; }
.ad-phone { width: 340px; aspect-ratio: 9/19; background: #1a1a1a; border-radius: 44px; padding: 10px; box-shadow: 0 50px 100px -25px rgba(15,23,42,0.4); position: relative; z-index: 5; }
.ad-phone-screen { width: 100%; height: 100%; border-radius: 36px; background: #fff; overflow: hidden; position: relative; }
.ad-phone-notch { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 96px; height: 24px; background: #000; border-radius: 12px; z-index: 10; }
.ad-logo-text { font-weight: 800; font-size: 21px; letter-spacing: -0.025em; }
.ad-center-card { flex: 1; display: flex; flex-direction: column; justify-content: center; max-width: 420px; margin: 0 auto; width: 100%; padding: 40px 0; }
.ad-glow { position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; background: radial-gradient(circle, rgba(30,58,138,0.08), transparent 60%); pointer-events: none; }
.ad-navitem { display: flex; align-items: center; gap: 10px; padding: 10px 12px; width: 100%; text-align: left; border-radius: 8px; font-size: 13px; font-weight: 500; border: none; background: none; cursor: pointer; color: var(--ink); }
.ad-navitem:hover { background: var(--bg-2); }
.ad-navnum { font-family: var(--font-mono); font-size: 10px; color: var(--ink-3); padding: 2px 6px; background: var(--bg-2); border-radius: 4px; min-width: 26px; text-align: center; }
.ad-shimmer { background: linear-gradient(90deg, var(--bg-2) 0%, var(--bg-3) 50%, var(--bg-2) 100%); background-size: 200% 100%; animation: adShimmer 1.6s infinite; }
@keyframes adShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@media (max-width: 900px) { .ad-shell { grid-template-columns: 1fr; } .ad-right { display: none; } }
`
