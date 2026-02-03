import type { Movimiento, TarjetaCredito, CuentaDebito, Categoria, Settings } from './types'

const KEY = 'finanzas_pwa_v1'

export type DB = {
  settings: Settings
  tarjetasCredito: TarjetaCredito[]
  cuentasDebito: CuentaDebito[]
  categorias: Categoria[]
  movimientos: Movimiento[]
}

export function defaultDB(): DB {
  return {
    settings: { currency: 'CLP' },
    tarjetasCredito: [
      { nombre: 'Lider', emisor: 'BCI', activa: true, recordatorioDiasAntes: 3 },
      { nombre: 'CMR', emisor: 'Falabella', activa: true, recordatorioDiasAntes: 3 },
      { nombre: 'SBPay', emisor: 'SBPay', activa: true, recordatorioDiasAntes: 3 },
      { nombre: 'Tricard', emisor: 'Tricard', activa: true, recordatorioDiasAntes: 3 },
      { nombre: 'Tenpo Crédito', emisor: 'Tenpo', activa: true, recordatorioDiasAntes: 3 },
    ],
    cuentasDebito: [
      { nombre: 'Banco Internacional', banco: 'Banco Internacional', activa: true },
      { nombre: 'Banco BICE', banco: 'Banco BICE', activa: true },
      { nombre: 'Banco Chile', banco: 'Banco Chile', activa: true },
      { nombre: 'Banco Falabella', banco: 'Banco Falabella', activa: true },
      { nombre: 'Tenpo Débito', banco: 'Tenpo', activa: true },
      { nombre: 'MACH', banco: 'MACH', activa: true },
    ],
    categorias: [
      { nombre: 'Ingresos', tipo: 'ingreso', subcategorias: ['Sueldo', 'Bono', 'Extra'], activa: true },
      { nombre: 'Comida', tipo: 'gasto', subcategorias: ['Supermercado', 'Restaurantes', 'Delivery'], activa: true },
      { nombre: 'Transporte', tipo: 'gasto', subcategorias: ['Bencina', 'Uber/Taxi', 'Peajes'], activa: true },
      { nombre: 'Servicios', tipo: 'gasto', subcategorias: ['Luz', 'Agua', 'Gas', 'Internet/Telefonía'], activa: true },
      { nombre: 'Salud', tipo: 'gasto', subcategorias: ['Farmacia', 'Consulta', 'Exámenes'], activa: true },
      { nombre: 'Compras', tipo: 'gasto', subcategorias: ['Ropa', 'Tecnología', 'Hogar'], activa: true },
      { nombre: 'Entretenimiento', tipo: 'gasto', subcategorias: ['Streaming', 'Salidas', 'Viajes'], activa: true },
      { nombre: 'Educación', tipo: 'gasto', subcategorias: ['Cursos', 'Libros'], activa: true },
      { nombre: 'Imprevistos', tipo: 'gasto', subcategorias: ['Reparaciones', 'Otros'], activa: true },
    ],
    movimientos: []
  }
}

export function loadDB(): DB {
  const raw = localStorage.getItem(KEY)
  if (!raw) return defaultDB()
  try { return JSON.parse(raw) as DB } catch { return defaultDB() }
}

export function saveDB(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

export function exportJSON(db: DB): string {
  return JSON.stringify(db, null, 2)
}

export function importJSON(jsonStr: string): DB {
  const parsed = JSON.parse(jsonStr) as DB
  if (!parsed.movimientos || !parsed.tarjetasCredito || !parsed.cuentasDebito || !parsed.categorias) {
    throw new Error('Formato inválido.')
  }
  return parsed
}
