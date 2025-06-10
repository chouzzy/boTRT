// 'use client'

// import { Button, Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";

// interface DateInputProps {
//     setInitialDate:React.Dispatch<React.SetStateAction<string>>
//     setFinalDate: React.Dispatch<React.SetStateAction<string>>
// }

// export function DateInput({ setFinalDate, setInitialDate }: DateInputProps) {

//     return (
//         <Flex gap={8} justifyContent={'space-between'}>
//             {/* INPUT DATA INICIAL */}
//             <Flex
//             >
//                 <FormControl
//                     isRequired={true}
//                 >
//                     <FormLabel
//                         fontSize={'0.875rem'}
//                         fontWeight={'700'}
//                         letterSpacing={'5%'}
//                         color={'white'}
//                     >
//                         Selecione a data inicial da pesquisa:
//                     </FormLabel>
//                     <Input
//                         id='#initial-date'
//                         type='datetime-local'
//                         p={2}
//                         color={'black'}
//                         bg={'white'}
//                         _hover={{ bg: 'purple.600', color: 'white' }}
//                         onChange={(event) => { setInitialDate(event.target.value) }}
//                     />
//                 </FormControl>
//             </Flex>

//             {/* INPUT DATA FINAL */}
//             <Flex
//             >
//                 <FormControl
//                     isRequired={true}
//                 >
//                     <FormLabel
//                         fontSize={'0.875rem'}
//                         fontWeight={'700'}
//                         letterSpacing={'5%'}
//                         color={'white'}
//                     >
//                         Selecione a data final da pesquisa:
//                     </FormLabel>
//                     <Input
//                         id='#final-date'
//                         type='datetime-local'
//                         p={2}
//                         color={'black'}
//                         bg={'white'}
//                         _hover={{ bg: 'purple.600', color: 'white' }}
//                         onChange={(event) => { setFinalDate(event.target.value) }}
//                     />
//                 </FormControl>
//             </Flex>

//         </Flex>
//     )
// }