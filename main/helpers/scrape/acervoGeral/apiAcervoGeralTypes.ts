interface AcervoGeral {
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

interface ApiAcervoGeralResponse {
    pagina: number;
    tamanhoPagina: number;
    qtdPaginas: number;
    totalRegistros: number;
    resultado: AcervoGeral[];
    identificadorRequisicao: string;
    codigoErro: string;
    mensagem: string
}
