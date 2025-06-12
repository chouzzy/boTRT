import { Flex } from "@chakra-ui/react";
import { CustomText } from "../components/ui/CustomText";
import { PiBarricadeFill } from "react-icons/pi";


export default function ScheduleSearchPage() {

    return (
        <Flex w='100%' h='100vh' justifyContent='center' alignItems='center' flexDir='column' gap={4}>
            
                <CustomText text='Em construção' fontSize='2xl' fontWeight='semibold' textTransform='uppercase' />
                <PiBarricadeFill color="yellow" size={48}/>
            
        </Flex>
    )
}