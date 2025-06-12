
import * as yup from 'yup';
import { trtSchema } from '../../app/components/ui/Validation/FormValidator';


interface HandleSubmitSingleSearchProps {
    singleSearchData: {
        painel: string,
        initialDate: string,
        finalDate: string,
        setWarningAlert: React.Dispatch<React.SetStateAction<string>>,
        username: string,
        password: string,
        trt: string
    }
}

export async function handleSubmitSingleSearch({ singleSearchData }: HandleSubmitSingleSearchProps) {


    const { painel, initialDate, finalDate, setWarningAlert, username, password, trt } = singleSearchData

    console.log('entramos no handle')

    if ((painel == "Minha pauta") && (!initialDate || !finalDate)) {
        console.log('erro do date')
        return setWarningAlert('Insira a data inicial e a data final')
    }


    const initialDateObj = new Date(initialDate)
    const finalDateObj = new Date(finalDate)

    const date = {
        initial: {
            day: initialDateObj.getDate().toString().padStart(2, '0'),
            month: (initialDateObj.getMonth() + 1).toString().padStart(2, '0'),
            year: initialDateObj.getFullYear().toString(),
        },
        final: {
            day: finalDateObj.getDate().toString().padStart(2, '0'),
            month: (finalDateObj.getMonth() + 1).toString().padStart(2, '0'),
            year: finalDateObj.getFullYear().toString(),
        }
    }

    try {
        switch (painel) {

            case 'Minha pauta':
                await trtSchema.validate({
                    username,
                    password,
                    trt,
                    painel
                })
                break;

            case 'Processos arquivados':

                await trtSchema.validate({
                    username,
                    password,
                    trt,
                    painel
                })

                break;

            case 'Acervo geral':

                await trtSchema.validate({
                    username,
                    password,
                    trt,
                    painel
                })

                break;
        }


    } catch (error) {

        if (error instanceof yup.ValidationError) {
            setWarningAlert(String(error.errors))
        }
        return
    }

    if (painel != 'Minha pauta' &&
        painel != 'Processos arquivados' &&
        painel != 'Pendentes de manifestação' &&
        painel != 'Acervo geral') {
        return alert('Erro de seleção, favor contactar o desenvolvedor.')
    }

    window.ipc.scrapeData({
        username,
        password,
        trt,
        painel,
        date
    })
}