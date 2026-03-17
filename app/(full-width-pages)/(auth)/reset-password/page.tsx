import ResetPasswordForm from "@/components/auth/ResetPasswordForm"
import { Metadata } from "next"

import React from "react"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your RISE Education Management account password",
  // other metadata
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
