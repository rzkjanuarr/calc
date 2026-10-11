// Config 6 pair yang didukung. Menambah pair = menambah satu objek di sini.
//
// usdIsBase = true  → USD ada di sisi kiri (USD/CHF, USD/CAD): rugi/untung keluar dalam
//                     mata uang quote, jadi harus dibagi harga untuk jadi USD.
// usdIsBase = false → USD ada di sisi kanan (EUR/USD dst): rugi/untung sudah dalam USD.
// pipSize           → 0,0001 untuk semua pair di sini. Pair JPY nanti pakai 0,01.
// sample            → harga contoh (SL 47 pip, TP 80 pip). Ganti dengan harga live.

export const PAIRS = [
  {
    symbol: 'EURUSD',
    label: 'EUR/USD',
    pipSize: 0.0001,
    digits: 5,
    usdIsBase: false,
    sample: { entry: '1.12022', sl: '1.11552', tp: '1.12822' },
  },
  {
    symbol: 'GBPUSD',
    label: 'GBP/USD',
    pipSize: 0.0001,
    digits: 5,
    usdIsBase: false,
    sample: { entry: '1.32340', sl: '1.31870', tp: '1.33140' },
  },
  {
    symbol: 'AUDUSD',
    label: 'AUD/USD',
    pipSize: 0.0001,
    digits: 5,
    usdIsBase: false,
    sample: { entry: '0.69842', sl: '0.69372', tp: '0.70642' },
  },
  {
    symbol: 'NZDUSD',
    label: 'NZD/USD',
    pipSize: 0.0001,
    digits: 5,
    usdIsBase: false,
    sample: { entry: '0.56122', sl: '0.55652', tp: '0.56922' },
  },
  {
    symbol: 'USDCHF',
    label: 'USD/CHF',
    pipSize: 0.0001,
    digits: 5,
    usdIsBase: true,
    sample: { entry: '0.83024', sl: '0.82554', tp: '0.83824' },
  },
  {
    symbol: 'USDCAD',
    label: 'USD/CAD',
    pipSize: 0.0001,
    digits: 5,
    usdIsBase: true,
    sample: { entry: '1.42559', sl: '1.42089', tp: '1.43359' },
  },
]

export const DEFAULT_PAIR = PAIRS[0]

export const getPair = (symbol) => PAIRS.find((p) => p.symbol === symbol) ?? DEFAULT_PAIR
