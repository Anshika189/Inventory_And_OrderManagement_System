/**
 * Convert an array of flat objects to a CSV string and trigger a download.
 * Intentionally minimal — no deps.
 */
export function exportToCSV(filename, rows, columns) {
  if (!rows || rows.length === 0) return;
  const cols = columns || Object.keys(rows[0]).map((k) => ({ key: k, label: k }));
  const header = cols.map((c) => escape(c.label || c.key)).join(",");
  const body = rows
    .map((row) =>
      cols
        .map((c) => {
          const v = typeof c.value === "function" ? c.value(row) : row[c.key];
          return escape(v);
        })
        .join(",")
    )
    .join("\n");
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escape(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
