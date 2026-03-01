"use client"

import { useState } from "react"
import { Search, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const orders = [
  {
    id: "#1024",
    customer: "Maria Lopez",
    whatsapp: "+5491123456789",
    items: [
      { name: "Vestido Floral Verano", qty: 1, price: 4500 },
      { name: "Aretes Dorados Luna", qty: 2, price: 890 },
    ],
    total: 6280,
    status: "Nuevo",
    date: "25 Feb 2026, 14:32",
  },
  {
    id: "#1023",
    customer: "Carlos Ruiz",
    whatsapp: "+5491198765432",
    items: [{ name: "Jean Mom Fit", qty: 1, price: 4200 }],
    total: 4200,
    status: "Enviado",
    date: "25 Feb 2026, 12:15",
  },
  {
    id: "#1022",
    customer: "Ana Torres",
    whatsapp: "+5491145678901",
    items: [
      { name: "Blusa Elegante Saten", qty: 1, price: 2800 },
      { name: "Collar Perlas Mini", qty: 1, price: 1200 },
    ],
    total: 4000,
    status: "Entregado",
    date: "25 Feb 2026, 09:48",
  },
  {
    id: "#1021",
    customer: "Pedro Garcia",
    whatsapp: "+5491156789012",
    items: [
      { name: "Vestido Midi Negro", qty: 1, price: 5800 },
      { name: "Tacones Stiletto", qty: 1, price: 6500 },
      { name: "Aretes Dorados Luna", qty: 1, price: 890 },
    ],
    total: 13190,
    status: "Nuevo",
    date: "24 Feb 2026, 22:10",
  },
  {
    id: "#1020",
    customer: "Laura Diaz",
    whatsapp: "+5491167890123",
    items: [{ name: "Pantalon Wide Leg", qty: 2, price: 3900 }],
    total: 7800,
    status: "Enviado",
    date: "24 Feb 2026, 18:05",
  },
]

const statusFilters = ["Todos", "Nuevo", "Enviado", "Entregado"]

function getStatusStyle(status: string) {
  switch (status) {
    case "Nuevo":
      return "bg-[#327be2]/15 text-[#327be2]"
    case "Enviado":
      return "bg-[#33b380]/15 text-[#6ee490]"
    case "Entregado":
      return "bg-white/10 text-white/50"
    default:
      return "bg-white/10 text-white/50"
  }
}

export default function OrdersPage() {
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("Todos")

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = activeFilter === "Todos" || o.status === activeFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Pedidos</h1>
        <p className="text-sm text-white/50">Gestiona los pedidos que llegan por WhatsApp</p>
      </div>

      {/* Filters */}
      <Card className="bg-[#0d1218] border-white/5">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                placeholder="Buscar por cliente o ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
              />
            </div>
            <div className="flex gap-1.5">
              {statusFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeFilter === f
                      ? "bg-[#33b380] text-white"
                      : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders */}
      <div className="space-y-3">
        {filtered.map((order) => (
          <Card key={order.id} className="bg-[#0d1218] border-white/5">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-mono text-white/40">{order.id}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-xs text-white/30">{order.date}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{order.customer}</p>
                    <p className="text-xs text-white/40">{order.whatsapp}</p>
                  </div>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-white/70">
                          {item.qty}x {item.name}
                        </span>
                        <span className="text-white/50">${(item.qty * item.price).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-sm font-medium text-white">Total</span>
                      <span className="text-sm font-bold text-[#6ee490]">
                        ${order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2">
                  <Button
                    size="sm"
                    className="bg-[#25d366] hover:bg-[#20bd5a] text-white text-xs h-8"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${order.whatsapp.replace(/\+/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                      Contactar
                    </a>
                  </Button>
                  <select
                    defaultValue={order.status}
                    className="h-8 px-2 text-xs bg-white/5 border border-white/10 text-white rounded-lg"
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
