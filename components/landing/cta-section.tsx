"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, X, Calendar, Clock, Send, Check } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DemoFormData {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  company: string;
  message: string;
  date: string;
  time: string;
}

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export function CtaSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<DemoFormData>({
    name: "",
    email: "",
    phone: "",
    instagram: "",
    company: "",
    message: "",
    date: "",
    time: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      await fetch(`${API_URL}/api/contact/demo-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting demo request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setIsSubmitted(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      instagram: "",
      company: "",
      message: "",
      date: "",
      time: "",
    });
  };

  const canSubmit =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.date &&
    formData.time;

  return (
    <>
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center glass-panel py-8 px-5 sm:py-12 sm:px-8 rounded-3xl border border-white/10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance text-white">
            Empieza a vender más{" "}
            <span className="bg-gradient-to-r from-[#6ee490] via-[#33b380] to-[#327be2] bg-clip-text text-transparent">
              hoy mismo
            </span>
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Crea tu tienda gratis en menos de 5 minutos. Sin tarjeta de crédito,
            sin compromisos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-[#33b380] to-[#2a9669] hover:from-[#2a9669] hover:to-[#228055] text-white border-0 shadow-lg shadow-[#33b380]/25"
              >
                Crear mi tienda gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50 text-white"
              onClick={() => setModalOpen(true)}
            >
              Agendar demo personalizada
            </Button>
          </div>
          <p className="text-sm text-white/60 mt-6">
            +5,000 vendedores ya usan Bio Link Store
          </p>
        </div>
      </section>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-[#0a0f14] border-white/10 text-white">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#33b380]/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[#33b380]" />
              </div>
              <h3 className="text-xl font-bold mb-2">¡Demo agendada!</h3>
              <p className="text-white/60 mb-6">
                Te hemos enviado un email de confirmación. Nos contactaremos en
                breve.
              </p>
              <Button
                onClick={handleClose}
                className="bg-[#33b380] hover:bg-[#2a9669]"
              >
                Cerrar
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-wider uppercase text-[#6ee490]">
                    Demo personalizada
                  </p>
                  <h3 className="text-lg font-bold text-white">
                    Agenda una llamada con nosotros
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <Label htmlFor="demo-name" className="text-xs text-white/70">
                    Nombre completo *
                  </Label>
                  <Input
                    id="demo-name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#33b380]/50"
                    required
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <Label htmlFor="demo-email" className="text-xs text-white/70">
                    Email *
                  </Label>
                  <Input
                    id="demo-email"
                    type="email"
                    placeholder="juan@tuemail.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#33b380]/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <Label htmlFor="demo-phone" className="text-xs text-white/70">
                    Teléfono *
                  </Label>
                  <Input
                    id="demo-phone"
                    type="tel"
                    placeholder="+54 9 11 XXXX XXXX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#33b380]/50"
                    required
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <Label
                    htmlFor="demo-instagram"
                    className="text-xs text-white/70"
                  >
                    Instagram empresa{" "}
                    <span className="text-white/20">(opcional)</span>
                  </Label>
                  <Input
                    id="demo-instagram"
                    type="text"
                    placeholder="@tuempresa"
                    value={formData.instagram}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, instagram: e.target.value }))
                    }
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#33b380]/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="demo-company" className="text-xs text-white/70">
                  Empresa <span className="text-white/20">(opcional)</span>
                </Label>
                <Input
                  id="demo-company"
                  type="text"
                  placeholder="Tu empresa"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, company: e.target.value }))
                  }
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#33b380]/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="demo-message" className="text-xs text-white/70">
                  ¿Qué te gustaría ver en la demo?{" "}
                  <span className="text-white/20">(opcional)</span>
                </Label>
                <Textarea
                  id="demo-message"
                  placeholder="Cuéntanos sobre tu negocio y qué funciones te interesan..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, message: e.target.value }))
                  }
                  rows={2}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#33b380]/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="demo-date" className="text-xs text-white/70">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Fecha *
                  </Label>
                  <Input
                    id="demo-date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, date: e.target.value }))
                    }
                    className="bg-white/5 border-white/10 text-white focus:border-[#33b380]/50 [color-scheme:dark]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="demo-time" className="text-xs text-white/70">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Hora *
                  </Label>
                  <select
                    id="demo-time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, time: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#33b380]/50 focus:bg-white/8 transition-all"
                    required
                  >
                    <option value="" className="bg-[#0a0f14]">
                      Seleccionar
                    </option>
                    {TIME_SLOTS.map((time) => (
                      <option key={time} value={time} className="bg-[#0a0f14]">
                        {time}:00 hs
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#33b380] hover:bg-[#2a9669] text-white disabled:opacity-40"
                >
                  {isSubmitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Agendar demo
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
