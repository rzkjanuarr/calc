# Lot Dinamis

Kalkulator lot forex berbasis React + Vite. Lot dihitung dari batas rugi dan jarak entry ke SL.
Mendukung EUR/USD, GBP/USD, AUD/USD, NZD/USD, USD/CHF, USD/CAD. Nilai ditampilkan dalam USD
dan IDR, jarak SL/TP juga ditampilkan dalam pip dan persen.

## Menjalankan

```bash
npm install
npm run dev      # development di http://localhost:5173
npm test         # tes logika hitung (node:test, tanpa dependency tambahan)
npm run build    # hasil build di folder dist/
```

## Struktur

```
src/
├─ lib/
│   ├─ forex.js          logika hitung (fungsi murni, tanpa React)
│   ├─ forex.test.js     12 tes: EUR/USD, USD/CHF, USD/CAD, Sell, SL terlalu lebar, dll
│   └─ format.js         parsing input + format USD, IDR, persen, pip
├─ data/pairs.js         config 6 pair (pipSize, digits, usdIsBase, harga contoh)
├─ hooks/usePositionCalc.js
├─ components/
│   ├─ ui/               NumberInput, SelectField, Card, Badge, Notice, Money, StatItem
│   ├─ PositionForm.jsx
│   ├─ ResultSummary.jsx
│   ├─ PriceLadder.jsx
│   └─ LotOptionsTable.jsx
├─ sections/             Header, Hero, Calculator, HowItWorks, Footer
└─ styles.css
```

## Rumus

```
jarak SL        = |entry − SL|
rugi per 1 lot  = 100.000 × jarak            (USD/CHF, USD/CAD: ÷ entry)
lot ideal       = target rugi ÷ rugi per 1 lot
lot rekomendasi = kelipatan 0,01 dengan rugi paling dekat ke target, tidak lewat batas maksimal
profit TP       = lot × 100.000 × |TP − entry|   (USD/CHF, USD/CAD: ÷ entry)
persen          = jarak ÷ entry × 100
```

## Menambah pair

Tambah satu objek di `src/data/pairs.js`. Pair JPY: `pipSize: 0.01`, `usdIsBase: true` untuk
USD/JPY. Pair cross (EUR/GBP dll) belum didukung karena butuh konversi ke USD lewat pair lain.

## Catatan

- Konversi ke USD memakai harga entry (pendekatan). MT5 memakai harga saat posisi ditutup.
- Kurs USD/IDR di form adalah angka contoh, ubah manual.
- Cek Contract size dan Min volume akunmu di MT5 (klik kanan pair → Specification).
