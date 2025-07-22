// renderer/components/providers/Auth0ProviderForDesktop.tsx
'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';

export const Auth0ProviderForDesktop = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const audience = process.env.NEXT_PUBLIC_API_AUDIENCE;

  if (!domain || !clientId || !audience) {
    // Idealmente, mostrar uma tela de erro aqui
    return null;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: 'botrt://callback', // A URL que configuramos no Auth0
        audience: audience, // Pede o token para a nossa API
      }}
      // A MUDANÇA: Esta propriedade ajusta o fluxo de autenticação
      // para ser mais compatível com o ambiente de desktop, resolvendo o erro "Invalid state".
      useRefreshTokens={false}
    >
      {children}
    </Auth0Provider>
  );
};
