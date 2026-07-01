export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const escape = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Downloads the CSV and opens a blank Google Sheet so the user can immediately
// File > Import > Upload it — fastest path to "this is in Google Sheets" without OAuth.
export function exportToGoogleSheets(filename: string, rows: Record<string, unknown>[]) {
  downloadCsv(filename, rows)
  window.open('https://sheets.new', '_blank')
}
