import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restablecer Contrasena - Bio Link Store",
  description: "Restablece tu contrasena de Bio Link Store.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
