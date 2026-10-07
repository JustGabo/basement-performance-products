"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "@/components/theme/ThemeProvider"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "!rounded-none !border-brand/60 !bg-[#111212] !text-white !shadow-[0_18px_60px_rgba(0,0,0,.45)]",
          title: "!font-black !uppercase !tracking-[.04em]",
          description: "!text-white/55",
          success: "!border-l-4 !border-l-brand",
          icon: "!text-brand",
          actionButton: "!h-8 !rounded-none !bg-brand !px-3 !text-[9px] !font-black !uppercase !text-black hover:!bg-[#d99f00]",
          closeButton: "!border-brand/60 !bg-[#111212] !text-white hover:!bg-[#111212] hover:!text-brand",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
