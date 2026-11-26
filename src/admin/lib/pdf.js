// Devis et factures en PDF, à la charte GEK. Chargé seulement à l'ouverture d'un document.
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import regularUrl from "@fontsource/barlow/files/barlow-latin-400-normal.woff?url";
import semiboldUrl from "@fontsource/barlow/files/barlow-latin-600-normal.woff?url";

const hex = (value) => rgb(...[1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255));
const NAVY = hex("#1d467b");
const RED = hex("#cc2219");
const MUTED = hex("#456189");
const LINE = hex("#d5deea");
const TINT = hex("#f4f6fa");

const WORDS = {
   fr: {
      quote: "Devis", invoice: "Facture", draft: "Brouillon", date: "Date", valid: "Valable jusqu'au", due: "À payer avant le", client: "Client", item: "Désignation", qty: "Qté", price: "Prix unitaire", amount: "Montant",
      gross: "Sous-total", discount: "Remise", net: "Total hors taxes", tax: "TVA", total: "Total", paid: "Déjà payé", left: "Reste à payer", notes: "Remarques", terms: "Conditions", payment: "Règlement", ifu: "IFU", rccm: "RCCM",
      sign: "Bon pour accord (date et signature)", page: (a, b) => `Page ${a} sur ${b}`,
   },
   en: {
      quote: "Quote", invoice: "Invoice", draft: "Draft", date: "Date", valid: "Valid until", due: "Payment due", client: "Client", item: "Description", qty: "Qty", price: "Unit price", amount: "Amount",
      gross: "Subtotal", discount: "Discount", net: "Total excl. tax", tax: "VAT", total: "Total", paid: "Already paid", left: "Balance due", notes: "Notes", terms: "Terms", payment: "Payment", ifu: "Tax ID (IFU)", rccm: "Trade register (RCCM)",
      sign: "Approved (date and signature)", page: (a, b) => `Page ${a} of ${b}`,
   },
};

const CHEVRONS = "M38.9 13.9 L2.81 50 L38.9 86.1 L48.1 76.9 L21.19 50 L48.1 23.1 Z M61.1 13.9 L97.19 50 L61.1 86.1 L51.9 76.9 L78.81 50 L51.9 23.1 Z";

let fonts = null;
const loadFonts = () => {
   fonts ||= Promise.all([regularUrl, semiboldUrl].map((url) => fetch(url).then((response) => response.arrayBuffer()))).catch((error) => {
      fonts = null;
      throw error;
   });
   return fonts;
};

// Barlow (latin) n'a pas tous les caractères : ceux qui manquent sont remplacés par leur équivalent simple.
const safe = (text) =>
   String(text ?? "")
      .replace(/[\u202f\u00a0\u2009\t]/g, " ")
      .replace(/→/g, ">")
      .replace(/[^\n -~¡-ſ–—‘’‚“”„•…€™]/g, "");

export const money = (amount, currency, lang) => {
   const digits = currency === "EUR" && Math.round(amount * 100) % 100 ? 2 : 0;
   const text = new Intl.NumberFormat(lang === "en" ? "en-GB" : "fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(amount || 0);
   return safe(currency === "EUR" ? (lang === "en" ? `€${text}` : `${text} €`) : `${text} FCFA`);
};

const longDate = (value, lang) => (value ? new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`)) : "");

export const buildPdf = async (document, company, contact) => {
   const t = WORDS[document.lang] || WORDS.fr;
   const pdf = await PDFDocument.create();
   pdf.registerFontkit(fontkit);
   const [regularBytes, semiboldBytes] = await loadFonts();
   const regular = await pdf.embedFont(regularBytes, { subset: true });
   const bold = await pdf.embedFont(semiboldBytes, { subset: true });
   const label = `${t[document.type]} ${document.number || `(${t.draft.toLowerCase()})`}`;
   pdf.setTitle(`${label} - ${company.name}`);
   pdf.setAuthor(company.name);
   pdf.setCreator(company.name);
   pdf.setProducer(company.name);

   const W = 595.28;
   const H = 841.89;
   const M = 48;
   const BOTTOM = 84;
   let page;
   let y;

   const put = (text, x, top, { size = 10, font = regular, color = NAVY, right = false } = {}) => {
      const clean = safe(text);
      page.drawText(clean, { x: right ? x - font.widthOfTextAtSize(clean, size) : x, y: top, size, font, color });
   };
   const wrap = (text, width, { size = 10, font = regular } = {}) =>
      safe(text)
         .split("\n")
         .flatMap((paragraph) => {
            const lines = [];
            let line = "";
            for (const word of paragraph.split(" ")) {
               const next = line ? `${line} ${word}` : word;
               if (font.widthOfTextAtSize(next, size) <= width) {
                  line = next;
                  continue;
               }
               if (line) lines.push(line);
               // Un mot plus large que la colonne est coupé.
               let rest = word;
               while (font.widthOfTextAtSize(rest, size) > width) {
                  let n = rest.length;
                  while (n > 1 && font.widthOfTextAtSize(rest.slice(0, n), size) > width) n -= 1;
                  lines.push(rest.slice(0, n));
                  rest = rest.slice(n);
               }
               line = rest;
            }
            return [...lines, line];
         });
   const rule = (top, color = LINE, thickness = 0.8) => page.drawLine({ start: { x: M, y: top }, end: { x: W - M, y: top }, thickness, color });
   const addPage = () => {
      page = pdf.addPage([W, H]);
      y = H - M;
   };
   const room = (height) => {
      if (y - height >= BOTTOM) return false;
      addPage();
      return true;
   };

   addPage();
   // En-tête : le logo (chevrons et point rouge), puis le titre du document.
   page.drawSvgPath(CHEVRONS, { x: M, y: H - M + 4, scale: 0.4, color: NAVY });
   page.drawCircle({ x: M + 20, y: H - M + 4 - 20, size: 4, color: RED });
   put("GEK", M + 50, H - M - 12, { size: 20, font: bold });
   put("INNOVATECH", M + 50, H - M - 25, { size: 9, color: MUTED });
   put(t[document.type], W - M, H - M - 12, { size: 24, font: bold, right: true });
   put(document.number || t.draft, W - M, H - M - 29, { size: 11, color: MUTED, right: true });
   y = H - M - 66;
   rule(y);
   y -= 22;

   // Émetteur à gauche, client et dates à droite.
   const place = [company.city, company.country].filter(Boolean).join(", ");
   const sender = [company.address, place, contact.phoneDisplay, contact.email, company.ifu && `${t.ifu} : ${company.ifu}`, company.rccm && `${t.rccm} : ${company.rccm}`].filter(Boolean);
   const receiver = [document.client.company && document.client.name, ...(document.client.address ? document.client.address.split("\n") : []), document.client.phone, document.client.email, document.client.ifu && `${t.ifu} : ${document.client.ifu}`].filter(Boolean);
   const colW = (W - 2 * M) / 2 - 16;
   const x2 = M + (W - 2 * M) / 2 + 16;
   const block = (x, title, lines) => {
      let top = y;
      for (const line of wrap(title, colW, { size: 12, font: bold })) {
         put(line, x, top, { size: 12, font: bold });
         top -= 15;
      }
      for (const line of lines.flatMap((item) => wrap(item, colW))) {
         put(line, x, top, { color: MUTED });
         top -= 14;
      }
      return top;
   };
   const leftEnd = block(M, company.name, sender);
   const rightEnd = block(x2, document.client.company || document.client.name, receiver);
   y = Math.min(leftEnd, rightEnd) - 14;

   const dates = [[t.date, longDate(document.date, document.lang)], document.due && [document.type === "quote" ? t.valid : t.due, longDate(document.due, document.lang)]].filter(Boolean);
   dates.forEach(([name, value], i) => {
      const x = M + i * 170;
      put(name, x, y, { size: 9, color: MUTED });
      put(value, x, y - 14, { size: 10.5, font: bold });
   });
   y -= 34;
   if (document.subject) {
      for (const line of wrap(document.subject, W - 2 * M, { size: 13, font: bold })) {
         put(line, M, y - 8, { size: 13, font: bold });
         y -= 17;
      }
      y -= 8;
   }

   // Lignes : l'en-tête du tableau se répète en haut de chaque page.
   const cAmount = W - M - 10;
   const cPrice = cAmount - 96;
   const cQty = cPrice - 92;
   const itemW = cQty - 36 - (M + 10);
   const tableHead = () => {
      page.drawRectangle({ x: M, y: y - 24, width: W - 2 * M, height: 24, color: NAVY });
      const white = { size: 9.5, font: bold, color: rgb(1, 1, 1) };
      put(t.item, M + 10, y - 16, white);
      put(t.qty, cQty, y - 16, { ...white, right: true });
      put(t.price, cPrice, y - 16, { ...white, right: true });
      put(t.amount, cAmount, y - 16, { ...white, right: true });
      y -= 24;
   };
   tableHead();
   for (const item of document.items) {
      const title = wrap(item.label, itemW, { size: 10.5, font: bold });
      const detail = item.detail ? wrap(item.detail, itemW, { size: 9.5 }) : [];
      const height = 18 + title.length * 14 + detail.length * 12.5;
      if (room(height)) tableHead();
      const top = y - 18;
      title.forEach((line, i) => put(line, M + 10, top - i * 14, { size: 10.5, font: bold }));
      detail.forEach((line, i) => put(line, M + 10, top - title.length * 14 + 1 - i * 12.5, { size: 9.5, color: MUTED }));
      put(new Intl.NumberFormat(document.lang === "en" ? "en-GB" : "fr-FR").format(item.qty), cQty, top, { right: true });
      put(money(item.price, document.currency, document.lang), cPrice, top, { right: true });
      put(money(item.qty * item.price, document.currency, document.lang), cAmount, top, { right: true, font: bold });
      y -= height;
      rule(y);
   }

   // Totaux
   const sums = document.totals;
   const lines = [];
   if (sums.discount || sums.tax) lines.push([t.gross, sums.gross]);
   if (sums.discount) lines.push([t.discount, -sums.discount]);
   if (sums.tax) lines.push([t.net, sums.net], [`${t.tax} ${document.taxRate} %`, sums.tax]);
   const paid = document.type === "invoice" && document.paid ? document.paid : 0;
   room(lines.length * 18 + 80 + (paid ? 44 : 0));
   y -= 20;
   for (const [name, value] of lines) {
      put(name, cPrice - 60, y, { color: MUTED, right: true });
      put(money(value, document.currency, document.lang), cAmount, y, { right: true });
      y -= 18;
   }
   const boxW = 236;
   page.drawRectangle({ x: W - M - boxW, y: y - 22, width: boxW, height: 34, color: TINT });
   put(t.total, W - M - boxW + 14, y - 9, { size: 12, font: bold });
   put(money(sums.total, document.currency, document.lang), cAmount, y - 10, { size: 15, font: bold, right: true });
   y -= 40;
   if (paid) {
      put(t.paid, cPrice - 60, y, { color: MUTED, right: true });
      put(money(-paid, document.currency, document.lang), cAmount, y, { right: true });
      y -= 18;
      put(t.left, cPrice - 60, y, { font: bold, right: true });
      put(money(Math.max(0, sums.total - paid), document.currency, document.lang), cAmount, y, { font: bold, right: true });
      y -= 18;
   }
   if (company.taxNote && !sums.tax) {
      put(company.taxNote, cAmount, y - 2, { size: 9, color: MUTED, right: true });
      y -= 16;
   }

   const paragraph = (title, text) => {
      const body = wrap(text, W - 2 * M, { size: 9.5 });
      room(34 + Math.min(body.length, 3) * 13);
      y -= 16;
      put(title, M, y, { size: 10.5, font: bold });
      y -= 15;
      for (const line of body) {
         room(13);
         put(line, M, y, { size: 9.5, color: MUTED });
         y -= 13;
      }
   };
   if (document.notes) paragraph(t.notes, document.notes);
   if (document.terms) paragraph(t.terms, document.terms);
   const payment = [company.bank, company.mobileMoney].filter(Boolean).join("\n");
   if (payment && document.type === "invoice") paragraph(t.payment, payment);
   if (document.type === "quote") {
      room(88);
      y -= 26;
      put(t.sign, W - M - boxW, y, { size: 9.5, color: MUTED });
      page.drawRectangle({ x: W - M - boxW, y: y - 62, width: boxW, height: 54, borderColor: LINE, borderWidth: 0.8 });
      y -= 70;
   }

   const pages = pdf.getPages();
   pages.forEach((current, i) => {
      page = current;
      rule(56);
      put([company.name, contact.email, contact.phoneDisplay].filter(Boolean).join("   "), M, 40, { size: 8.5, color: MUTED });
      put(t.page(i + 1, pages.length), W - M, 40, { size: 8.5, color: MUTED, right: true });
   });
   return pdf.save();
};

export const toBase64 = (bytes) => {
   let text = "";
   for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
   return btoa(text);
};

export const saveFile = (bytes, name) => {
   const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
   const link = window.document.createElement("a");
   link.href = url;
   link.download = name;
   link.click();
   window.setTimeout(() => URL.revokeObjectURL(url), 4000);
};
