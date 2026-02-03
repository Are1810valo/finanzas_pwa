import React from 'react'
import Dashboard from './pages/Dashboard'
import Movimientos from './pages/Movimientos'
import Tarjetas from './pages/Tarjetas'
import Config from './pages/Config'

type Route = 'dashboard' | 'movimientos' | 'tarjetas' | 'config'

function useHashRoute(): Route {
  const get = (): Route => {
    const h = (location.hash || '#dashboard').replace('#','') as Route
    return (['dashboard','movimientos','tarjetas','config'] as Route[]).includes(h) ? h : 'dashboard'
  }
  const [route, setRoute] = React.useState<Route>(get())
  React.useEffect(() => {
    const on = () => setRoute(get())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export default function App() {
  const route = useHashRoute()
  const title =
    route === 'dashboard' ? 'Dashboard' :
    route === 'movimientos' ? 'Movimientos' :
    route === 'tarjetas' ? 'Tarjetas' : 'Configuración'

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <h1>Finanzas Personales</h1>
          <p>{title} · TC/TD · CLP</p>
        </div>
        <div className="tabs">
          <a className={'tab ' + (route==='dashboard'?'active':'')} href="#dashboard">Dashboard</a>
          <a className={'tab ' + (route==='movimientos'?'active':'')} href="#movimientos">Movimientos</a>
          <a className={'tab ' + (route==='tarjetas'?'active':'')} href="#tarjetas">Tarjetas</a>
          <a className={'tab ' + (route==='config'?'active':'')} href="#config">Config</a>
        </div>
      </div>

      {route === 'dashboard' && <Dashboard />}
      {route === 'movimientos' && <Movimientos />}
      {route === 'tarjetas' && <Tarjetas />}
      {route === 'config' && <Config />}

      <div style={{ marginTop: 12 }} className="notice">
        iPhone: abre la web en Safari → Compartir → “Agregar a pantalla de inicio” para instalarla como app (PWA).
      </div>
    </div>
  )
}
