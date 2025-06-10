/** @type {import('next').NextConfig} */
module.exports = {
  
  // 1. output: 'export'
  output: 'export', // <<--- PROBLEMA PRINCIPAL COM APP ROUTER DINÂMICO

  // 2. distDir
  distDir: process.env.NODE_ENV === 'production' ? '../app' : '.next', // <<--- PODE CONFUNDIR O NEXTRON/ELECTRON

  // 3. trailingSlash
  trailingSlash: true, // Geralmente ok, mas pode simplificar removendo se não for requisito

  // 4. images
  images: {
    unoptimized: true, // CORRETO para Electron
  },

  webpack: (config) => { // Geralmente não precisa mexer para Nextron básico
    return config
  },
}