import { ApiMinhaPautaResponse, Audiencia } from "../helpers/scrape/minhaPauta/apiMinhaPautaTypes";
import { AcervoGeralSimplificado } from "./acervoGeral";
import { credentials } from "./generalTypes";


export interface apiResponseArquivadosProps {
  excelData: ProcessosArquivadosSimplificado[]
  identifier: {
    trt: string;
    grau: string;
  };
}


export interface excelDataIdentified {

  excelData: AudienciaSimplificada[] | ProcessosArquivadosSimplificado[] | AcervoGeralSimplificado[]
  identifier: {
    trt: string;
    grau: string;
  };
}

export interface ProcessosArquivadosSimplificado {
  type: "Processos arquivados",
  usuario: credentials["user"]
  numeroProcesso: string
  nomeParteAutora: string
  nomeParteRe: string
  dataArquivamento: string

}
export interface AudienciaSimplificada {
  type: "Minha pauta"
  usuario: credentials["user"],
  numeroProcesso: Processo["numero"];
  tipoAudiencia: TipoAudiencia["descricao"];
  orgaoJulgador: OrgaoJulgador["descricao"];
  dataInicio: PautaAudiencia["dataInicio"];
  dataFim: PautaAudiencia["dataFim"];
  poloAtivo: PautaAudiencia["poloAtivo"]["nome"]
  poloPassivo: PautaAudiencia["poloPassivo"]["nome"]
  urlAudienciaVirtual?: PautaAudiencia["urlAudienciaVirtual"]
}


export interface PautaAudienciaResponse {
  pagina: number;
  tamanhoPagina: number;
  qtdPaginas: number;
  totalRegistros: number;
  resultado: PautaAudiencia[];
}

interface PautaAudiencia {
  id: number;
  dataInicio: string;
  dataFim: string;
  salaAudiencia: SalaAudiencia;
  status: string;
  processo: Processo;
  tipo: TipoAudiencia;
  designada: boolean;
  emAndamento: boolean;
  poloAtivo: Polo;
  poloPassivo: Polo;
  pautaAudienciaHorario: PautaAudienciaHorario;
  statusDescricao: string;
  idProcesso: number;
  nrProcesso: string;
  urlAudienciaVirtual?: string;
}

interface SalaAudiencia {
  nome: string;
}

interface Processo {
  id: number;
  numero: string;
  classeJudicial: ClasseJudicial;
  segredoDeJustica: boolean;
  juizoDigital: boolean;
  orgaoJulgador: OrgaoJulgador;
}

interface ClasseJudicial {
  id: number;
  codigo: string;
  descricao: string;
  sigla: string;
  requerProcessoReferenciaCodigo: string;
  controlaValorCausa: boolean;
  podeIncluirAutoridade: boolean;
  pisoValorCausa: number;
  tetoValorCausa?: number;
  ativo: boolean;
  idClasseJudicialPai?: number;
  possuiFilhos: boolean;
}

interface OrgaoJulgador {
  id: number;
  descricao: string;
  cejusc: boolean;
  ativo: boolean;
  postoAvancado: boolean;
  novoOrgaoJulgador: boolean;
  codigoServentiaCnj: number;
}

interface TipoAudiencia {
  id: number;
  descricao: string;
  codigo: string;
  isVirtual: boolean;
}

interface Polo {
  nome: string;
  polo: string;
  poloEnum: string;
  representaVarios: boolean;
}

interface PautaAudienciaHorario {
  id: number;
  horaInicial: string;
  horaFinal: string;
}
