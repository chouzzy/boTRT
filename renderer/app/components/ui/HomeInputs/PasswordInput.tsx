'use client'

// import { FormControl, FormLabel, Input } from "@chakra-ui/react"

// interface PasswordInputProps {
//     setPassword: React.Dispatch<React.SetStateAction<string>>
// }

// export function PasswordInput({ setPassword }: PasswordInputProps) {

//     return (
//         <FormControl
//             isRequired={true}
//         >
//             <FormLabel
//                 fontSize={'0.875rem'}
//                 fontWeight={'700'}
//                 letterSpacing={'5%'}
//                 color={'white'}
//             >
//                 Senha TRT
//             </FormLabel>

//             <Input
//                 id='#password'
//                 type='password'
//                 p={1}
//                 color={'black'}
//                 bg={'white'}
//                 _hover={{ bg: 'purple.600', color: 'white' }}
//                 onChange={(event) => { setPassword(event.target.value) }}
//             />
//         </FormControl>
//     )
// }