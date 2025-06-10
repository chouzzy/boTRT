import { dateSelected, ScrapeData } from "../../types/generalTypes";

// OPÇÕES:
// Minha pauta
// Processos arquivados
// Acervo Geral
// Pendentes de manifestação


const arquivamentoIdDictPrimeiroGrau = {
    1:"1875275",
    2:"501225",
    3:"383339",
    4:"838725",
    5:"648897",
    6:"",
    7:"",
    8:"253556",
    9:"461557",
    10:"203614",
    11:"",
    12:"",
    13:"269588",
    14:"",
    15:"270289",
    16:"109620",
    17:"326613",
    18:"536746",
    19:"",
    20:"",
    21:"",
    22:"45495",
    23:"515874",
    24:"223158",
}
const arquivamentoIdDictSegundoGrau = {
    1:"414894",
    2:"58972",
    3:"141057",
    4:"225196",
    5:"225148",
    6:"",
    7:"",
    8:"",
    9:"185805",
    10:"37132",
    11:"",
    12:"",
    13:"",
    14:"",
    15:"38798",
    16:"30908",
    17:"92739",
    18:"",
    19:"",
    20:"",
    21:"",
    22:"", 
    23:"91842",
    24:"74249",
}

async function getArquivadosApiId(grau:string, trtDicted: number) {
    
    if (grau == "primeirograu") {
        return arquivamentoIdDictPrimeiroGrau[trtDicted]
    }
    if (grau == "segundograu") {
        return arquivamentoIdDictSegundoGrau[trtDicted]
    }

}




export async function scrapeURL(painel: ScrapeData['painel'],  trt: number, itensPerPage = 1000, grau:string, dateSelected?: dateSelected, processosArquivadosID?:string) {

    // const trtID = await getArquivadosApiId(grau, trt)
    const trtID = processosArquivadosID

    switch (painel) {
        case 'Minha pauta':

            return `https://pje.trt${trt}.jus.br/pje-comum-api/api/pauta-usuarios-externos?dataFim=${dateSelected.final.year}-${dateSelected.final.month}-${dateSelected.final.day}&dataInicio=${dateSelected.initial.year}-${dateSelected.initial.month}-${dateSelected.initial.day}&codigoSituacao=M&numeroPagina=1&tamanhoPagina=${itensPerPage}&ordenacao=asc`

        case 'Processos arquivados':

            return `https://pje.trt${trt}.jus.br/pje-comum-api/api/paineladvogado/${trtID}/processos?pagina=1&tamanhoPagina=${itensPerPage}&tipoPainelAdvogado=5&ordenacaoCrescente=false`
        
        case 'Acervo geral':
            console.log( `Acervo geral!`)
            console.log( `https://pje.trt${trt}.jus.br/pje-comum-api/api/paineladvogado/${trtID}/processos?pagina=1&tamanhoPagina=${itensPerPage}&tipoPainelAdvogado=1&ordenacaoCrescente=false`)
            return `https://pje.trt${trt}.jus.br/pje-comum-api/api/paineladvogado/${trtID}/processos?pagina=1&tamanhoPagina=${itensPerPage}&tipoPainelAdvogado=1&ordenacaoCrescente=false`


        default:
            break;
    }

}
// export async function manageURL(url: string) {


//             return `https://pje.trt${trt}.jus.br/pje-comum-api/api/paineladvogado/${trtID}/processos?pagina=1&tamanhoPagina=${itensPerPage}&tipoPainelAdvogado=5&ordenacaoCrescente=false`


   

// }