import { apiResponseAcervoGeralProps } from "../../../types/acervoGeral";
import { apiResponseArquivadosProps } from "../../../types/audiencias";



interface Data {
    day: string;
    month: string;
    year: string;
}



async function filtrarPorData(listaDeDados: apiResponseAcervoGeralProps, dataInicial: Data, dataFinal: Data) {


    const dataInicialFormatada = new Date(`${dataInicial.year}-${dataInicial.month}-${dataInicial.day}`);
    const dataFinalFormatada = new Date(`${dataFinal.year}-${dataFinal.month}-${dataFinal.day}`);

    const identifier = listaDeDados.identifier


    const listaDeDadosFiltrada = listaDeDados.excelData.filter(item => {
        // Converter a data de arquivamento para um objeto Date
        const dataArquivamento = new Date(item.dataAutuacao);
        // console.log('dataInicialFormatada')
        // console.log(dataInicialFormatada)
        // console.log('dataFinalFormatada')
        // console.log(dataFinalFormatada)

        // Comparar com as datas inicial e final
        return dataArquivamento >= dataInicialFormatada && dataArquivamento <= dataFinalFormatada;
    });

    const listaFinal: apiResponseAcervoGeralProps = {
        excelData: listaDeDadosFiltrada,
        identifier
    }

    return listaFinal
}
export { filtrarPorData }