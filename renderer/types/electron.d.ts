// renderer/types/electron.d.ts ou src/types/electron.d.ts

// Importe o tipo IpcHandler do seu preload.js
// O caminho de importação aqui é CRUCIAL e depende de onde este arquivo .d.ts está
// em relação ao seu preload.js (que está em 'app/preload.js').
// Se 'app' e 'renderer' (ou 'src') são irmãos na raiz do projeto:
import type { IpcHandler } from '../../main/preload'; // Ajuste este caminho!
// Se você usa alias de caminho no tsconfig.json (ex: @/app/*), use-o se possível.

// Estenda a interface global Window
declare global {
  interface Window {
    ipc: IpcHandler; // Informa ao TypeScript que window.ipc existe e tem o tipo IpcHandler
  }
}

// É importante que este arquivo seja um "módulo" para o TypeScript.
// Se você não tiver nenhum import/export nele (além do declare global),
// adicione um 'export {}' no final para garantir que ele seja tratado como um módulo
// e as declarações globais sejam aplicadas.
// No nosso caso, como já temos um import, ele já é um módulo.
// export {}; // Desnecessário se já houver imports/exports
