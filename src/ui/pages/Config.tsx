import React from 'react'
import { loadDB, saveDB, exportJSON, importJSON } from '../../lib/storage'

export default function Config() {
  const [db, setDB] = React.useState(() => loadDB())
  const [text, setText] = React.useState('')
  const [msg, setMsg] = React.useState<string>('')

  function persist(next = db) { setDB(next); saveDB(next) }

  function exportData() {
    setText(exportJSON(db))
    setMsg('Export listo. Guarda este JSON como backup.')
  }

  function importData() {
    try {
      persist(importJSON(text))
      setMsg('Import OK.')
    } catch (e:any) {
      setMsg('Error importando: ' + (e?.message ?? 'desconocido'))
    }
  }

  function wipe() {
    if (!confirm('¿Borrar todos tus datos?')) return
    localStorage.removeItem('finanzas_pwa_v1')
    location.reload()
  }

  return (
    <div className="grid cols-2">
      <div className="card">
        <h2>Backup / Restaurar</h2>
        <div className="row">
          <button className="primary" onClick={exportData}>Exportar JSON</button>
          <button onClick={importData}>Importar JSON</button>
          <button className="danger" onClick={wipe}>Borrar todo</button>
        </div>
        {msg && <div style={{ marginTop: 10 }} className="notice">{msg}</div>}
        <div className="hr" />
        <div className="field">
          <label>Datos (JSON)</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Exporta para ver el JSON aquí, o pega un JSON para importar." />
        </div>
      </div>

      <div className="card">
        <h2>Notas</h2>
        <div className="notice">
          Esta versión guarda todo local en tu dispositivo (solo para ti). Para sincronizar entre iPhone y PC, se puede agregar un backend después.
        </div>
        <div className="hr" />
        <div className="notice">
          Notificaciones: sin servidor, el método fiable es Calendario (ICS). Push real requiere backend + HTTPS.
        </div>
      </div>
    </div>
  )
}
