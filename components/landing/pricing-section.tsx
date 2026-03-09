"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Check,
  MessageCircle,
  Mail,
  Send,
  Banknote,
  X,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useExchangeRate, formatBs } from "@/lib/hooks/use-exchange-rate";

const WA_NUMBER = "5491100000000";
const CONTACT_EMAIL = "ventas@biolinkstore.com";

type ContactMethod = "whatsapp" | "email" | "transfer";

export function PricingSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [modal, setModal] = useState<{ open: boolean; planName: string }>({
    open: false,
    planName: "",
  });
  const [method, setMethod] = useState<ContactMethod>("whatsapp");
  const [contactValue, setContactValue] = useState("");
  const { rate } = useExchangeRate();
  const [description, setDescription] = useState("");
  const [transferInfo, setTransferInfo] = useState({
    name: "",
    bank: "",
    date: "",
  });

  const plans = [
    {
      name: "Gratis",
      price: "$0",
      period: "para siempre",
      description: "Perfecto para empezar a vender",
      features: [
        "Hasta 20 productos",
        "5 fotos por producto",
        "5 categorías",
        "Link personalizado",
        "Checkout por WhatsApp",
        "Dominio personalizado",
        "Analíticas básicas",
        "Soporte por email",
      ],
      cta: "Comenzar gratis",
      highlighted: false,
      color: "#6ee490",
      isRegister: true,
    },
    {
      name: "Pro",
      price: "$15",
      period: "por mes",
      description: "Para tiendas en crecimiento",
      features: [
        "Hasta 100 productos",
        "10 fotos por producto",
        "Categorías ilimitadas",
        "Sin marca de agua",
        "Analíticas avanzadas",
        "Acceso a templates Pro",
        "Exportar cotizaciones",
        "Soporte prioritario",
      ],
      cta: "Elegir Pro",
      highlighted: true,
      color: "#33b380",
      isRegister: false,
    },
    {
      name: "Business",
      price: "$150",
      period: "por mes",
      description: "Para negocios establecidos",
      features: [
        "Todo de Pro incluido",
        "Productos ilimitados",
        "Fotos ilimitadas",
        "Múltiples tiendas (hasta 3)",
        "API de integración",
        "Reportes exportables",
        "Búsqueda con IA por imagen e intención",
        "Recomendaciones personalizadas con IA",
        "CRM de ventas integrado",
        "Soporte 24/7",
        "Account manager dedicado",
      ],
      cta: "Elegir Business",
      highlighted: false,
      color: "#327be2",
      isRegister: false,
    },
  ];

  const openModal = (planName: string) => {
    setModal({ open: true, planName });
    setMethod("whatsapp");
    setContactValue("");
    setDescription("");
    setTransferInfo({ name: "", bank: "", date: "" });
  };

  const closeModal = () => setModal({ open: false, planName: "" });

  const handleSend = () => {
    if (method === "whatsapp") {
      if (!contactValue.trim()) return;
      const msg = encodeURIComponent(
        `Hola! Me interesa el plan ${modal.planName} de Bio Link Store.\n\n${description ? `Comentarios: ${description}\n\n` : ""}Mi WhatsApp: ${contactValue}`,
      );
      window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
    } else if (method === "email") {
      if (!contactValue.trim()) return;
      const subject = encodeURIComponent(
        `Plan ${modal.planName} — Bio Link Store`,
      );
      const body = encodeURIComponent(
        `Hola!\n\nMe interesa contratar el plan ${modal.planName} en Bio Link Store.\n\n${description ? `Comentarios: ${description}\n\n` : ""}Mi email: ${contactValue}`,
      );
      window.open(
        `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`,
        "_blank",
      );
    } else if (method === "transfer") {
      if (!transferInfo.name.trim() || !transferInfo.bank.trim()) return;
      const msg = encodeURIComponent(
        `Hola! Realicé una transferencia para el plan ${modal.planName} de Bio Link Store.\n\nNombre: ${transferInfo.name}\nBanco: ${transferInfo.bank}\nFecha: ${transferInfo.date || "Hoy"}\n\n${description ? `Comentarios: ${description}` : ""}`,
      );
      window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
    }
    closeModal();
  };

  const canSend =
    method === "transfer"
      ? transferInfo.name.trim() && transferInfo.bank.trim()
      : contactValue.trim();

  return (
    <section id="pricing" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16 glass-panel-light py-6 sm:py-8 px-5 sm:px-6 rounded-2xl border border-white/10 max-w-3xl mx-auto">
          <p className="text-sm text-[#6ee490] font-semibold mb-2">Precios</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance text-white">
            Planes para cada etapa de tu negocio
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Comienza gratis y escala cuando lo necesites. Sin sorpresas, sin
            comisiones por venta.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-5 sm:p-8 rounded-2xl border glass-panel flex flex-col ${
                plan.highlighted
                  ? "border-[#33b380]/50 shadow-lg shadow-[#33b380]/20 ring-1 ring-[#33b380]/30"
                  : "border-white/10"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#33b380] to-[#2a9669] text-white text-xs font-medium rounded-full">
                  Más popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-4xl font-bold"
                    style={{ color: plan.color }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm text-white/70">{plan.period}</span>
                </div>
                {rate && plan.price !== "$0" && (
                  <p className="text-sm text-white/40 mt-1">
                    {formatBs(parseInt(plan.price.replace("$", "")), rate)} <span className="text-white/25">/ tasa BCV</span>
                  </p>
                )}
                <p className="text-sm text-white/70 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check
                      className="h-4 w-4 mt-0.5 shrink-0"
                      style={{ color: plan.color }}
                    />
                    <span className="text-white/90">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.isRegister ? (
                <Link href="/registro">
                  <Button
                    className="w-full gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white cursor-pointer"
                    variant="outline"
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href={isAuthenticated ? "/dashboard/plan" : "/login"}>
                  <Button
                    className={`w-full cursor-pointer ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-[#33b380] to-[#2a9669] hover:from-[#2a9669] hover:to-[#228055] text-white border-0"
                        : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Custom plan CTA */}
        <div className="mt-8 max-w-5xl mx-auto relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#6ee490] via-[#33b380] to-[#327be2] p-px">
            <div className="w-full h-full rounded-2xl bg-[#0a0f14]" />
          </div>
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-[#33b380]/20 blur-3xl" />
          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#6ee490] mb-1">
                Plan personalizado
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                ¿Necesitas algo{" "}
                <span className="bg-gradient-to-r from-[#6ee490] via-[#33b380] to-[#327be2] bg-clip-text text-transparent">
                  a tu medida
                </span>
                ?
              </h3>
              <p className="text-sm text-white/60 leading-relaxed max-w-lg mx-auto sm:mx-0">
                Elige solo las funciones que necesitas sin pagar de más. Diseño
                exclusivo, integraciones, reportes avanzados — armamos el plan
                perfecto para tu negocio.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="gap-2 bg-gradient-to-r from-[#33b380] to-[#327be2] hover:from-[#2a9669] hover:to-[#2a6bc7] text-white border-0 shadow-lg shadow-[#33b380]/20 shrink-0 cursor-pointer"
            >
              <Link href={isAuthenticated ? "/dashboard/plan" : "/login"}>
                <MessageCircle className="h-4 w-4" />
                Cotizar mi plan
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Contact / Payment Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl glass-panel border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wider uppercase text-[#6ee490]">
                  {modal.planName === "Personalizado"
                    ? "Plan personalizado"
                    : `Plan ${modal.planName}`}
                </p>
                <h3 className="text-lg font-bold text-white">
                  {modal.planName === "Personalizado"
                    ? "Contanos qué necesitas"
                    : "¿Cómo quieres continuar?"}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Method toggle */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setMethod("whatsapp")}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  method === "whatsapp"
                    ? "border-[#25D366] bg-[#25D366]/10 text-[#25D366]"
                    : "border-white/10 text-white/50 hover:border-white/20"
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-[11px]">WhatsApp</span>
              </button>
              <button
                onClick={() => setMethod("email")}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  method === "email"
                    ? "border-[#327be2] bg-[#327be2]/10 text-[#327be2]"
                    : "border-white/10 text-white/50 hover:border-white/20"
                }`}
              >
                <Mail className="h-4 w-4" />
                <span className="text-[11px]">Email</span>
              </button>
              <button
                onClick={() => setMethod("transfer")}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  method === "transfer"
                    ? "border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]"
                    : "border-white/10 text-white/50 hover:border-white/20"
                }`}
              >
                <Banknote className="h-4 w-4" />
                <span className="text-[11px]">Transferencia</span>
              </button>
            </div>

            {method === "transfer" ? (
              <>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 font-medium">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={transferInfo.name}
                      onChange={(e) =>
                        setTransferInfo((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Juan Pérez"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#f59e0b]/50 focus:bg-white/8 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 font-medium">
                      Banco
                    </label>
                    <input
                      type="text"
                      value={transferInfo.bank}
                      onChange={(e) =>
                        setTransferInfo((p) => ({ ...p, bank: e.target.value }))
                      }
                      placeholder="Banco Nación, Mercado Pago..."
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#f59e0b]/50 focus:bg-white/8 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 font-medium">
                      Fecha de transferencia{" "}
                      <span className="text-white/20">(opcional)</span>
                    </label>
                    <input
                      type="date"
                      value={transferInfo.date}
                      onChange={(e) =>
                        setTransferInfo((p) => ({ ...p, date: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#f59e0b]/50 focus:bg-white/8 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                {modal.planName === "Personalizado" && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 font-medium">
                      ¿Qué funciones necesitas?{" "}
                      <span className="text-white/20">(opcional)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ej: Integraciones con MercadoLibre, reportes personalizados..."
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#f59e0b]/50 focus:bg-white/8 transition-all resize-none"
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">
                    {method === "whatsapp"
                      ? "Tu número de WhatsApp"
                      : "Tu email"}
                  </label>
                  <input
                    type={method === "whatsapp" ? "tel" : "email"}
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={
                      method === "whatsapp"
                        ? "+54 9 11 XXXX XXXX"
                        : "tu@email.com"
                    }
                    className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:bg-white/8 transition-all ${
                      method === "whatsapp"
                        ? "focus:border-[#25D366]/50"
                        : "focus:border-[#327be2]/50"
                    }`}
                  />
                  <p className="text-[11px] text-white/25">
                    Te contactaremos para coordinar el pago y activar tu plan.
                  </p>
                </div>

                {modal.planName === "Personalizado" && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 font-medium">
                      ¿Qué funciones te interesan?{" "}
                      <span className="text-white/20">(opcional)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ej: Integraciones con MercadoLibre, reportes personalizados..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#33b380]/50 focus:bg-white/8 transition-all resize-none"
                    />
                  </div>
                )}
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/20 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={!canSend}
                className={`flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  method === "whatsapp"
                    ? "bg-[#25D366] hover:bg-[#20bb5a]"
                    : method === "email"
                      ? "bg-[#327be2] hover:bg-[#2a6acc]"
                      : "bg-[#f59e0b] hover:bg-[#d97706]"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                Enviar solicitud
              </button>
            </div>

            <p className="text-[11px] text-white/25 text-center">
              Te contactaremos en menos de 24 horas.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
