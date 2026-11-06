// Lance une tâche secondaire une fois la page affichée, quand le navigateur est au repos (1,2 s au plus tard).
// Renvoie la fonction d'annulation, à retourner telle quelle depuis un useEffect.
export const afterPaint = (task, timeout = 1200) => {
   if (window.requestIdleCallback) {
      const id = window.requestIdleCallback(task, { timeout });
      return () => window.cancelIdleCallback(id);
   }
   const id = window.setTimeout(task, 500);
   return () => window.clearTimeout(id);
};
