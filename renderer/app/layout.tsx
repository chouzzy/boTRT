import type { Metadata } from 'next';

// Styles
import './global.css';

// Fonts
import { Oswald } from 'next/font/google';
import { Roboto } from 'next/font/google';
import { Bebas_Neue } from 'next/font/google';
import { Open_Sans } from 'next/font/google';

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

// Fonts
import { Comfortaa } from 'next/font/google';
import { Maven_Pro } from 'next/font/google';

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
          <LoadingProvider>
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
              <WindowButtons />
              <SideMenu />
              {children}
            </Flex>
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
