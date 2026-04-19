"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useExchangeRate, formatBs } from "@/lib/hooks/use-exchange-rate";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const plans = [
  {
    name: "Gratis",
    price: "$0",
    period: "para siempre",
    description: "Todo lo básico para montar tu tienda. Sin límite de tiempo.",
    features: [
      "Hasta 20 productos",
      "5 fotos por producto",
      "5 categorías",
      "Link personalizado",
      "Checkout por WhatsApp",
      "Analíticas básicas",
    ],
    cta: "Empezar gratis",
    highlighted: false,
    isRegister: true,
  },
  {
    name: "Pro",
    price: "$10",
    priceUsd: 10,
    period: "por mes",
    description: "Para negocios que quieren crecer. Menos que un café al mes.",
    features: [
      "Hasta 100 productos",
      "10 fotos por producto",
      "Categorías ilimitadas",
      "Todos los templates",
      "Sin badge \"Hecho con...\"",
      "Analíticas completas",
      "Dominio personalizado",
      "Soporte por WhatsApp",
    ],
    cta: "Obtener Pro",
    highlighted: true,
    isRegister: false,
  },
];

export function PricingSection() {
  const { isAuthenticated } = useAuth();
  const { rate } = useExchangeRate();
  const sectionRef = useScrollReveal<HTMLElement>();

  return (
    <section id="pricing" ref={sectionRef} className="reveal relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-900 overflow-hidden">
      {/* Ambient glow behind pro card */}
      <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--bylink-primary)]/[0.08] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--bylink-primary)]/[0.06] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
            Empieza gratis.{" "}
            <span className="text-[var(--bylink-primary)]">Crece cuando quieras.</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
            No te vamos a pedir tarjeta para el plan gratis. Sin trucos.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-6 sm:p-8 flex flex-col transition-all duration-300 ${
                plan.highlighted
                  ? "bg-gradient-to-br from-white via-white to-[var(--bylink-surface-soft)] ring-2 ring-[var(--bylink-primary)] scale-[1.02] sm:scale-105 shadow-[0_0_40px_rgba(15,107,168,0.18),0_0_80px_rgba(15,107,168,0.06)]"
                  : "bg-gray-800/80 border border-gray-700/50 opacity-90 hover:opacity-100 hover:border-gray-600"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--bylink-accent)] to-[var(--bylink-accent-hover)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[var(--bylink-accent)]/35 tracking-wide badge-glow">
                  Recomendado
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-2 ${plan.highlighted ? "text-gray-900" : "text-white"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  {plan.highlighted ? (
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-[var(--bylink-primary)] to-[var(--bylink-primary-hover)] bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                  ) : (
                    <span className="text-4xl font-extrabold text-white">
                      {plan.price}
                    </span>
                  )}
                  <span className={`text-sm font-medium ${plan.highlighted ? "text-gray-600" : "text-gray-400"}`}>
                    {plan.period}
                  </span>
                </div>
                {rate && plan.priceUsd && (
                  <p className={`text-sm mt-1 ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}>
                    {formatBs(plan.priceUsd, rate)} <span className="opacity-60">/ tasa BCV</span>
                  </p>
                )}
                <p className={`text-sm mt-2 ${plan.highlighted ? "text-gray-600" : "text-gray-400"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm group">
                    <Check
                      className={`h-4 w-4 mt-0.5 shrink-0 transition-transform duration-200 group-hover:scale-125 ${
                        plan.highlighted ? "text-[var(--bylink-primary)]" : "text-gray-400"
                      }`}
                    />
                    <span className={plan.highlighted ? "text-gray-700" : "text-gray-300"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.isRegister ? (
                <Link href="/registro">
                  <Button
                    className="w-full gap-2 cursor-pointer bg-gray-700 hover:bg-gray-600 text-white btn-press"
                    size="lg"
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href={isAuthenticated ? "/dashboard/plan" : "/registro"}>
                  <Button
                    className="w-full gap-2 cursor-pointer bg-[var(--bylink-primary)] hover:bg-[var(--bylink-primary-hover)] text-white shadow-lg shadow-[var(--bylink-primary)]/25 btn-press btn-shimmer"
                    size="lg"
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
