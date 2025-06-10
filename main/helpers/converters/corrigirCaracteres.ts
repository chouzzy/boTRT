export const corrigirCaracteres = (texto: string): string => {
    // Substituindo caracteres com acento
    texto = texto.replace(/ÃƒÂº/g, 'ção');
    texto = texto.replace(/Ã‚Âª/g, 'ª');
  
    // Substituindo caracteres especiais
    texto = texto.replace(/ÃƒÂ¬/g, 'o');
    texto = texto.replace(/ÃƒÂ­/g, 'i');
  
    return texto;
  };