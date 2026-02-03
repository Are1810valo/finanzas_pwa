import React from 'react'
import { loadDB } from '../../lib/storage'
import { ymFromISO } from '../../lib/dates'
import { clp } from '../../lib/money'

export default function Dashboard() {
  const [db] = React.useState(() => loadDB())

  const months = React.useMemo(() => {
    const set = new Set<string>()
    for (const m of db.movimientos) set.add(ymFromISO(m.fecha))
    return Array.from(set).sort().reverse()
  }, [db.movimientos])

  const [month, setMonth] = React.useState<string>(() => months[0] ?? new Date().toISOString().slice(0,7))

  React.useEffect(() => {
    if (months.length && !months.includes(month)) setMonth(months[0])
  }, [months, month])

  const rows = db.movimientos.filter(m => ymFromISO(m.fecha) === month)
  const ingresos = rows.filter(r => r.tipo==='ingreso').reduce((a,b)=>a+b.monto,0)
  const gastos = rows.filter(r => r.tipo==='gasto').reduce((a,b)=>a+b.monto,0)

  const deuda = rows
    .filter(r => r.tipo==='gasto' && r.medioPago==='credito' && r.esCuotas && r.nCuotas && r.cuotaActual && r.montoTotalCompra)
    .reduce((acc, r) => {
      const cuota = (r.montoTotalCompra! / r.nCuotas!)
      const restantes = (r.nCuotas! - r.cuotaActual! + 1)
      return acc + Math.max(0, cuota * restantes)
    }, 0)

  const catMap = new Map<string, number>()
  for (const r of rows.filter(r=>r.tipo==='gasto')) {
    catMap.set(r.categoria, (catMap.get(r.categoria) ?? 0) + r.monto)
  }
  const catList = Array.from(catMap.entries()).sort((a,b)=>b[1]-a[1]).slice(0,12)

  const gastoTD = rows.filter(r=>r.tipo==='gasto' && r.medioPago==='debito').reduce((a,b)=>a+b.monto,0)
  const gastoTC = rows.filter(r=>r.tipo==='gasto' && r.medioPago==='credito').reduce((a,b)=>a+b.monto,0)

  return (
    <div className="grid cols-2">
      <div className="card">
        <h2>Mes</h2>
        <div className="row">
          <div className="field">
            <label>Selecciona mes</label>
            <select value={month} onChange={e=>setMonth(e.target.value)}>
              {months.length ? months.map(m => <option key={m} value={m}>{m}</option>) : <option value={month}>{month}</option>}
            </select>
          </div>
          <div className="field">
            <span className="badge">{rows.length} movimientos</span>
          </div>
        </div>
        <div className="hr" />
        <div className="grid cols-2">
          <div className="kpi"><div className="small">Ingresos</div><div className="val">{clp(ingresos)}</div></div>
          <div className="kpi"><div className="small">Gastos</div><div className="val">{clp(gastos)}</div></div>
          <div className="kpi"><div className="small">Balance</div><div className="val">{clp(ingresos - gastos)}</div></div>
          <div className="kpi"><div className="small">Deuda cuotas (estimada)</div><div className="val">{clp(deuda)}</div></div>
        </div>
      </div>

      <div className="card">
        <h2>TD vs TC</h2>
        <div className="grid cols-2">
          <div className="kpi"><div className="small">Gasto con TD</div><div className="val">{clp(gastoTD)}</div></div>
          <div className="kpi"><div className="small">Gasto con TC</div><div className="val">{clp(gastoTC)}</div></div>
        </div>
        <div className="hr" />
        <div className="small">Tip: registra en TC el monto que quieres ver como gasto del mes (cuota o cargo). Si pones cuotas, completa “monto total + nº cuotas + cuota actual”.</div>
      </div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h2>Top categorías (gastos)</h2>
        {catList.length ? (
          <table className="table">
            <thead><tr><th>Categoría</th><th>Total</th></tr></thead>
            <tbody>
              {catList.map(([c, v]) => (
                <tr key={c} className="tr">
                  <td style={{ padding: 10 }}>{c}</td>
                  <td style={{ padding: 10 }}>{clp(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="notice">Aún no hay datos para este mes.</div>
        )}
      </div>
    </div>
  )
}
