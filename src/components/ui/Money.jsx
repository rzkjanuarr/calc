import { formatIdr, formatPercent, formatUsd } from '../../lib/format.js'

// Menampilkan nilai dalam USD (utama) dan IDR (di bawahnya, otomatis).
// sign: "+" atau "−" ditulis di depan angka. size: sm | md | lg. tone: profit | loss.
export default function Money({ usd, idr, pct, sign = '', size = 'md', tone }) {
  const hasIdr = typeof idr === 'number' && Number.isFinite(idr)
  const hasPct = typeof pct === 'number' && Number.isFinite(pct)
  return (
    <span className={`money money--${size}${tone ? ` money--${tone}` : ''}`}>
      <span className="money__usd">
        {sign}
        {formatUsd(usd)}
      </span>
      {hasIdr && (
        <span className="money__idr">
          {sign}
          {formatIdr(idr)}
        </span>
      )}
      {hasPct && <span className="money__pct">{formatPercent(pct)}</span>}
    </span>
  )
}
