export function downloadCSV(headers, rows, filename) {
  const csv = [headers, ...rows]
    .map(r => r.map(val => `"${String(val !== undefined && val !== null ? val : '').replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
