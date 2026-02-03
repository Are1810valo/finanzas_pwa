export const clp = (n:number)=> (Number.isFinite(n)? n.toLocaleString('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}): '$0')
