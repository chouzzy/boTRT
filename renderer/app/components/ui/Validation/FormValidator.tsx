import * as yup from 'yup';

const trts = [
    'TRT-1',
    'TRT-2',
    'TRT-3',
    'TRT-4',
    'TRT-5',
    'TRT-6',
    'TRT-7',
    'TRT-8',
    'TRT-9',
    'TRT-10',
    'TRT-11',
    'TRT-12',
    'TRT-13',
    'TRT-14',
    'TRT-15',
    'TRT-16',
    'TRT-17',
    'TRT-18',
    'TRT-19',
    'TRT-20',
    'TRT-21',
    'TRT-22',
    'TRT-23',
    'TRT-24',
]

const pautas = [
    'Minha pauta',
    'Processos arquivados',
    'Pendentes de manifestação',
    'Acervo geral',
]

export const trtSchema = yup.object().shape({
    username: yup.string().required("Usuário inválido"),
    password: yup.string().required("Senha inválida"),
    trt: yup.string().oneOf(trts, "Escolha um TRT para realizar a pesquisa").required("TRT inválido"),
    painel: yup.string().oneOf(pautas, "Escolha um painel para realizar a pesquisa: Minha pauta, Processos arquivados, Pendentes de manifestação, Acervo Geral").required("Painel inválido")
});

export const trtSchemaImportOperation = yup.object().shape({
    filePath: yup.string().required("Caminho de arquivo inválido"),
    painel: yup.string().oneOf(pautas, "Escolha um painel para realizar a pesquisa: Minha pauta, Processos arquivados, Pendentes de manifestação, Acervo Geral").required("Painel inválido")
});


