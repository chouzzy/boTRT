// Salve como src/theme.ts ou src/app/theme.ts

import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"



const config = defineConfig({
    theme: {
        tokens: {
            colors: {
                whatsapp: { value: "#25D366" }, // Cor do WhatsApp
                instagram: { value: "#E4405F" }, // Cor do Instagram
                facebook: { value: "#1877F2" }, // Cor do Facebook
                twitter: { value: "#1DA1F2" }, // Cor do Twitter
                linkedin: { value: "#0077B5" }, // Cor do LinkedIn
                fullBlack: { value: "#000000" },
                black: { value: "#1A202C" }, // Preto padrão Chakra (quase preto)
                white: { value: "#FFFFFF" },
                ghostWhite: { value: "#F0EFF4" }, // Branco fantasma (quase branco)
                cadetBlue: { value: "#54b9c9" }, // Azul cadete (azul claro)
                gunMetal:{value:'#292f36'},
                roseWood: { value: "#570A0A" }, // Madeira de rosa (vermelho escuro)
                brand: { // Sua cor de destaque
                    // ... (sua escala de cores brand)
                    50: { value: "#FFF5F5" },
                    100: { value: "#FFD6D6" },
                    200: { value: "#FFB7B7" },
                    300: { value: "#FF9998" },
                    400: { value: "#FF7A79" },
                    500: { value: "#FF5F5E" },
                    600: { value: "#E55554" },
                    700: { value: "#CC4B4A" },
                    800: { value: "#B24140" },
                    900: { value: "#993736" },
                }
                // Cores padrão 'gray', 'blue', etc., vêm do defaultConfig
            },
            // fonts: { heading: { value: ... }, body: { value: ... } },
        },
        // --- Tokens Semânticos (para Light/Dark Mode) ---
        semanticTokens: {
            colors: {
                // Cor de fundo principal da página/body
                bodyBg: {
                    value: { base: "#18181baa", _dark: "#18181baa" }
                },
                preHeaderBg: {
                    value: { base: "white", _dark: "white" }
                },
                invertedColor: {
                    value: { base: "black", _dark: "black" }
                },
                spinnerColor: {
                    value: { base: "white", _dark: "white" }
                },
                // Cor principal do texto no corpo
                textPrimary: {
                    value: { base: "{colors.whiteAlpha.900}", _dark: "{colors.whiteAlpha.900}" }
                },
                // Cor de texto secundária/mais clara
                textSecondary: {
                    value: { base: "{colors.gray.400}", _dark: "{colors.gray.400}" }
                },
                // Cor de fundo do cabeçalho (Exemplo)
                headerBg: {
                    value: { base: "black", _dark: "black" }
                },
                // Cor do texto no cabeçalho (Exemplo)
                headerText: {
                    value: { base: "{colors.textPrimary}", _dark: "{colors.textPrimary}" }
                },
                // Cor de destaque (sua cor #FF5F5E)
                accent: {
                    value: { base: "{colors.brand.400}", _dark: "{colors.brand.400}" }
                },
                // Cor para bordas discretas
                borderSubtle: {
                    value: { base: "{colors.whiteAlpha.300}", _dark: "{colors.whiteAlpha.300}" }
                },
                // Cor de fundo para elementos como cards
                cardBg: {
                    value: { base: "{colors.gray.900}", _dark: "{colors.gray.900}" }
                },
                buttonBg: {
                    value: { base: "{colors.brand.500}", _dark: "{colors.brand.500}" }
                },
                buttonBgHover: {
                    value: { base: "{colors.cadetBlue}", _dark: "{colors.cadetBlue}" }
                },
                buttonDarkBgHover: {
                    value: { base: "black", _dark: "black" }
                },
                buttonColor: {
                    value: { base: "white", _dark: "white" }
                },
                buttonDarkColor: {
                    value: { base: "black", _dark: "black" }
                },
                buttonColorHover: {
                    value: { base: "black", _dark: "black" }
                },
                buttonDarkColorHover: {
                    value: { base: "white", _dark: "white" }
                },
                brandBg: {
                    value: { base: "#040404", _dark: "#040404" }
                },
                borderColor: {
                    value: { base: "#FFFFFF22", _dark: "#FFFFFF22" }
                },
                headerColor: {
                    value: { base: "#9E9E9E", _dark: "#9E9E9E" }
                },
                mainColor: {
                    value: { base: "white", _dark: "white" }
                },
                mainSubColor: {
                    value: { base: "#9E9E9E", _dark: "#9E9E9E" }
                },
                showCaseBg:{
                    value: { base: "{colors.gray.900}", _dark: "{colors.gray.900}" }
                },
                showCaseBorder:{
                    value: { base: "#13141588", _dark: "#13141588" }
                },
                footerBg: {
                    value: { base: "#18181C", _dark: "#18181C" }
                },
                footerColor: {
                    value: { base: "#9E9E9E", _dark: "#9E9E9E" }
                },
                footerHeaderColor: {
                    value: { base: "white", _dark: "white" }
                },
                bottomFooterBg: {
                    value: { base: "black", _dark: "black" }
                },
                bottomFooterColor: {
                    value: { base: "#9E9E9E", _dark: "#9E9E9E" }
                },
                bottomFooterHeaderColor: {
                    value: { base: "white", _dark: "white" }
                },
                bottomFooterIconBg: {
                    value: { base: "{colors.gray.900}", _dark: "{colors.gray.900}" }
                },
                bottomFooterIconBgHover: {
                    value: { base: "{colors.gray.700}", _dark: "{colors.gray.700}" }
                },
                brandGradient: {
                    value: { base: '#FF5251', _dark: "#FF5251" }
                }
                // ... adicione outros tokens semânticos ...
            }
        },

    },
    globalCss: {
        "html, body": {
            margin: '0',
            padding: '0',
            bgColor: '#00000000',
            zIndex:-2
        },
    },
})

// // 2. Definições do Tema Customizado
// const customTheme = {
//     theme: {
//         // --- Tokens Base ---
//         globalCss: {
//             "html, body": {
//                 margin: 550,
//                 padding: 550,
//             },
//         },
//         tokens: {
//             colors: {
//                 black: { value: "#1A202C" }, // Preto padrão Chakra (quase preto)
//                 white: { value: "#FFFFFF" },
//                 brand: { // Sua cor de destaque
//                     // ... (sua escala de cores brand)
//                     50: { value: "#FFF5F5" },
//                     100: { value: "#FFD6D6" },
//                     200: { value: "#FFB7B7" },
//                     300: { value: "#FF9998" },
//                     400: { value: "#FF7A79" },
//                     500: { value: "#FF5F5E" },
//         D            600: { value: "#E55554" },
//                     700: { value: "#CC4B4A" },
//                     800: { value: "#B24140" },
//                     900: { value: "#993736" },
//                 }
//                 // Cores padrão 'gray', 'blue', etc., vêm do defaultConfig
//             },
//             // fonts: { heading: { value: ... }, body: { value: ... } },
//         },
//         // --- Tokens Semânticos (para Light/Dark Mode) ---
//         semanticTokens: {
//             colors: {
//                 // **CORES PARA O BODY**
//                 bodyBg: { // Cor de fundo do corpo da página
//                     default: { value: "white" },      // Branco no modo claro
//                     _dark: { value: "gray.800" }    // Cinza escuro no modo escuro
//                 },
//                 textBody: { // Cor principal do texto no corpo
//                     default: { value: "gray.800" },   // Quase preto no modo claro
//                     _dark: { value: "whiteAlpha.900" } // Quase branco no modo escuro
//                 },

//                 // **CORES PARA O HEADER** (Exemplo - ajuste conforme seu design)
//                 headerBg: { // Cor de fundo do cabeçalho
//                     // Exemplo: Fundo branco/cinza igual ao body, mas pode ser diferente
//                     default: { value: "white" },
//                     _dark: { value: "gray.800" }
//                     // Ou poderia ser uma cor sólida diferente:
//                     // default: { value: "gray.100" },
//                 _dark: { value: "gray.700" }
//                 },
//                 headerText: { // Cor do texto no cabeçalho
//                     // Geralmente igual ao texto principal, mas pode variar
//                     default: { value: "gray.800" },
//                     _dark: { value: "whiteAlpha.900" }
//                 },

//                 // Tokens já definidos (mantidos)
//                 textSecondary: {
//                     default: { value: "gray.600" },
//                     _dark: { value: "gray.400" }
//                 },
//                 accent: { // Sua cor de destaque
//                     default: { value: "brand.500" },
//                     _dark: { value: "brand.400" }
//                 },
//                 borderSubtle: {
//                     default: { value: "gray.200" },
//                     _dark: { value: "whiteAlpha.300" }
//                 },
//                 cardBg: { // Exemplo para fundo de cards
//                     default: { value: "gray.50" },
//                     _dark: { value: "gray.700" }
// This           }
//                 // ... adicione outros tokens semânticos conforme precisar ...
//             }
//         }
//     },

// }

// 3. Cria o Sistema de Tema
// Passamos a config como primeiro argumento e as customizações como segundo
const system = createSystem(defaultConfig, config)

export default system // Exporta o sistema criado