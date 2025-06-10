import { Flex, Text } from "@chakra-ui/react";
import { PiLink, PiShareFat, PiShareFatFill } from "react-icons/pi";

export const homePage = {
        title: <Flex>Bem-vindo ao</Flex>,
        subtitle: <Flex><Flex w='100%' as='span' color={'ghostWhite'}>Bo</Flex>TRT</Flex>,
        description: 'Otimize sua rotina e foque no que realmente importa. O BoTRT automatiza a coleta de dados e o acompanhamento de processos nos portais dos TRTs, entregando todas as informações que você precisa de forma organizada em uma planilha. Deixe o trabalho repetitivo com nosso robô e ganhe mais eficiência para suas análises jurídicas.',
        manual: {
                title: 'Manual do Usuário',
                description: 'O Manual do Usuário é um guia completo que explica como utilizar o BoTRT de forma eficaz. Ele abrange desde a instalação até as funcionalidades avançadas, garantindo que você aproveite ao máximo todas as ferramentas disponíveis.',
                link: ''
        },
        news: {
                title: <Flex alignItems={'center'} gap={2}> <Text>Novidades </Text> <PiShareFatFill color="#FF5F5E" /></Flex>,
                description: 'Fique por dentro das últimas atualizações e melhorias do BoTRT. Aqui você encontrará informações sobre novas funcionalidades, correções de bugs e outras novidades que tornam o BoTRT ainda mais eficiente.',
                link: ''
        },
        callToAction: {
                link: '',
                buttonText: 'Iniciar'
        }
}

// Interface para os itens de navegação
export interface NavItem {
    label: string;
    href: string;
}

// Dados de exemplo para os links
const mainNavItems: NavItem[] = [
    { label: 'Página inicial', href: '/' },
    { label: 'Nova Busca', href: '/item-1' },
    { label: 'Histórico de Buscas', href: '/item-2' },
    { label: 'Buscas Agendadas', href: '/item-3' },
    { label: 'Configurações', href: '/item-4' },
    { label: 'Licença e Ativação', href: '/item-5' },
];

const supportNavItems: NavItem[] = [
    { label: 'SUPORTE', href: '/support' },
    { label: 'CONTATO', href: '/contact' },
];

export const sideBar = {
    mainNavItems,
    supportNavItems
};