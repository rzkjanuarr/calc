import { useMemo } from 'react'
import { calcPosition } from '../lib/forex.js'
import { parseDecimal, parseInteger } from '../lib/format.js'

// Mengubah isi form (string) jadi angka, lalu menghitung posisi.
// Dihitung ulang otomatis setiap kali ada input yang berubah.
export function usePositionCalc({ pair, form }) {
  return useMemo(() => {
    const numbers = {
      entry: parseDecimal(form.entry),
      sl: parseDecimal(form.sl),
      tp: parseDecimal(form.tp),
      targetLoss: parseDecimal(form.targetLoss),
      maxLoss: parseDecimal(form.maxLoss),
      usdIdr: parseInteger(form.usdIdr),
    }
    return { numbers, result: calcPosition({ pair, ...numbers }) }
  }, [pair, form])
}
