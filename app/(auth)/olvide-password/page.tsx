import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Olvide Mi Contrasena - ByLink",
  description: "Recupera el acceso a tu cuenta de ByLink.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
