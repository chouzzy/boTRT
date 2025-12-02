// providers.tsx

"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { ThemeProvider } from "../contexts/theme-provider"
import system from "../theme"
import { ColorModeProvider } from "./components/ui/color-mode"
import { AuthProvider } from "renderer/contexts/AuthContext"
import { Auth0ProviderForDesktop } from "./components/providers/Auth0ProviderForDesktop"
import { LoadingProvider } from "renderer/contexts/LoadingContext"


export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <ThemeProvider
        attribute="class"
        disableTransitionOnChange
        defaultTheme="dark"
        enableSystem={false}
        forcedTheme="dark"
      >
        <Auth0ProviderForDesktop>
          <AuthProvider>
            <LoadingProvider>
              {props.children}
            </LoadingProvider>
          </AuthProvider>
        </Auth0ProviderForDesktop>
      </ThemeProvider>
    </ChakraProvider>
  )
}