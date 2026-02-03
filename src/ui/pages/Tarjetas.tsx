import React from 'react'
import { loadDB, saveDB } from '../../lib/storage'
import { buildICS, downloadText } from '../../lib/ics'
import { addDays } from '../../lib/dates'

export default function Tarjetas() {
  const [db, setDB] = React.useState(() => loadDB())

  function persist(next = db) { setDB(next); saveDB(next) }

  function update(idx: number, patch: any) {
    persist({ ...db, tarjetasCredito: db.tarjetasCredito.map((t,i)=> i===idx ? ({...t, ...patch}) : t) })
  }

  function exportRemindersICS() {
    const events: {title:string;dateISO:string;description?:string}[] = []
    const now = new Date()
    for (const t of db.tarjetasCredito.filter(x=>x.activa)) {
      const diaPago = t.diaPago ?? 25
      const lead = t.recordatorioDiasAntes ?? 3
      for (let k=0;k<12;k++){
        const d = new Date(now.getFullYear(), now.getMonth()+k, 1)
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth()+1).padStart(2,'0')
        const dd = String(Math.min(diaPago, 28)).padStart(2,'0')
        const pagoISO = `${yyyy}-${mm}-${dd}`
        const remindISO = addDays(pagoISO, -lead)
        events.push({
          title: `Recordatorio pagar TC: ${t.nombre}`,
          dateISO: remindISO,
          description: `Pago estimado el ${pagoISO}. Puedes ajustar día/recordatorio en la app.`
        })
      }
    }
    const ics = buildICS(events)
    downloadText('recordatorios_tarjetas.ics', ics, 'text/calendar')
  }

  return (
    <div className="grid cols-2">
      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h2>Notificaciones (sin servidor)</h2>
        <div className="notice">
          En iPhone, la forma más confiable sin backend es generar recordatorios para Calendario (ICS).
          Completa “Día de pago” y “Recordatorio (días antes)”, luego descarga e importa el archivo.
        </div>
        <div className="hr" />
        <div className="row">
          <button className="primary" onClick={exportRemindersICS}>Descargar recordatorios (ICS)</button>
        </div>
      </div>

      {db.tarjetasCredito.map((t, idx) => (
        <div key={t.nombre} className="card">
          <h2>{t.nombre} <span className="badge">{t.emisor}</span></h2>
          <div className="row">
            <div className="field">
              <label>Cupo total (opcional)</label>
              <input inputMode="numeric" value={t.cupoTotal ?? ''} onChange={e=>update(idx,{cupoTotal:Number(e.target.value.replace(/\D/g,''))||undefined})} />
            </div>
            <div className="field">
              <label>Día de pago (1-28)</label>
              <input inputMode="numeric" value={t.diaPago ?? ''} onChange={e=>update(idx,{diaPago:Number(e.target.value.replace(/\D/g,''))||undefined})} />
            </div>
            <div className="field">
              <label>Recordatorio (días antes)</label>
              <input inputMode="numeric" value={t.recordatorioDiasAntes ?? ''} onChange={e=>update(idx,{recordatorioDiasAntes:Number(e.target.value.replace(/\D/g,''))||undefined})} />
            </div>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <div className="field">
              <label>Activa</label>
              <select value={t.activa ? 'SI' : 'NO'} onChange={e=>update(idx,{activa:e.target.value==='SI'})}>
                <option value="SI">SI</option>
                <option value="NO">NO</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
