import Card from './ui/Card.jsx'
import Money from './ui/Money.jsx'
import { formatPercent, formatPips, formatPrice } from '../lib/format.js'

const TOP = 9
const BOTTOM = 91

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

// Tangga harga: TP, entry, dan SL disusun vertikal seperti sumbu harga di chart.
// Posisi vertikal mengikuti perbandingan jarak, dibatasi supaya label tidak bertumpuk.
function layout({ buy, tpValid, entry, sl, tp }) {
  if (!tpValid) {
    return buy
      ? { entry: 25, sl: BOTTOM, tp: null }
      : { entry: 75, sl: TOP, tp: null }
  }
  const up = Math.abs(tp - entry)
  const down = Math.abs(entry - sl)
  const distTop = buy ? up : down
  const distBottom = buy ? down : up
  const ratio = clamp(distTop / (distTop + distBottom), 0.3, 0.7)
  const entryTop = TOP + (BOTTOM - TOP) * ratio
  return buy
    ? { entry: entryTop, sl: BOTTOM, tp: TOP }
    : { entry: entryTop, sl: TOP, tp: BOTTOM }
}

export default function PriceLadder({ result, numbers, pair }) {
  if (result.status !== 'ok') {
    return (
      <Card title="Posisi di harga" className="ladder-card">
        <p className="ladder-empty">Isi harga entry, SL, dan TP untuk melihat posisinya.</p>
      </Card>
    )
  }

  const buy = result.direction === 'BUY'
  const pos = layout({ buy, tpValid: result.tpValid, ...numbers })
  const rec = result.recommended
  const digits = pair.digits

  const markers = [
    result.tpValid && {
      key: 'tp',
      tone: 'profit',
      name: 'TP',
      price: numbers.tp,
      top: pos.tp,
      detail: `${formatPips(result.tpPips)} pip, ${formatPercent(result.tpPct)}`,
      money: rec && rec.profit !== null ? { usd: rec.profit, idr: rec.profitIdr, sign: '+' } : null,
    },
    {
      key: 'entry',
      tone: 'entry',
      name: 'Entry',
      price: numbers.entry,
      top: pos.entry,
      detail: buy ? 'Posisi Buy' : 'Posisi Sell',
      money: null,
    },
    {
      key: 'sl',
      tone: 'loss',
      name: 'SL',
      price: numbers.sl,
      top: pos.sl,
      detail: `${formatPips(result.slPips)} pip, ${formatPercent(result.slPct)}`,
      money: rec ? { usd: rec.loss, idr: rec.lossIdr, sign: '−' } : null,
    },
  ]
    .filter(Boolean)
    .sort((a, b) => a.top - b.top)

  const segment = (from, to, tone) => ({
    tone,
    top: Math.min(from, to),
    height: Math.abs(from - to),
  })
  const segments = [
    result.tpValid && segment(pos.entry, pos.tp, 'profit'),
    segment(pos.entry, pos.sl, 'loss'),
  ].filter(Boolean)

  return (
    <Card title="Posisi di harga" className="ladder-card">
      <ol className="ladder">
        {segments.map((seg) => (
          <li
            key={seg.tone}
            className={`ladder__segment ladder__segment--${seg.tone}`}
            style={{ top: `${seg.top}%`, height: `${seg.height}%` }}
            aria-hidden="true"
          />
        ))}
        {markers.map((marker) => (
          <li key={marker.key} className={`ladder__marker ladder__marker--${marker.tone}`} style={{ top: `${marker.top}%` }}>
            <span className="ladder__dot" aria-hidden="true" />
            <span className="ladder__text">
              <span className="ladder__name">{marker.name}</span>
              <span className="ladder__price">{formatPrice(marker.price, digits)}</span>
              <span className="ladder__detail">{marker.detail}</span>
              {marker.money && (
                <Money
                  usd={marker.money.usd}
                  idr={marker.money.idr}
                  sign={marker.money.sign}
                  size="sm"
                  tone={marker.tone}
                />
              )}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  )
}
