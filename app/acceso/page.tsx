import { AuthDesktopFlow } from "@/components/auth-v2/auth-desktop"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Acceso — bylink",
  description: "Entra o crea tu tienda en bylink.",
}

type Screen =
  | "welcome" | "login" | "login-error" | "forgot" | "register" | "register-exists"
  | "onb" | "importing" | "celebration" | "ai-catalog" | "scraper-failed"
const VALID: Screen[] = ["welcome", "login", "login-error", "forgot", "register", "register-exists", "onb", "importing", "celebration", "ai-catalog", "scraper-failed"]

interface Props {
  searchParams: Promise<{ screen?: string }>
}

export default async function AccesoPage({ searchParams }: Props) {
  const { screen } = await searchParams
  const initial: Screen = screen && VALID.includes(screen as Screen) ? (screen as Screen) : "welcome"
  return <AuthDesktopFlow initialScreen={initial} showScreenJumper />
}
