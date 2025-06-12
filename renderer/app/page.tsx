'use client'

import { Flex, IconButton } from "@chakra-ui/react";
import { AiOutlineMinus, AiOutlineClose } from "react-icons/ai";
import { WelcomeSection } from "./components/layout/WelcomeSection"
import { PiMinus, PiX } from "react-icons/pi";




export default function Home() {

  const handleMinimize = () => window.ipc.window.minimize();
  const handleMaximize = () => window.ipc.window.maximize();
  const handleClose = () => window.ipc.window.close();

  return (
    <>
      <Flex position="absolute" top="0" right="0" zIndex={10} gap={2}>
        <IconButton
          borderRadius={'none'}
          aria-label="Minimize"
          bgColor={'brand.500'}
          _hover={{bgColor: 'ghostWhite', color: 'brand.500', transition: 'all 0.6s ease-in-out'}}
          color={'ghostWhite'}
          onClick={() => handleMinimize()}
          size="xs"
          colorScheme="gray"
          variant="ghost"
        >
          <PiMinus size={32} />
        </IconButton>
        <IconButton
          borderRadius={'none'}
          aria-label="Close"
          bgColor={'brand.500'}
          _hover={{bgColor: 'ghostWhite', color: 'brand.500', transition: 'all 0.6s ease-in-out'}}
          color={'ghostWhite'}
          onClick={() => handleClose()}
          size="xs"
          colorScheme="red"
          variant="ghost"
        >
          <PiX size={32} />
        </IconButton>
      </Flex>
      <WelcomeSection />
    </>
  )
}