import type { NextConfig } from "next";

// Rutas legacy que ahora viven dentro del panel v2 (vistas por query) o del
// flujo de acceso. Se resuelven como redirects a nivel de routing en vez de
// páginas que renderizan y llaman redirect() sincrónico — eso último dispara
// en dev el error "Failed to execute 'measure' on 'Performance' … negative
// time stamp" (la medición del render nunca cierra porque redirect() lanza).
// permanent:false (307) para no cachear en el browser si una ruta vuelve.
const LEGACY_REDIRECTS: { source: string; destination: string }[] = [
  { source: "/onboarding/create-store", destination: "/acceso?screen=onb" },
  { source: "/dashboard/estadisticas", destination: "/dashboard?view=data" },
  { source: "/dashboard/plantillas", destination: "/dashboard?view=design" },
  { source: "/dashboard/diseno", destination: "/dashboard?view=design" },
  { source: "/dashboard/cotizaciones", destination: "/dashboard?view=orders" },
  { source: "/dashboard/configuracion", destination: "/dashboard?view=config" },
  { source: "/dashboard/categorias", destination: "/dashboard?view=catalog" },
  { source: "/dashboard/productos", destination: "/dashboard?view=catalog" },
  { source: "/dashboard/productos/crear", destination: "/dashboard?view=catalog" },
  { source: "/dashboard/productos/:id/editar", destination: "/dashboard?view=catalog" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**.s3.amazonaws.com",
      },
    ],
  },
  async redirects() {
    return LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: false }));
  },
};

export default nextConfig;
