import { apiResponseArquivadosProps } from "../../../types/audiencias";



interface Data {
    day: string;
    month: string;
    year: string;
}



async function filtrarPorData(listaDeDados: apiResponseArquivadosProps, dataInicial: Data, dataFinal: Data) {


    const dataInicialFormatada = new Date(`${dataInicial.year}-${dataInicial.month}-${dataInicial.day}`);
    const dataFinalFormatada = new Date(`${dataFinal.year}-${dataFinal.month}-${dataFinal.day}`);

    const identifier = listaDeDados.identifier

    
    const listaDeDadosFiltrada = listaDeDados.excelData.filter(item => {
        // Converter a data de arquivamento para um objeto Date
        const dataArquivamento = new Date(item.dataArquivamento);
        
        // Comparar com as datas inicial e final
        return dataArquivamento >= dataInicialFormatada && dataArquivamento <= dataFinalFormatada;
    });
    
    const listaFinal:apiResponseArquivadosProps = {
        excelData: listaDeDadosFiltrada,
        identifier
    }

    return listaFinal
}

export { filtrarPorData }