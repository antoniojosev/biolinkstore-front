"use client"

import { useEffect, useState } from "react"
import { WhatsAppPaymentProvider } from "@/lib/payment-providers/whatsapp"

interface Color { name: string; hex: string }
interface Variant { id: string; combination: Record<string, string>; isAvailable: boolean }
interface Product {
  id: string
  name: string
  cat: string
  price: number
  gradient?: string
  image?: string
  sizes: string[]
  colors: Color[]
  desc: string
  sizeAttrName?: string
  colorAttrName?: string
  variants?: Variant[]
}
interface CartItem { id: string; name: string; price: number; size: string; color: string; gradient?: string; image?: string; variantId?: string }

export interface StorefrontData {
  store: { name: string; username?: string; bio?: string; avatar?: string; slug?: string; whatsappNumber?: string; currency?: string }
  products: Array<{
    id: string; name: string; category?: string; price: number; image?: string; description?: string
    sizes?: string[]; colors?: Color[]
    sizeAttrName?: string
    colorAttrName?: string
    variants?: Variant[]
  }>
  categories: Array<{ id: string; name: string }>
}

const MOCK_PRODUCTS: Product[] = [
  { id: "p1", name: "Vestido Sienna", cat: "vestidos", price: 89, gradient: "linear-gradient(135deg, #C63E2A, #7A1F10)", sizes: ["S", "M", "L", "XL"], colors: [{ name: "Coral", hex: "#C63E2A" }, { name: "Negro", hex: "#1a1a1a" }], desc: "Vestido midi en algodón orgánico, corte A. Hecho en Caracas." },
  { id: "p2", name: "Top Luna", cat: "tops", price: 42, gradient: "linear-gradient(135deg, #E8C07A, #B8860B)", sizes: ["S", "M", "L"], colors: [{ name: "Mostaza", hex: "#E8C07A" }, { name: "Crema", hex: "#F5EBE0" }], desc: "Top de lino con mangas abullonadas. Versátil y elegante." },
  { id: "p3", name: "Falda Mara", cat: "vestidos", price: 56, gradient: "linear-gradient(135deg, #8A6B4C, #5A3D1D)", sizes: ["S", "M", "L"], colors: [{ name: "Cacao", hex: "#8A6B4C" }], desc: "Falda midi en gabardina, corte recto." },
  { id: "p4", name: "Blazer Noé", cat: "tops", price: 120, gradient: "linear-gradient(135deg, #2A3B5C, #0A1F4D)", sizes: ["S", "M", "L", "XL"], colors: [{ name: "Azul noche", hex: "#2A3B5C" }], desc: "Blazer estructurado en lino-algodón. Para llevar de día y noche." },
  { id: "p5", name: "Aretes Sol", cat: "accesorios", price: 18, gradient: "linear-gradient(135deg, #D4AF37, #8B7500)", sizes: ["Único"], colors: [{ name: "Dorado", hex: "#D4AF37" }], desc: "Aretes en bronce bañado en oro 24k." },
  { id: "p6", name: "Pañuelo Iris", cat: "accesorios", price: 28, gradient: "linear-gradient(135deg, #DC4A3D, #F97066)", sizes: ["Único"], colors: [{ name: "Coral", hex: "#DC4A3D" }], desc: "Pañuelo de seda con estampado floral." },
]

const MOCK_CATEGORIES = [
  { id: "all", label: "Todo" },
  { id: "vestidos", label: "Vestidos" },
  { id: "tops", label: "Tops" },
  { id: "accesorios", label: "Accesorios" },
]

const MOCK_STORE = { name: "Rosa Atelier", username: "@rosa.atelier · Caracas 🇻🇪", bio: "Moda femenina hecha en Caracas. Piezas únicas en algodón natural y lino.", bioAccent: "Para mujeres que viven con intención.", avatarLetter: "R", avatar: undefined as string | undefined, slug: undefined as string | undefined, whatsappNumber: undefined as string | undefined, currency: "USD" }

function adapt(data: StorefrontData) {
  const products: Product[] = data.products.map((p) => ({
    id: p.id,
    name: p.name,
    cat: p.category ?? "all",
    price: p.price,
    image: p.image,
    sizes: p.sizes ?? [],
    colors: p.colors ?? [],
    desc: p.description ?? "",
    sizeAttrName: p.sizeAttrName,
    colorAttrName: p.colorAttrName,
    variants: p.variants,
  }))
  const categories = [{ id: "all", label: "Todo" }, ...data.categories.map((c) => ({ id: c.id, label: c.name }))]
  const initial = (data.store.name.trim()[0] || "B").toUpperCase()
  const store = {
    name: data.store.name,
    username: data.store.username ?? "",
    bio: data.store.bio ?? "",
    bioAccent: "",
    avatarLetter: initial,
    avatar: data.store.avatar,
    slug: data.store.slug,
    whatsappNumber: data.store.whatsappNumber,
    currency: data.store.currency ?? "USD",
  }
  return { products, categories, store }
}
const RATE = 48.32

const styles = `
.sf-root { --bg: #FFFFFF; --bg-2: #FAF7F2; --ink: #2A1810; --ink-2: #5C4530; --ink-3: #8B7560; --line: #E8DFD3; --line-2: #D4C4B0; --brand: #C63E2A; --brand-dark: #8A1F10; --accent: #DC4A3D; --whatsapp: #25D366; font-family: var(--font-sans); color: var(--ink); background: var(--bg-2); }
.sf-root .mono { font-family: var(--font-mono); }
.sf-root .serif-it { font-family: var(--font-serif); font-style: italic; font-weight: 400; }
.sf-frame { max-width: 440px; margin: 0 auto; background: var(--bg); min-height: 100vh; box-shadow: 0 0 80px -20px rgba(42,24,16,0.15); position: relative; }
.sf-card { transition: transform .2s ease; cursor: pointer; }
.sf-card:hover { transform: translateY(-4px); }
.sf-card:hover .sf-img { box-shadow: 0 20px 40px -15px rgba(42,24,16,0.25); }
.sf-img { transition: box-shadow .2s ease; }
@keyframes sfSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes sfFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes sfPop { 0% { transform: scale(.7); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
@keyframes sfPulse { 0%, 100% { opacity: .3; } 50% { opacity: 1; } }
.sf-overlay { animation: sfFadeIn .25s ease; }
.sf-sheet { animation: sfSlideUp .35s cubic-bezier(.2,.7,.3,1); }
.sf-badge-anim { animation: sfPop .4s cubic-bezier(.2,.9,.4,1.4); }
.sf-wa-1 { opacity: 0; animation: sfFadeIn .3s .8s forwards; }
.sf-wa-2 { opacity: 0; animation: sfFadeIn .3s 1s forwards; }
.sf-wa-3 { opacity: 0; animation: sfFadeIn .3s 1.4s forwards; }
.sf-wa-4 { opacity: 0; animation: sfFadeIn .3s 2.4s forwards; }
.sf-wa-5 { opacity: 0; animation: sfFadeIn .3s 3s forwards; }
`

export function StorefrontDemo({ data }: { data?: StorefrontData } = {}) {
  const { products: PRODUCTS, categories: CATEGORIES, store: STORE } = data
    ? adapt(data)
    : { products: MOCK_PRODUCTS, categories: MOCK_CATEGORIES, store: MOCK_STORE }
  const [cat, setCat] = useState("all")
  const [currency, setCurrency] = useState<"USD" | "BS">("USD")
  const [cart, setCart] = useState<CartItem[]>([])
  const [openProductId, setOpenProductId] = useState<string | null>(null)
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<Color | null>(null)
  const [added, setAdded] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [waOpen, setWaOpen] = useState(false)
  const [typing, setTyping] = useState(false)

  const fmt = (usd: number) => (currency === "USD" ? `$${usd}` : `Bs. ${(usd * RATE).toFixed(2).replace(".", ",")}`)
  const list = cat === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === cat)
  const product = PRODUCTS.find((p) => p.id === openProductId) || null
  const total = cart.reduce((s, it) => s + it.price, 0)

  function openProduct(p: Product) {
    setOpenProductId(p.id)
    setSize(p.sizes[0])
    setColor(p.colors[0])
    setAdded(false)
  }
  function addToCart() {
    if (!product) return
    if (product.sizes.length > 0 && !size) return
    if (product.colors.length > 0 && !color) return
    // Resolve variantId by matching the selected combination against product.variants
    let variantId: string | undefined
    if (product.variants && product.variants.length > 0) {
      const combination: Record<string, string> = {}
      if (product.sizeAttrName && size) combination[product.sizeAttrName] = size
      if (product.colorAttrName && color) combination[product.colorAttrName] = color.name
      const match = product.variants.find((v) =>
        Object.entries(combination).every(([k, val]) => v.combination[k] === val),
      )
      if (match) variantId = match.id
    }
    setCart((c) => [...c, { id: product.id, name: product.name, price: product.price, size: size ?? "—", color: color?.name ?? "—", gradient: product.gradient, image: product.image, variantId }])
    setAdded(true)
    setTimeout(() => setOpenProductId(null), 600)
  }

  useEffect(() => {
    if (!waOpen) return
    const t1 = setTimeout(() => setTyping(true), 1900)
    const t2 = setTimeout(() => setTyping(false), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [waOpen])

  const [sending, setSending] = useState(false)
  async function sendToWhatsApp() {
    if (sending) return
    if (STORE.slug && STORE.whatsappNumber) {
      setSending(true)
      try {
        const provider = new WhatsAppPaymentProvider(STORE.whatsappNumber, STORE.currency)
        await provider.checkout({
          storeSlug: STORE.slug,
          currency: STORE.currency,
          total,
          items: cart.map((it) => {
            const variant = (it.size !== "—" || it.color !== "—")
              ? [it.size !== "—" && `T:${it.size}`, it.color !== "—" && it.color].filter(Boolean).join(" · ")
              : undefined
            return { productId: it.id, variantId: it.variantId, name: it.name, variant, quantity: 1, price: it.price, image: it.image }
          }),
        })
        setCartOpen(false)
        setCart([])
      } catch {
        // Fall back to simulated overlay on provider failure
        setCartOpen(false)
        setWaOpen(true)
      } finally {
        setSending(false)
      }
      return
    }
    setCartOpen(false)
    setWaOpen(true)
  }
  function closeWA() {
    setWaOpen(false)
    setCart([])
  }

  return (
    <div className="sf-root">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="sf-frame">
        <header style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--line)", padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: STORE.avatar ? `#000 url(${STORE.avatar}) center/cover no-repeat` : "linear-gradient(135deg, var(--brand), var(--brand-dark))", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>
              {STORE.avatar ? "" : STORE.avatarLetter}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.015em" }}>{STORE.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{STORE.username}</div>
            </div>
            <button type="button" onClick={() => cart.length && setCartOpen(true)} style={{ position: "relative", width: 40, height: 40, borderRadius: 10, background: "var(--bg-2)", display: "grid", placeItems: "center", border: "none", cursor: "pointer" }}>
              <span style={{ fontSize: 18 }}>🛍️</span>
              {cart.length > 0 && <span className="sf-badge-anim" key={cart.length} style={{ position: "absolute", top: -4, right: -4, background: "var(--brand)", color: "#fff", fontSize: 11, fontWeight: 700, minWidth: 20, height: 20, borderRadius: 10, padding: "0 6px", display: "flex", alignItems: "center", justifyContent: "center" }}>{cart.length}</span>}
            </button>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => {
              const on = cat === c.id
              return (
                <button key={c.id} type="button" onClick={() => setCat(c.id)} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 999, background: on ? "var(--ink)" : "var(--bg-2)", color: on ? "#fff" : "var(--ink-2)", fontWeight: on ? 600 : 500, border: "none", cursor: "pointer" }}>{c.label}</button>
              )
            })}
          </div>

          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--bg-2)", borderRadius: 10 }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>USD</span>
            <button type="button" onClick={() => setCurrency((c) => (c === "USD" ? "BS" : "USD"))} style={{ width: 36, height: 20, borderRadius: 10, background: "var(--brand)", position: "relative", border: "none", cursor: "pointer" }}>
              <span style={{ position: "absolute", top: 2, left: currency === "USD" ? 2 : 18, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
            </button>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink)", fontWeight: 600 }}>{currency === "USD" ? "USD" : "Bs."}</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-3)" }}>Tasa BCV: <strong style={{ color: "var(--ink-2)" }}>48,32</strong></span>
          </div>
        </header>

        {(STORE.bio || STORE.bioAccent) && (
          <section style={{ padding: "20px 16px 0" }}>
            <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, margin: 0 }}>
              {STORE.bio}
              {STORE.bioAccent && <> <span className="serif-it" style={{ color: "var(--brand)" }}>{STORE.bioAccent}</span></>}
            </p>
          </section>
        )}

        <section style={{ padding: "20px 16px 100px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {list.map((p) => (
              <article key={p.id} className="sf-card" onClick={() => openProduct(p)}>
                <div className="sf-img" style={{ aspectRatio: "3/4", borderRadius: 14, background: p.image ? `#fff url(${p.image}) center/cover no-repeat` : p.gradient, position: "relative" }}>
                  <button type="button" onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.95)", display: "grid", placeItems: "center", fontSize: 14, border: "none", cursor: "pointer" }}>♡</button>
                </div>
                <div style={{ padding: "8px 4px 0" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{fmt(p.price)}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {cart.length > 0 && (
          <button type="button" onClick={() => setCartOpen(true)} style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", padding: "14px 24px", background: "var(--ink)", color: "#fff", borderRadius: 999, fontWeight: 600, fontSize: 14, boxShadow: "0 16px 40px -10px rgba(42,24,16,0.4)", display: "flex", alignItems: "center", gap: 10, zIndex: 20, border: "none", cursor: "pointer" }}>
            {cart.length} en carrito · Pedir por WhatsApp →
          </button>
        )}
      </div>

      {/* PRODUCT MODAL */}
      {product && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div className="sf-overlay" onClick={() => setOpenProductId(null)} style={{ position: "absolute", inset: 0, background: "rgba(42,24,16,0.5)", backdropFilter: "blur(4px)" }} />
          <div className="sf-sheet" style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 440, background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ position: "sticky", top: 0, padding: 12, display: "flex", justifyContent: "center", background: "linear-gradient(to bottom, #fff, transparent)" }}>
              <button type="button" onClick={() => setOpenProductId(null)} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-2)", display: "grid", placeItems: "center", fontSize: 18, border: "none", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: "0 20px 24px" }}>
              <div style={{ aspectRatio: "3/4", borderRadius: 16, background: product.image ? `#fff url(${product.image}) center/cover no-repeat` : product.gradient, maxWidth: 280, margin: "0 auto 20px" }} />
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.02em" }}>{product.name}</h2>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--brand)", marginBottom: 14 }}>{fmt(product.price)}</div>
              {product.desc && <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, margin: "0 0 20px" }}>{product.desc}</p>}

              {product.sizes.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", marginBottom: 8 }}>TALLA</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {product.sizes.map((s) => {
                      const on = size === s
                      return <button key={s} type="button" onClick={() => setSize(s)} style={{ minWidth: 44, padding: "10px 14px", border: `1.5px solid ${on ? "var(--ink)" : "var(--line-2)"}`, background: on ? "var(--ink)" : "#fff", color: on ? "#fff" : "var(--ink)", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{s}</button>
                    })}
                  </div>
                </div>
              )}

              {product.colors.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", marginBottom: 8 }}>COLOR · <span style={{ color: "var(--ink)", fontWeight: 500 }}>{color?.name}</span></div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {product.colors.map((c) => {
                      const on = color?.hex === c.hex
                      return <button key={c.hex} type="button" aria-label={c.name} onClick={() => setColor(c)} style={{ width: 36, height: 36, borderRadius: "50%", background: c.hex, border: `2px solid ${on ? "var(--ink)" : "var(--line-2)"}`, cursor: "pointer", boxShadow: on ? "0 0 0 3px #fff inset" : "none" }} />
                    })}
                  </div>
                </div>
              )}

              <button type="button" onClick={addToCart} style={{ width: "100%", padding: 16, background: added ? "var(--whatsapp)" : "var(--ink)", color: "#fff", borderRadius: 14, fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", cursor: "pointer" }}>
                {added ? "✓ Agregado" : `Agregar al carrito · ${fmt(product.price)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART MODAL */}
      {cartOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div className="sf-overlay" onClick={() => setCartOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(42,24,16,0.5)", backdropFilter: "blur(4px)" }} />
          <div className="sf-sheet" style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 440, background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)" }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Tu pedido</h2>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{STORE.name}</div>
              </div>
              <button type="button" onClick={() => setCartOpen(false)} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-2)", display: "grid", placeItems: "center", fontSize: 18, border: "none", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              {cart.map((it, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ width: 60, height: 80, borderRadius: 8, background: it.image ? `#fff url(${it.image}) center/cover no-repeat` : it.gradient, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{it.name}</div>
                    {(it.size !== "—" || it.color !== "—") && (
                      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                        {[it.size !== "—" && `Talla ${it.size}`, it.color !== "—" && it.color].filter(Boolean).join(" · ")}
                      </div>
                    )}
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--brand)", marginTop: 6 }}>{fmt(it.price)}</div>
                  </div>
                  <button type="button" onClick={() => setCart((c) => c.filter((_, idx) => idx !== i))} style={{ fontSize: 18, color: "var(--ink-3)", alignSelf: "flex-start", background: "none", border: "none", cursor: "pointer" }}>×</button>
                </div>
              ))}
            </div>
            <div style={{ padding: "16px 20px 24px", borderTop: "1px solid var(--line)", background: "var(--bg-2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                <span style={{ fontSize: 15, color: "var(--ink-2)" }}>Total</span>
                <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>{fmt(total)}</span>
              </div>
              <button type="button" onClick={sendToWhatsApp} disabled={sending} style={{ width: "100%", padding: 16, background: "var(--whatsapp)", color: "#fff", borderRadius: 14, fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 8px 20px -6px rgba(37,211,102,0.4)", border: "none", cursor: sending ? "not-allowed" : "pointer", opacity: sending ? 0.7 : 1 }}>
                <span style={{ fontSize: 22 }}>💬</span> {sending ? "Enviando…" : "Enviar pedido por WhatsApp"}
              </button>
              <div style={{ textAlign: "center", fontSize: 11, color: "var(--ink-3)", marginTop: 10 }}>Te respondemos en menos de 5 minutos</div>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP WOW OVERLAY */}
      {waOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#0B141A" }}>
          <div style={{ position: "relative", width: "100%", height: "100%", maxWidth: 440, margin: "0 auto", overflow: "hidden" }}>
            <div className="sf-wa-1" style={{ background: "#1F2C34", padding: "50px 16px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "#fff", fontSize: 22 }}>←</span>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: STORE.avatar ? `#000 url(${STORE.avatar}) center/cover no-repeat` : "linear-gradient(135deg, var(--brand), var(--brand-dark))", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>{STORE.avatar ? "" : STORE.avatarLetter}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{STORE.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>en línea</div>
              </div>
              <span style={{ color: "#fff", fontSize: 18 }}>📞</span>
            </div>

            <div className="sf-wa-2" style={{ background: "#0B141A", height: "calc(100% - 100px)", padding: "20px 16px", overflowY: "auto" }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 8 }}>HOY</span>
              </div>

              <div className="sf-wa-3" style={{ maxWidth: "85%", marginLeft: "auto", background: "#005C4B", color: "#fff", padding: "10px 12px", borderRadius: "10px 10px 2px 10px", fontSize: 13, lineHeight: 1.5, boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
                <div style={{ fontWeight: 700, marginBottom: 6, color: "#B5F4D5" }}>🛍️ Nuevo pedido #1284</div>
                <div>
                  {cart.map((it, i) => (
                    <div key={i}>• {it.name} · {it.size} · {it.color}<br />&nbsp;&nbsp;{fmt(it.price)}</div>
                  ))}
                  <br />
                  <strong style={{ color: "#B5F4D5" }}>Total: {fmt(total)}</strong>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textAlign: "right", marginTop: 6, display: "flex", gap: 4, justifyContent: "flex-end", alignItems: "center" }}>14:32 <span style={{ color: "#53BDEB" }}>✓✓</span></div>
              </div>

              {typing && (
                <div style={{ maxWidth: 60, background: "#1F2C34", padding: 10, borderRadius: 10, marginTop: 12 }}>
                  <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)", animation: "sfPulse 1s infinite" }} />
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)", animation: "sfPulse 1s .2s infinite" }} />
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)", animation: "sfPulse 1s .4s infinite" }} />
                  </div>
                </div>
              )}

              <div className="sf-wa-4" style={{ maxWidth: "80%", background: "#1F2C34", color: "#fff", padding: "10px 12px", borderRadius: "10px 10px 10px 2px", fontSize: 13, marginTop: 12 }}>
                ¡Hola! 💕 Recibí tu pedido. Te confirmo despacho mañana ✨
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textAlign: "right", marginTop: 4 }}>14:33</div>
              </div>
            </div>

            <button type="button" onClick={closeWA} className="sf-wa-5" style={{ position: "absolute", top: 70, right: 16, padding: "6px 12px", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 11, borderRadius: 8, border: "none", cursor: "pointer" }}>↩ volver a la tienda</button>
          </div>
        </div>
      )}
    </div>
  )
}
