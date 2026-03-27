"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"

interface SubmitButtonProps {
  label: string
  loadingLabel: string
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

// ✅ Uses useFormStatus to disable button and show loading text
// while the server action is in progress — gives instant feedback
export function SubmitButton({
  label,
  loadingLabel,
  variant = "default",
  size = "default",
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      variant={variant}
      size={size}
      className={className}
    >
      {pending ? loadingLabel : label}
    </Button>
  )
}