// Logika hitung lot dinamis. Fungsi murni, tidak bergantung pada React.
//
// Konsep:
//   1 lot standar = 100.000 unit mata uang base.
//   Rugi di SL (per 1 lot)  = 100.000 × |entry − SL|           (dalam mata uang quote)
//   Kalau USD = base (USD/CHF, USD/CAD), dibagi harga entry supaya jadi USD.
//   Lot ideal = target rugi ÷ rugi per 1 lot, lalu dibulatkan ke kelipatan 0,01.
//
// Pendekatan: konversi ke USD memakai harga entry. Di MT5 konversi memakai harga
// saat posisi ditutup, selisihnya kecil untuk jarak SL/TP yang wajar.

export const CONTRACT_SIZE = 100000
export const LOT_STEP = 0.01

// Toleransi floating point saat membulatkan ke bawah (dalam satuan langkah lot).
const EPS = 1e-6

const roundTo = (n, digits) => {
  const f = 10 ** digits
  return Math.round(n * f) / f
}

const isPositive = (n) => Number.isFinite(n) && n > 0

// Nilai 1 lot untuk jarak harga tertentu, dalam USD.
export function usdPerLot(distance, entry, usdIsBase) {
  const inQuote = CONTRACT_SIZE * distance
  return usdIsBase ? inQuote / entry : inQuote
}

const toIdr = (usd, usdIdr) => (isPositive(usdIdr) ? usd * usdIdr : null)

/**
 * @param {object} input
 * @param {object} input.pair       objek dari data/pairs.js
 * @param {number} input.entry      harga entry
 * @param {number} input.sl         harga stop loss
 * @param {number} input.tp         harga take profit
 * @param {number} input.targetLoss target rugi (USD)
 * @param {number} input.maxLoss    batas maksimal rugi (USD)
 * @param {number} [input.usdIdr]   kurs USD ke IDR (opsional, untuk tampilan rupiah)
 * @returns {object} status: 'incomplete' | 'error' | 'ok'
 */
export function calcPosition({ pair, entry, sl, tp, targetLoss, maxLoss, usdIdr }) {
  if (![entry, sl, tp, targetLoss, maxLoss].every(isPositive)) {
    return { status: 'incomplete', message: 'Isi harga entry, SL, TP, dan batas rugi untuk melihat hasil.' }
  }
  if (entry === sl) {
    return { status: 'error', field: 'sl', message: 'SL tidak boleh sama dengan harga entry.' }
  }
  if (maxLoss < targetLoss) {
    return {
      status: 'error',
      field: 'maxLoss',
      message: 'Batas maksimal rugi harus sama atau lebih besar dari target rugi.',
    }
  }

  const direction = sl < entry ? 'BUY' : 'SELL'
  const slDist = Math.abs(entry - sl)
  const tpDist = Math.abs(tp - entry)
  const tpValid = direction === 'BUY' ? tp > entry : tp < entry

  const warnings = []
  if (!tpValid) {
    warnings.push(
      direction === 'BUY'
        ? 'TP harus di atas harga entry untuk posisi Buy.'
        : 'TP harus di bawah harga entry untuk posisi Sell.',
    )
  }

  const slPips = roundTo(slDist / pair.pipSize, 1)
  const tpPips = tpValid ? roundTo(tpDist / pair.pipSize, 1) : null
  const slPct = (slDist / entry) * 100
  const tpPct = tpValid ? (tpDist / entry) * 100 : null

  const lossPerLot = usdPerLot(slDist, entry, pair.usdIsBase)
  const profitPerLot = tpValid ? usdPerLot(tpDist, entry, pair.usdIsBase) : null

  // Semua perhitungan lot dalam satuan "langkah" (1 langkah = 0,01 lot) supaya bebas
  // dari error floating point.
  const idealSteps = targetLoss / lossPerLot / LOT_STEP
  const floorSteps = Math.floor(idealSteps + EPS)
  const maxOkSteps = Math.floor(maxLoss / lossPerLot / LOT_STEP + EPS)

  const buildOption = (steps) => {
    const lot = roundTo(steps * LOT_STEP, 2)
    const loss = lot * lossPerLot
    const profit = profitPerLot === null ? null : lot * profitPerLot
    return {
      steps,
      lot,
      loss,
      lossIdr: toIdr(loss, usdIdr),
      // Persen relatif targetLoss: seberapa dekat rugi asli ke target (rekomendasi ≈ 100%).
      lossPct: (loss / targetLoss) * 100,
      profit,
      profitIdr: profit === null ? null : toIdr(profit, usdIdr),
      profitPct: profit === null ? null : (profit / targetLoss) * 100,
      withinMax: steps <= maxOkSteps,
      isRecommended: false,
    }
  }

  // Rekomendasi: kandidat di bawah dan di atas lot ideal, ambil yang rugi aslinya
  // paling dekat ke target dan tidak melewati batas maksimal. Seri → lot lebih kecil.
  const candidates = [Math.max(1, floorSteps), floorSteps + 1]
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .map(buildOption)
    .filter((o) => o.withinMax)
  candidates.sort(
    (a, b) => Math.abs(a.loss - targetLoss) - Math.abs(b.loss - targetLoss) || a.lot - b.lot,
  )
  const recommended = candidates[0] ?? null

  // Tabel alternatif: satu langkah di bawah lot ideal sampai satu langkah di atas batas.
  const start = Math.max(1, floorSteps - 1)
  const end = Math.max(start, Math.min(maxOkSteps + 1, start + 7))
  const options = []
  for (let s = start; s <= end; s += 1) {
    const option = buildOption(s)
    option.isRecommended = recommended !== null && option.steps === recommended.steps
    options.push(option)
  }

  if (recommended === null) {
    const minLoss = LOT_STEP * lossPerLot
    warnings.push(
      `SL terlalu lebar untuk batas rugi ini: lot minimum 0,01 saja sudah rugi $${minLoss.toFixed(2)}, di atas batas maksimal $${maxLoss.toFixed(2)}.`,
    )
  } else if (floorSteps === 0) {
    warnings.push('Lot minimum 0,01 sudah lebih besar dari target rugi. Rugi aslinya tetap di bawah batas maksimal.')
  }

  return {
    status: 'ok',
    direction,
    tpValid,
    slPips,
    tpPips,
    slPct,
    tpPct,
    lossPerLot,
    profitPerLot,
    idealLot: idealSteps * LOT_STEP,
    recommended,
    options,
    rr: tpValid ? tpDist / slDist : null,
    warnings,
  }
}
