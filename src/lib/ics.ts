type IcsEvent = { title: string; dateISO: string; description?: string }

function esc(s: string): string {
  return s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')
}

export function buildICS(events: IcsEvent[]): string {
  const dtstamp = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z')
  const lines: string[] = []
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//Finanzas PWA//CL//ES')

  for (const ev of events) {
    const uid = `${Math.random().toString(16).slice(2)}@finanzas-pwa`
    const dt = ev.dateISO.replace(/-/g,'')
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTAMP:${dtstamp}`)
    lines.push(`DTSTART;VALUE=DATE:${dt}`)
    lines.push(`DTEND;VALUE=DATE:${dt}`)
    lines.push(`SUMMARY:${esc(ev.title)}`)
    if (ev.description) lines.push(`DESCRIPTION:${esc(ev.description)}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadText(filename: string, content: string, mime='text/plain') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
