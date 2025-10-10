export interface dateSelected {
  initial: {
    day: string,
    month: string,
    year: string,
  },
  final: {
    day: string,
    month: string,
    year: string,
  }
}

type painelProps = 'Minha pauta' | 'Processos arquivados' | 'Pendentes de manifestação' | 'Acervo geral'

export interface ScrapeData {
  username: string,
  password: string,
  trt: string,
  painel: painelProps,
  date: dateSelected
}

export interface credentials {
  user: string,
  password: string
}

export interface PuppeteerResult {
  page: any;
  browser: any;
}

export interface audistProps {
  processo: {
    numero: any;
    orgaoJulgador: { descricao: string; }
  };
  tipo: { descricao: string; }
}
import * as exceljs from 'exceljs';

export interface importDataProps {
  fileBuffer: exceljs.Buffer
  operationType: string
}

export interface scrapeDataListProps {
  trt: string
  trtNumber: number
  username: credentials["user"]
  password: credentials["password"]
  date: {
    initial: {
      day: string;
      month: string;
      year: string;
    };
    final: {
      day: string;
      month: string;
      year: string;
    };
  }
}
export interface processosArquivadosExcelList {
  trt: string
  trtNumber: number
  username: credentials["user"]
  password: credentials["password"]
  date: {
    initial: {
      day: string;
      month: string;
      year: string;
    };
    final: {
      day: string;
      month: string;
      year: string;
    };
  }
}
export interface acervoGeralExcelList {
  trt: string
  trtNumber: number
  username: credentials["user"]
  password: credentials["password"]
  date: {
    initial: {
      day: string;
      month: string;
      year: string;
    };
    final: {
      day: string;
      month: string;
      year: string;
    };
  }
}

export type PuppeteerCallback = (headless: boolean) => Promise<PuppeteerResult>


// Em src/app/helpers/types/generalTypes.ts (ou um novo arquivo de tipos para IPC)

// ... (suas interfaces existentes como dateSelected, importDataProps, ScrapeData) ...

export interface LoadingPayload { // Para o canal 'is-loading'
  isLoading: boolean;
  message?: string; // Opcional: uma mensagem sobre o que está carregando
}

export interface ProcessFinishedPayload { // Para o canal 'process-finished'
  success: boolean;
  message?: string;
  error?: string;
  data?: any; // Pode ser mais específico se o tipo de dado for consistente
}

export interface ProgressPercentualPayload { // Para 'progress-percentual'
  progress: number; // Enviar como número para facilitar no frontend
}

export interface ProcessosEncontradosPayload { // Para 'processos-encontrados'
  count: number;
}

export interface InvalidExcelFormatPayload { // Para 'invalid-excel-format'
  message: string;
  errorCode?: string; // Opcional: se você tiver códigos de erro
}

export interface ProgressMessagesDetailsPayload { // Para 'progress-messages'
  message: string;
  details?: any; // Pode ser um objeto com mais informações
}

// Para 'call-front' - o tipo 'value' dependerá do que você envia
// Se for genérico, pode manter unknown ou criar um tipo base.
// Se for sempre uma string:
export interface CallFrontPayload {
  data: string; // Ou o tipo específico que 'call-front' envia
}

// Para 'login-error'
export interface LoginErrorPayload {
  message: string;
  // outros campos relevantes para o erro de login
}