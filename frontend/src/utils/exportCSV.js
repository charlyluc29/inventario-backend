export function exportToCSV(data, filename = "inventario.csv") {
  if (!data || !data.length) return

  const headers = Object.keys(data[0])

  const rows = data.map(obj =>
    headers.map(h => `"${obj[h] ?? ""}"`).join(",")
  )

  const csv = [headers.join(","), ...rows].join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
}
