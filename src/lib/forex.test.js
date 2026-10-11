import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calcPosition } from './forex.js'
import { getPair } from '../data/pairs.js'
import { formatPercent, parseDecimal, parseInteger } from './format.js'

const close = (actual, expected, tolerance = 0.005) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} bukan ≈ ${expected}`)

const base = { targetLoss: 20, maxLoss: 30, usdIdr: 17843 }

test('EUR/USD, SL 47 pip: lot 0,04 dengan rugi $18,80', () => {
  const r = calcPosition({
    ...base,
    pair: getPair('EURUSD'),
    entry: 1.12022,
    sl: 1.11552,
    tp: 1.12822,
  })
  assert.equal(r.status, 'ok')
  assert.equal(r.direction, 'BUY')
  assert.equal(r.slPips, 47)
  assert.equal(r.tpPips, 80)
  close(r.lossPerLot, 470, 0.001)
  close(r.idealLot, 0.04255, 0.00001)
  assert.equal(r.recommended.lot, 0.04)
  close(r.recommended.loss, 18.8)
  close(r.recommended.profit, 32)
  close(r.recommended.lossIdr, 18.8 * 17843, 0.5)
  close(r.rr, 80 / 47, 0.0001)
  close(r.slPct, 0.41955, 0.0001)
  close(r.tpPct, 0.71414, 0.0001)
})

test('EUR/USD: tabel alternatif 0,03 sampai 0,07, lot 0,07 lewat batas', () => {
  const r = calcPosition({
    ...base,
    pair: getPair('EURUSD'),
    entry: 1.12022,
    sl: 1.11552,
    tp: 1.12822,
  })
  assert.deepEqual(
    r.options.map((o) => o.lot),
    [0.03, 0.04, 0.05, 0.06, 0.07],
  )
  assert.deepEqual(
    r.options.map((o) => o.withinMax),
    [true, true, true, true, false],
  )
  assert.deepEqual(
    r.options.map((o) => o.isRecommended),
    [false, true, false, false, false],
  )
  close(r.options[2].loss, 23.5)
  close(r.options[3].loss, 28.2)
  close(r.options[4].loss, 32.9)
})

test('USD/CHF, SL 20 pip: pip value ikut harga, lot 0,08', () => {
  const r = calcPosition({
    ...base,
    pair: getPair('USDCHF'),
    entry: 0.83024,
    sl: 0.82824,
    tp: 0.83824,
  })
  assert.equal(r.slPips, 20)
  assert.equal(r.tpPips, 80)
  close(r.lossPerLot, 240.894, 0.001)
  close(r.idealLot, 0.08302, 0.00001)
  assert.equal(r.recommended.lot, 0.08)
  close(r.recommended.loss, 19.27)
  close(r.recommended.profit, 77.09)
})

test('USD/CAD memakai koreksi yang sama dengan USD/CHF', () => {
  const r = calcPosition({
    ...base,
    pair: getPair('USDCAD'),
    entry: 1.42559,
    sl: 1.42089,
    tp: 1.43359,
  })
  // 100.000 × 0,0047 ÷ 1,42559 = $329,69 per lot → ideal 0,0607
  close(r.lossPerLot, 329.69, 0.01)
  assert.equal(r.recommended.lot, 0.06)
  close(r.recommended.loss, 19.78, 0.01)
})

test('SELL: SL di atas entry, TP di bawah entry', () => {
  const r = calcPosition({
    ...base,
    pair: getPair('EURUSD'),
    entry: 1.12022,
    sl: 1.12492,
    tp: 1.11222,
  })
  assert.equal(r.direction, 'SELL')
  assert.equal(r.slPips, 47)
  assert.equal(r.tpPips, 80)
  assert.equal(r.tpValid, true)
  assert.equal(r.recommended.lot, 0.04)
})

test('lot ideal tepat kelipatan 0,01 tidak turun satu langkah karena floating point', () => {
  const r = calcPosition({
    ...base,
    pair: getPair('EURUSD'),
    entry: 1.12022,
    sl: 1.11822,
    tp: 1.12622,
  })
  assert.equal(r.slPips, 20)
  assert.equal(r.recommended.lot, 0.1)
  close(r.recommended.loss, 20, 0.001)
})

test('SL terlalu lebar: tidak ada rekomendasi, ada peringatan', () => {
  const r = calcPosition({
    ...base,
    pair: getPair('EURUSD'),
    entry: 1.12022,
    sl: 1.08022,
    tp: 1.16022,
  })
  assert.equal(r.recommended, null)
  assert.equal(r.options.length, 1)
  assert.equal(r.options[0].lot, 0.01)
  assert.equal(r.options[0].withinMax, false)
  assert.ok(r.warnings.some((w) => w.includes('terlalu lebar')))
})

test('lot minimum sudah di atas target tapi masih di bawah batas maksimal', () => {
  // 100 pip → $10 per 0,01 lot. Target $5, maks $30.
  const r = calcPosition({
    ...base,
    targetLoss: 5,
    pair: getPair('EURUSD'),
    entry: 1.12022,
    sl: 1.11022,
    tp: 1.13022,
  })
  assert.equal(r.recommended.lot, 0.01)
  close(r.recommended.loss, 10)
  assert.ok(r.warnings.some((w) => w.includes('Lot minimum')))
})

test('TP di sisi yang salah: lot tetap dihitung, profit kosong', () => {
  const r = calcPosition({
    ...base,
    pair: getPair('EURUSD'),
    entry: 1.12022,
    sl: 1.11552,
    tp: 1.11000,
  })
  assert.equal(r.status, 'ok')
  assert.equal(r.tpValid, false)
  assert.equal(r.tpPips, null)
  assert.equal(r.rr, null)
  assert.equal(r.recommended.lot, 0.04)
  assert.equal(r.recommended.profit, null)
  assert.ok(r.warnings.length > 0)
})

test('input belum lengkap atau salah', () => {
  const pair = getPair('EURUSD')
  assert.equal(calcPosition({ ...base, pair, entry: 1.12, sl: NaN, tp: 1.13 }).status, 'incomplete')
  assert.equal(calcPosition({ ...base, pair, entry: 1.12, sl: 1.12, tp: 1.13 }).status, 'error')
  assert.equal(
    calcPosition({ pair, entry: 1.12, sl: 1.11, tp: 1.13, targetLoss: 30, maxLoss: 20 }).status,
    'error',
  )
})

test('kurs kosong: nilai rupiah null, perhitungan USD tetap jalan', () => {
  const r = calcPosition({
    ...base,
    usdIdr: NaN,
    pair: getPair('EURUSD'),
    entry: 1.12022,
    sl: 1.11552,
    tp: 1.12822,
  })
  assert.equal(r.recommended.lot, 0.04)
  assert.equal(r.recommended.lossIdr, null)
})

test('format persen dan parsing input', () => {
  assert.equal(formatPercent(0.4195), '0.42%')
  assert.equal(formatPercent(0.5), '0.50%')
  assert.equal(formatPercent(0.0089), '0.01%')
  assert.equal(formatPercent(0.002), '<0.01%')
  assert.equal(parseDecimal('1,12022'), 1.12022)
  assert.equal(parseDecimal('1.12022'), 1.12022)
  assert.ok(Number.isNaN(parseDecimal('')))
  assert.equal(parseInteger('17.843'), 17843)
  assert.equal(parseInteger('17,843'), 17843)
})
