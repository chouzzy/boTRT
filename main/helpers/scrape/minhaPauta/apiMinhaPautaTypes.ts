export interface SalaAudiencia {
    nome: string;
}

export interface ClasseJudicial {
    id: number;
    codigo: string;
    descricao: string;
    sigla: string;
    requerProcessoReferenciaCodigo: string;
    controlaValorCausa: boolean;
    podeIncluirAutoridade: boolean;
    pisoValorCausa: number;
    tetoValorCausa: number;
    ativo: boolean;
    idClasseJudicialPai: number;
    possuiFilhos: boolean;
}

export interface Processo {
    id: number;
    numero: string;
    classeJudicial: ClasseJudicial;
    segredoDeJustica: boolean;
    juizoDigital: boolean;
    orgaoJulgador: OrgaoJulgador
}

export interface OrgaoJulgador {
    id: number;
    descricao: string;
    cejusc: boolean;
    ativo: boolean;
    postoAvancado: boolean;
    novoOrgaoJulgador: boolean;
    codigoServentiaCnj: number;
};

export interface Polo {
    nome: string;
    polo: string;
    poloEnum: string;
    representaVarios: boolean;
}

export interface PautaAudienciaHorario {
    id: number;
    horaInicial: string;
    horaFinal: string;
}

export interface Audiencia {
    id: number;
    dataInicio: string;
    dataFim: string;
    salaAudiencia: SalaAudiencia;
    status: string;
    processo: Processo;
    tipo: {
        id: number;
        descricao: string;
        codigo: string;
        isVirtual: boolean;
    };
    designada: boolean;
    emAndamento: boolean;
    poloAtivo: Polo;
    poloPassivo: Polo;
    pautaAudienciaHorario: PautaAudienciaHorario;
    statusDescricao: string;
    idProcesso: number;
    nrProcesso: string;
    urlAudienciaVirtual?: string; // Opcional
}

export interface ApiMinhaPautaResponse {
    pagina: number;
    tamanhoPagina: number;
    qtdPaginas: number;
    totalRegistros: number;
    resultado: Audiencia[];
    identificadorRequisicao: string;
    codigoErro: string;
    mensagem: string
}