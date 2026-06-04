export function downloadCSV(data, filename) {
  const headers = ["Reg No", "Name", "Year", "Section", "Status", "Date"]
  const rows = data.map(s => [s.regNo, s.name, s.year, s.section, s.status, s.date])
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
