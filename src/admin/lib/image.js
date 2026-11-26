import { api } from "./api";

const load = (file) =>
   new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
         URL.revokeObjectURL(url);
         resolve(image);
      };
      image.onerror = () => {
         URL.revokeObjectURL(url);
         reject(new Error("Cette image ne peut pas être lue. Utilisez un fichier PNG, JPEG ou WebP."));
      };
      image.src = url;
   });

const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

// Met l'image à la largeur voulue, en WebP quand le navigateur sait l'écrire, et l'allège jusqu'à 3,5 Mo au plus.
export const uploadImage = async (file, width, maxHeight = 6000) => {
   const image = await load(file);
   const scale = Math.min(1, width / image.naturalWidth, maxHeight / image.naturalHeight);
   const canvas = document.createElement("canvas");
   canvas.width = Math.round(image.naturalWidth * scale);
   canvas.height = Math.round(image.naturalHeight * scale);
   const context = canvas.getContext("2d");
   context.imageSmoothingQuality = "high";
   context.drawImage(image, 0, 0, canvas.width, canvas.height);
   let blob = null;
   for (const quality of [0.82, 0.7, 0.55]) {
      blob = await toBlob(canvas, "image/webp", quality);
      if (blob && blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", quality);
      if (blob && blob.size < 3_500_000) break;
   }
   if (!blob || blob.size > 3_900_000) throw new Error("L'image reste trop lourde : réduisez-la avant de l'ajouter.");
   const params = new URLSearchParams({ name: file.name, w: canvas.width, h: canvas.height });
   return api.upload(`medias?${params}`, blob);
};
