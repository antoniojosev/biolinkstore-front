"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save, Store, Phone, Palette } from "lucide-react"

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white">Configuracion</h1>
        <p className="text-sm text-white/50">Personaliza tu tienda y datos de contacto</p>
      </div>

      {/* Store info */}
      <Card className="bg-[#0d1218] border-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#33b380]" />
            <CardTitle className="text-base font-semibold text-white">
              Informacion de la tienda
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Nombre de la tienda</Label>
            <Input
              defaultValue="Moda Latina"
              className="h-10 bg-white/5 border-white/10 text-white focus:border-[#33b380]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Usuario de Instagram</Label>
            <Input
              defaultValue="@modalatina.store"
              className="h-10 bg-white/5 border-white/10 text-white focus:border-[#33b380]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Descripcion</Label>
            <Textarea
              defaultValue="Moda femenina | Envios a todo el pais | Pagos seguros"
              rows={3}
              className="bg-white/5 border-white/10 text-white focus:border-[#33b380] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="bg-[#0d1218] border-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#327be2]" />
            <CardTitle className="text-base font-semibold text-white">
              Contacto
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-white/70">WhatsApp (con codigo de pais)</Label>
            <Input
              defaultValue="+5491123456789"
              className="h-10 bg-white/5 border-white/10 text-white focus:border-[#33b380]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Email de contacto</Label>
            <Input
              defaultValue="moda@email.com"
              className="h-10 bg-white/5 border-white/10 text-white focus:border-[#33b380]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="bg-[#0d1218] border-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#6ee490]" />
            <CardTitle className="text-base font-semibold text-white">
              Apariencia
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Color principal</Label>
            <div className="flex items-center gap-3">
              {["#33b380", "#327be2", "#eb851c", "#e74c3c", "#9b59b6", "#1abc9c"].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-white/30 transition-all"
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/70">Moneda</Label>
            <select className="w-full h-10 px-3 bg-white/5 border border-white/10 text-white rounded-lg text-sm">
              <option value="ARS">ARS - Peso Argentino</option>
              <option value="USD">USD - Dolar</option>
              <option value="MXN">MXN - Peso Mexicano</option>
              <option value="COP">COP - Peso Colombiano</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        className="bg-[#33b380] hover:bg-[#2a9a6d] text-white h-10"
      >
        <Save className="w-4 h-4 mr-2" />
        {saved ? "Guardado" : "Guardar cambios"}
      </Button>
    </div>
  )
}
