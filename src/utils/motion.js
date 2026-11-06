// Courbe d'arrivée commune à tout le site (décélération franche, sans rebond).
export const EASE = [0.16, 1, 0.3, 1];

// Une entrée se joue une seule fois, dès que l'élément entre d'environ 5 % dans la fenêtre :
// le contenu est déjà posé quand le regard l'atteint.
export const VIEWPORT = { once: true, margin: "0px 0px -5% 0px" };

// Ressort amorti des réactions au pointeur (inclinaison, aimant) : il suit vite et se pose sans osciller.
export const SPRING = { stiffness: 190, damping: 24, mass: 0.6 };
