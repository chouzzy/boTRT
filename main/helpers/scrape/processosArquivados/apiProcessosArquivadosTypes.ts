interface ProcessoArquivado {
    id: number;
    descricaoOrgaoJulgador: string;
    classeJudicial: string;
    numero: number;
    numeroProcesso: string;
    segredoDeJustica: boolean;
    codigoStatusProcesso: string;
    prioridadeProcessual: number;
    nomeParteAutora: string;
    qtdeParteAutora: number;
    nomeParteRe: string;
    qtdeParteRe: number;
    dataAutuacao: string;
    juizoDigital: boolean;
    dataArquivamento: string;
    temAssociacao?: boolean; // Opcional, baseado no exemplo
}

interface ApiProcessosArquivadosResponse {
    pagina: number;
    tamanhoPagina: number;
    qtdPaginas: number;
    totalRegistros: number;
    resultado: ProcessoArquivado[];
    identificadorRequisicao: string;
    codigoErro: string;
    mensagem: string
}
