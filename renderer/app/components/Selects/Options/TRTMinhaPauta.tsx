


export function TRTMinhaPauta() {

    const trtsMinhaPauta = [
        'Selecione',
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

    return (
        <>
            {
                trtsMinhaPauta.map((trt, index) => {
                    return (
                        <option key={index} style={{ color: 'black' }}>{trt}</option>
                    )
                })
            }
        </>
    )

}