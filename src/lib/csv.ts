type Cell = string | number | null | undefined;

/**
 * Escapes one CSV cell. Values starting with = + - @ are prefixed with a quote so
 * spreadsheet apps don't run them as formulas (CSV injection).
 */
function escapeCell(value: Cell) {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: string[], rows: Cell[][]) {
  return [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
}

/** Triggers a browser download of `csv` as `filename`. */
export function downloadCsv(filename: string, csv: string) {
  // Leading BOM so Excel opens UTF-8 correctly.
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
