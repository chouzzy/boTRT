'use client'

import { AuthenticationGuard } from "./components/auth/AuthenticationGuard"
import { WelcomeSection } from "./components/layout/WelcomeSection"


export default function Home() {

  return (
    <AuthenticationGuard>
      <WelcomeSection />
    </AuthenticationGuard>
  )
}