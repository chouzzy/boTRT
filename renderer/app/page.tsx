'use client'

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useLoading } from "renderer/contexts/LoadingContext";
import { WelcomeSection } from "./components/layout/WelcomeSection"


export default function Home() {
  const { stopLoading } = useLoading();
  const pathname = usePathname();

  // Efeito para PARAR o loading quando a rota muda e o componente é renderizado
  useEffect(() => {
    // Um pequeno timeout para dar tempo da animação de fade-in da página acontecer
    const timer = setTimeout(() => {
      stopLoading();
    }, 300); // Ajuste este tempo se necessário

    return () => clearTimeout(timer);
  }, [pathname, stopLoading]); // Roda toda vez que o pathname muda


  return <WelcomeSection />
}