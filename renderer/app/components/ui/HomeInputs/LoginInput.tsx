'use client'

// import { FormControl, FormLabel, Input } from "@chakra-ui/react"

// interface LoginInputProps {
//     setUsername: React.Dispatch<React.SetStateAction<string>>
// }

// export function LoginInput({setUsername}:LoginInputProps) {

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
//                 Digite o login TRT
//             </FormLabel>
//             <Input
//                 id='#username'
//                 type='username'
//                 p={1}
//                 color={'black'}
//                 bg={'white'}
//                 _hover={{ bg: 'purple.600', color: 'white' }}
//                 onChange={(event) => { setUsername(event.target.value) }}
//             />
//         </FormControl>
//     )
// }