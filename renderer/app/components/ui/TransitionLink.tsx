// Salve como, por exemplo, src/app/components/ui/TransitionLink.tsx
'use client';

import NextLink, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import React, { ReactNode } from 'react';
import { useLoading } from 'renderer/contexts/LoadingContext';

interface TransitionLinkProps extends LinkProps {
  children: ReactNode;
  // Adicione outras props que você possa querer passar para o Link
  className?: string;
  style?: React.CSSProperties;
}

export function TransitionLink({ children, href, ...rest }: TransitionLinkProps) {
  const { startLoading } = useLoading();
  const currentPath = usePathname();

  const handleClick = () => {
    console.log('Navegando para:', href);
    // Só inicia o loading se o destino for diferente da página atual
    if (href !== currentPath) {
      startLoading();
    }
    // A navegação do Next.js continuará normalmente
  };
  

  return (
    <NextLink href={href} onClick={handleClick} {...rest}>
      {children}
    </NextLink>
  );
}
