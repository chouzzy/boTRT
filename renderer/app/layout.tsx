import type { Metadata } from 'next';
import Providers from "./providers"
import { Flex } from '@chakra-ui/react';
import { SideMenu } from './components/layout/SideMenu';
import { Oswald } from 'next/font/google';

const oswald = Oswald({ subsets: ['latin'] });

export const metadata: Metadata = { title: 'BoTRT Awer' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className={oswald.className} suppressHydrationWarning>
      <body>
        <Providers>
          <Flex w='100vw' h='100vh' bgImage={'url(background/bg.png)'} bgColor={'gray.900'} bgPos={'center'} bgSize={'cover'} justifyContent='center' alignItems='start' letterSpacing={1.5}
            color='ghostWhite'
          >
            <SideMenu />
            {children}
          </Flex>
        </Providers>
      </body>
    </html>
  );
}
