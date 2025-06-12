import { createListCollection, Flex, Text } from "@chakra-ui/react";
import { select } from "framer-motion/client";
import { PiDownloadFill, PiLink, PiMagnifyingGlassFill, PiNumberCircleOne, PiNumberCircleOneFill, PiNumberCircleTwoFill, PiShareFat, PiShareFatFill } from "react-icons/pi";

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
export const newSearch = {
    title: <Flex> <Text> Nova busca </Text></Flex>,
    description: 'Selecione o tipo de operação que deseja realizar e faça o upload da planilha dados necessários. O BoTRT irá coletar as informações diretamente do portal do TRT e gerar uma nova planilha com os dados atualizados.',
    input: <Flex w='100%' color={'ghostWhite'} alignItems={'center'} gap={4}> <PiNumberCircleTwoFill color="#ff5f5e" size={32} />  Clique ou arraste a planilha na área abaixo:</Flex>,
    inputDescription: <Flex w='100%' color={'ghostWhite'}> Solte seu Arquivo Excel Aqui</Flex>,
    downloadButton: 'Baixar Planilha Modelo',
    downloadLink: 'https://drive.usercontent.google.com/download?id=1ZLS1CNXeZBRsV4APt23kwtZUQmn0MaMv&export=download&authuser=0&confirm=t&uuid=6fbc74a2-606f-4ccc-b164-1d478c4b892a&at=APZUnTXt38cD9f3X8IyPl7qd-cke:1724260892790',
    select: <Flex w='100%' color={'ghostWhite'} alignItems={'center'} gap={4}> <PiNumberCircleOneFill color="#ff5f5e" size={32} />  Selecione o tipo de operação:</Flex>
}
export const operations = createListCollection({
  items: [
    {
      title: 'Minha Pauta',
      description: 'Importa os processos da sua pauta de audiência.',
      icon: <PiNumberCircleOne size={32} color="#FF5F5E" />,
      value: 'Minha Pauta',
    },
    {
      title: 'Processos Arquivados',
      description: 'Importa os processos arquivados do seu painel.',
      icon: <PiNumberCircleTwoFill size={32} color="#FF5F5E" />,
      value: 'Arquivados',
    },
    {
        title: 'Acervo Geral',
        description: 'Importa os processos do acervo geral do TRT.',
        icon: <PiMagnifyingGlassFill size={32} color="#FF5F5E" />,
        value: 'Acervo Geral',
    }
  ],
})
// Interface para os itens de navegação
export interface NavItem {
    label: string;
    href: string;
}

// Dados de exemplo para os links
const mainNavItems: NavItem[] = [
    { label: 'Página inicial', href: '/' },
    { label: 'Nova Busca', href: '/NewSearch' },
    { label: 'Histórico de Buscas', href: '/SearchHistory' },
    { label: 'Buscas Agendadas', href: '/ScheduleSearch' },
    { label: 'Configurações', href: '/SettingsPage' },
    { label: 'Licença e Ativação', href: '/LicensePage' },
];

const supportNavItems: NavItem[] = [
    { label: 'SUPORTE', href: '/SupportPage' },
    { label: 'CONTATO', href: '/ContactPage' },
];

export const sideBar = {
    mainNavItems,
    supportNavItems
};