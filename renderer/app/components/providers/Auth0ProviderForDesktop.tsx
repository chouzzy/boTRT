// renderer/components/providers/Auth0ProviderForDesktop.tsx
'use client';

import { Auth0Provider } from '@auth0/auth0-react';

export const Auth0ProviderForDesktop = ({ children }: { children: React.ReactNode }) => {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const audience = process.env.NEXT_PUBLIC_API_AUDIENCE;

  if (!domain || !clientId || !audience) {
    // Idealmente, mostrar uma tela de erro aqui
    return null;
  }
  console.log('Auth0ProviderForDesktop: Configurações carregadas')
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: 'botrt://callback', // A URL que configuramos no Auth0
        audience: audience, // Pede o token para a nossa API
      }}
      
      // A MUDANÇA CRUCIAL:
      // Diz ao provedor para usar o localStorage para guardar e procurar a sessão.
      // É isso que permite que ele encontre os tokens que o background.ts injetou.
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
};
