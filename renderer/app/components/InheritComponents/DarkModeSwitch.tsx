'use client'

import {  IconButton } from '@chakra-ui/react'
import { useColorMode } from '../ui/color-mode'
import { PiMoon, PiSun } from 'react-icons/pi'

export const DarkModeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  return (
    <IconButton
      position="fixed"
      top={4}
      right={4}
      aria-label="Toggle Theme"
      colorScheme="green"
      onClick={toggleColorMode}
    >
      {isDark ? <PiSun /> : <PiMoon />}
    </IconButton>
  )
}
