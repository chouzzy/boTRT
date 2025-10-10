import type { Metadata } from 'next';
import React from 'react';

// Styles
import './global.css';

// Fonts
import { Oswald, Roboto, Bebas_Neue, Open_Sans, Comfortaa, Maven_Pro } from 'next/font/google';

// UI Components
import { WindowButtons } from './components/ui/WindowButtons';
import { LoadingScreen } from './components/ui/LoadingScreen';

// Layout Components
import { SideMenu } from './components/layout/SideMenu';

// Chakra UI Components
import { Flex } from '@chakra-ui/react';

// Providers
import Providers from "./providers";
import { LoadingProvider } from 'renderer/contexts/LoadingContext';
import { EagerPrefetcher } from './components/utils/EagerPrefetcher';
import { Auth0ProviderForDesktop } from './components/providers/Auth0ProviderForDesktop';
import { AuthenticationGuard } from './components/auth/AuthenticationGuard';
import { AuthProvider } from 'renderer/contexts/AuthContext';

const maven_pro = Maven_Pro({
  subsets: ['latin'],
  variable: '--font-maven-pro',
});
const oswald = Oswald({ subsets: ['latin'] });
const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});
const comfortaa = Comfortaa({ subsets: ['latin'] });
const bebas_neue = Bebas_Neue({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-bebas-neue',
});
const open_sans = Open_Sans({ subsets: ['latin'] });

export const metadata: Metadata = { title: 'BoTRT Awer' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className={maven_pro.className} suppressHydrationWarning>
      <body style={{ borderRadius: '40px' }}>
        <Providers>
            
                <LoadingScreen />

                <Flex
                  w='100%'
                  h='100%'
                  bgImage={'url(background/bg.png)'}
                  bgColor={'blue.950'}
                  bgPos={'center'}
                  bgSize={'cover'}
                  justifyContent='center'
                  alignItems='start'
                  color='ghostWhite'
                  pos={'relative'}
                  borderRadius={40}
                >
                  <Flex
                    w='100%'
                    h={28}
                    pos={'absolute'}
                    top={0}
                    className='draggable-region'
                    zIndex={0}
                  />
                  <EagerPrefetcher />
                  <AuthenticationGuard>
                    <>
                      <SideMenu />
                      {children}
                    </>
                  </AuthenticationGuard>
                </Flex>
                <WindowButtons />
        </Providers>
      </body>
    </html >
  );
}

