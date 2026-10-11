// Parsing input dan format tampilan.

// Menerima "1.12022" maupun "1,12022". Kosong atau tidak valid → NaN.
export function parseDecimal(value) {
  if (typeof value === 'number') return value
  const text = String(value ?? '').trim().replace(/\s/g, '').replace(',', '.')
  if (text === '') return NaN
  return Number(text)
}

// Untuk kurs: "17.843", "17,843", dan "17843" semuanya dibaca 17843.
export function parseInteger(value) {
  const digits = String(value ?? '').replace(/[^\d]/g, '')
  return digits === '' ? NaN : Number(digits)
}

const usdFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const idrFormat = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export const formatUsd = (n) => usdFormat.format(n)
export const formatIdr = (n) => idrFormat.format(n)

export const formatLot = (lot) => lot.toFixed(2)

// 0.01% atau 0.50%. Di bawah 0.005% ditulis "<0.01%".
export function formatPercent(n) {
  if (n > 0 && n < 0.005) return '<0.01%'
  return `${n.toFixed(2)}%`
}

// 47 → "47", 47.5 → "47.5"
export const formatPips = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

export const formatPrice = (n, digits) => n.toFixed(digits)

export const formatRatio = (rr) => `1 : ${rr.toFixed(2)}`
