import { plain } from "./format";

// Lit un CSV séparé par des virgules ou des points-virgules (Excel français), guillemets compris.
export const readCsv = (source) => {
   const text = source.replace(/^\ufeff/, "");
   const head = text.split(/\r?\n/, 1)[0];
   const separator = head.split(";").length > head.split(",").length ? ";" : ",";
   const rows = [];
   let row = [];
   let cell = "";
   let quoted = false;
   for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (quoted) {
         if (char === '"' && text[i + 1] === '"') {
            cell += '"';
            i += 1;
         } else if (char === '"') quoted = false;
         else cell += char;
      } else if (char === '"') quoted = true;
      else if (char === separator || char === "\n") {
         row.push(cell.trim());
         cell = "";
         if (char === "\n") {
            rows.push(row);
            row = [];
         }
      } else if (char !== "\r") cell += char;
   }
   row.push(cell.trim());
   rows.push(row);
   const [columns = [], ...lines] = rows.filter((items) => items.some(Boolean));
   const names = columns.map((name) => plain(name).trim());
   return lines.map((items) => Object.fromEntries(names.map((name, i) => [name, items[i] || ""])));
};

// Une cellule qui commence par =, +, - ou @ serait exécutée comme une formule par Excel : une apostrophe la neutralise.
// Un numéro de téléphone (+229…) reste tel quel.
const cell = (value) => {
   const text = String(value ?? "");
   const safe = /^[=@\t\r]/.test(text) || (/^[+-]/.test(text) && !/^[+-][\d\s().-]+$/.test(text)) ? `'${text}` : text;
   return `"${safe.replace(/"/g, '""')}"`;
};

export const saveCsv = (name, columns, rows) => {
   const text = `\ufeff${[columns, ...rows].map((items) => items.map(cell).join(";")).join("\r\n")}`;
   const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
   const link = document.createElement("a");
   link.href = url;
   link.download = name;
   link.click();
   window.setTimeout(() => URL.revokeObjectURL(url), 2000);
};
