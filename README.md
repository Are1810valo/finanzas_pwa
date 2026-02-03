# Finanzas Personales (PWA instalable en iPhone)

## Requisitos
- Node.js 18+

## Ejecutar (local)
```bash
npm install
npm run dev
```

## Construir / Preview
```bash
npm run build
npm run preview
```

## Instalar como app en iPhone
1. Despliega en HTTPS (Vercel/Netlify).
2. En iPhone abre la URL en Safari.
3. Compartir → **Agregar a pantalla de inicio**.

## Notificaciones (sin servidor)
- Pestaña **Tarjetas**: completa “Día de pago” y “Recordatorio (días antes)”
- Descarga `recordatorios_tarjetas.ics`
- Ábrelo en iPhone y agrégalo al Calendario (genera 12 meses)

> Push real (notificaciones nativas) requiere backend Web Push + HTTPS.
