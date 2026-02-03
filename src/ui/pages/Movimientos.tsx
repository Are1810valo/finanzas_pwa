import React from 'react'
import type { Movimiento, MedioPago } from '../../lib/types'
import { loadDB, saveDB } from '../../lib/storage'
import { todayISO, ymFromISO } from '../../lib/dates'
import { clp } from '../../lib/money'

const uid = () => Math.random().toString(16).slice(2) + '-' + Date.now().toString(16)

export default function Movimientos() {
  const [db, setDB] = React.useState(() => loadDB())

  const months = React.useMemo(() => {
    const set = new Set<string>()
    for (const m of db.movimientos) set.add(ymFromISO(m.fecha))
    return Array.from(set).sort().reverse()
  }, [db.movimientos])
  const [month, setMonth] = React.useState<string>(() => months[0] ?? new Date().toISOString().slice(0,7))

  React.useEffect(() => {
    if (months.length && !months.includes(month)) setMonth(months[0])
  }, [months, month])

  const categorias = db.categorias.filter(c=>c.activa)
  const cuentasDeb = db.cuentasDebito.filter(a=>a.activa).map(a=>a.nombre)
  const tarjetas = db.tarjetasCredito.filter(t=>t.activa).map(t=>t.nombre)

  const [form, setForm] = React.useState<Movimiento>({
    id: uid(),
    fecha: todayISO(),
    tipo: 'gasto',
    monto: 0,
    categoria: categorias[0]?.nombre ?? 'Comida',
    subcategoria: categorias[0]?.subcategorias?.[0] ?? '',
    cuenta: cuentasDeb[0] ?? '',
    medioPago: 'debito',
    tarjetaCredito: '',
    esCuotas: false,
    nCuotas: undefined,
    cuotaActual: undefined,
    montoTotalCompra: undefined,
    nota: ''
  })

  const subs = React.useMemo(() => {
    const cat = categorias.find(c=>c.nombre===form.categoria)
    return cat?.subcategorias ?? []
  }, [categorias, form.categoria])

  function persist(next = db) { setDB(next); saveDB(next) }

  function add() {
    if (!form.fecha) return alert('Falta fecha')
    if (!form.categoria) return alert('Falta categoría')
    if (!Number.isFinite(form.monto) || form.monto <= 0) return alert('Monto inválido')
    if (form.medioPago === 'debito' && !form.cuenta) return alert('Selecciona cuenta (TD)')
    if (form.medioPago === 'credito' && !form.tarjetaCredito) return alert('Selecciona tarjeta (TC)')

    if (form.esCuotas) {
      if (!form.nCuotas || form.nCuotas < 1) return alert('NCuotas inválido')
      if (!form.cuotaActual || form.cuotaActual < 1) return alert('CuotaActual inválido')
      if (!form.montoTotalCompra || form.montoTotalCompra < 1) return alert('MontoTotalCompra inválido')
    }

    const toSave: Movimiento = { ...form, id: uid() }
    persist({ ...db, movimientos: [toSave, ...db.movimientos] })
    setForm(f => ({ ...f, id: uid(), monto: 0, nota: '' }))
  }

  function del(id: string) {
    persist({ ...db, movimientos: db.movimientos.filter(m=>m.id!==id) })
  }

  const filtered = db.movimientos.filter(m => ymFromISO(m.fecha) === month)
  const total = filtered.reduce((acc,m)=>acc + (m.tipo==='ingreso'? m.monto : -m.monto),0)

  return (
    <div className="grid cols-2">
      <div className="card">
        <h2>Agregar movimiento</h2>
        <div className="row">
          <div className="field">
            <label>Fecha</label>
            <input type="date" value={form.fecha} onChange={e=>setForm({...form, fecha: e.target.value})} />
          </div>
          <div className="field">
            <label>Tipo</label>
            <select value={form.tipo} onChange={e=>setForm({...form, tipo: e.target.value as any})}>
              <option value="gasto">gasto</option>
              <option value="ingreso">ingreso</option>
            </select>
          </div>
          <div className="field">
            <label>Monto (CLP)</label>
            <input inputMode="numeric" value={String(form.monto)} onChange={e=>setForm({...form, monto: Number(e.target.value.replace(/\D/g,''))})} />
          </div>
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <div className="field">
            <label>Categoría</label>
            <select value={form.categoria} onChange={e=>setForm({...form, categoria: e.target.value, subcategoria: ''})}>
              {categorias.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Subcategoría</label>
            <select value={form.subcategoria ?? ''} onChange={e=>setForm({...form, subcategoria: e.target.value})}>
              <option value="">(opcional)</option>
              {subs.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <div className="field">
            <label>Medio de pago</label>
            <select value={form.medioPago} onChange={e=>{
              const mp = e.target.value as MedioPago
              setForm({
                ...form,
                medioPago: mp,
                cuenta: mp === 'debito' ? (cuentasDeb[0] ?? '') : '',
                tarjetaCredito: mp === 'credito' ? (tarjetas[0] ?? '') : '',
              })
            }}>
              <option value="debito">debito (TD)</option>
              <option value="credito">credito (TC)</option>
              <option value="transferencia">transferencia</option>
              <option value="efectivo">efectivo</option>
            </select>
          </div>

          {form.medioPago === 'debito' && (
            <div className="field">
              <label>Cuenta (TD)</label>
              <select value={form.cuenta ?? ''} onChange={e=>setForm({...form, cuenta: e.target.value})}>
                <option value="">(elige)</option>
                {cuentasDeb.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {form.medioPago === 'credito' && (
            <div className="field">
              <label>Tarjeta (TC)</label>
              <select value={form.tarjetaCredito ?? ''} onChange={e=>setForm({...form, tarjetaCredito: e.target.value})}>
                <option value="">(elige)</option>
                {tarjetas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <div className="field">
            <label>¿Es en cuotas?</label>
            <select value={form.esCuotas ? 'SI' : 'NO'} onChange={e=>setForm({...form, esCuotas: e.target.value === 'SI'})}>
              <option value="NO">NO</option>
              <option value="SI">SI</option>
            </select>
          </div>

          {form.esCuotas && (
            <>
              <div className="field">
                <label>Nº Cuotas</label>
                <input inputMode="numeric" value={form.nCuotas ?? ''} onChange={e=>setForm({...form, nCuotas: Number(e.target.value.replace(/\D/g,'')) || undefined})} />
              </div>
              <div className="field">
                <label>Cuota actual</label>
                <input inputMode="numeric" value={form.cuotaActual ?? ''} onChange={e=>setForm({...form, cuotaActual: Number(e.target.value.replace(/\D/g,'')) || undefined})} />
              </div>
              <div className="field">
                <label>Monto total compra</label>
                <input inputMode="numeric" value={form.montoTotalCompra ?? ''} onChange={e=>setForm({...form, montoTotalCompra: Number(e.target.value.replace(/\D/g,'')) || undefined})} />
              </div>
            </>
          )}
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Nota</label>
            <textarea value={form.nota ?? ''} onChange={e=>setForm({...form, nota: e.target.value})} />
          </div>
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <button className="primary" onClick={add}>Guardar</button>
        </div>
      </div>

      <div className="card">
        <h2>Ver mes</h2>
        <div className="row">
          <div className="field">
            <label>Mes</label>
            <select value={month} onChange={e=>setMonth(e.target.value)}>
              {months.length ? months.map(m => <option key={m} value={m}>{m}</option>) : <option value={month}>{month}</option>}
            </select>
          </div>
          <div className="field">
            <label>Total mes (neto)</label>
            <div className="badge">{clp(total)}</div>
          </div>
        </div>

        <div className="hr" />
        {filtered.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th><th>Tipo</th><th>Monto</th><th>Categoría</th><th>Pago</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="tr">
                    <td>{m.fecha}</td>
                    <td><span className="pill">{m.tipo}</span></td>
                    <td>{clp(m.monto)}</td>
                    <td>{m.categoria}{m.subcategoria ? ` / ${m.subcategoria}` : ''}</td>
                    <td>
                      {m.medioPago === 'debito' ? `TD · ${m.cuenta}` :
                       m.medioPago === 'credito' ? `TC · ${m.tarjetaCredito}` :
                       m.medioPago}
                      {m.esCuotas && m.nCuotas && m.cuotaActual ? ` · ${m.cuotaActual}/${m.nCuotas}` : ''}
                    </td>
                    <td><button className="danger" onClick={()=>del(m.id)}>Borrar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="notice">Sin movimientos para este mes.</div>
        )}
      </div>
    </div>
  )
}
