import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Olvide Mi Contrasena - Bio Link Store",
  description: "Recupera el acceso a tu cuenta de Bio Link Store.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
