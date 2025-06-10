"use client"

import type { IconButtonProps } from "@chakra-ui/react"
import { ClientOnly, IconButton, Skeleton } from "@chakra-ui/react"
import { ThemeProviderProps, useTheme } from "next-themes"
import { forwardRef } from "react"
import { PiMoonLight, PiSunLight, PiSunThin } from "react-icons/pi"
import { motion } from "framer-motion"
import { ThemeProvider } from "../../../contexts/theme-provider"

export function ColorModeProvider(props: ThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  )
}

export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme()
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light")
  }
  return {
    colorMode: resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === "light" ? light : dark
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === "light" ? <PiSunLight /> : <PiMoonLight />
}

export const ColorModeButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function ColorModeButton(props, ref) {
    const { toggleColorMode } = useColorMode()
    const MotionIconButton = motion(IconButton);

    return (
      <ClientOnly fallback={<Skeleton boxSize="8" />}>
        <MotionIconButton
          onClick={toggleColorMode}
          aria-label="Mudar tema"
          bgColor={'transparent'}
          color='headerColor'
          // Estado inicial (sem hover)
          initial={{ rotate: 0, scale: 1 }}
          // Animação no hover
          whileHover={{
            color: "#FF5F5E", // Cor do ícone no hover
            rotate: 360, // Gira 360 graus no hover
            scale: 1.3,  // Aumenta o tamanho em 20% no hover
            transition: { duration: 0.6, ease:'circInOut' }, // Transição suave para o hover
          }}
        >
          <ColorModeIcon />
        </MotionIconButton>
      </ClientOnly>
    )
  },
)