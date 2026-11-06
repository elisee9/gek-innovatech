import { useRef } from "react";

// Vrai dès que le texte diffère de celui du montage, c'est-à-dire après un changement de langue, et le reste ensuite :
// le texte traduit s'affiche tout de suite, sans rejouer l'animation d'entrée, même au retour à la première langue.
const useTextChanged = (text) => {
   const first = useRef(text);
   const changed = useRef(false);
   if (text !== first.current) changed.current = true;
   return changed.current;
};

export default useTextChanged;
