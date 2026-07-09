import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Olvide mi contraseña — bylink",
  description: "Recupera el acceso a tu cuenta de bylink.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
