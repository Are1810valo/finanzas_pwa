export type MedioPago = 'debito' | 'credito' | 'transferencia' | 'efectivo'
export type TipoMovimiento = 'ingreso' | 'gasto'

export type Movimiento = {
  id: string
  fecha: string // YYYY-MM-DD
  tipo: TipoMovimiento
  monto: number
  categoria: string
  subcategoria?: string
  cuenta?: string // TD
  medioPago: MedioPago
  tarjetaCredito?: string // TC
  esCuotas: boolean
  nCuotas?: number
  cuotaActual?: number
  montoTotalCompra?: number
  nota?: string
}

export type TarjetaCredito = {
  nombre: string
  emisor: string
  cupoTotal?: number
  diaPago?: number // 1-28
  recordatorioDiasAntes?: number
  activa: boolean
}

export type CuentaDebito = {
  nombre: string
  banco: string
  activa: boolean
}

export type Categoria = {
  nombre: string
  tipo: TipoMovimiento
  subcategorias: string[]
  activa: boolean
}

export type Settings = { currency: 'CLP' }
