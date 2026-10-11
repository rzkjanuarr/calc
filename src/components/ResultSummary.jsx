import Card from './ui/Card.jsx'
import Badge from './ui/Badge.jsx'
import Money from './ui/Money.jsx'
import Notice from './ui/Notice.jsx'
import StatItem from './ui/StatItem.jsx'
import {
  formatLot,
  formatPercent,
  formatPips,
  formatRatio,
  formatUsd,
} from '../lib/format.js'

export default function ResultSummary({ result, numbers }) {
  if (result.status !== 'ok') {
    return (
      <Card title="Hasil" className="result">
        <Notice tone={result.status === 'error' ? 'error' : 'info'}>{result.message}</Notice>
      </Card>
    )
  }

  const { direction, recommended, warnings } = result

  return (
    <Card title="Hasil" className="result">
      <div className="result__head">
        <Badge tone={direction === 'BUY' ? 'buy' : 'sell'}>{direction === 'BUY' ? 'Buy' : 'Sell'}</Badge>
        {recommended ? (
          <>
            <p className="result__lot-label">Lot rekomendasi</p>
            <p className="result__lot" aria-live="polite">
              {formatLot(recommended.lot)}
            </p>
            <p className="result__lot-note">
              Lot ideal {result.idealLot.toFixed(4)}, dibulatkan ke kelipatan 0.01.
            </p>
          </>
        ) : (
          <>
            <p className="result__lot-label">Lot rekomendasi</p>
            <p className="result__lot result__lot--none">Tidak ada</p>
          </>
        )}
      </div>

      {warnings.map((text) => (
        <Notice key={text} tone="warn">
          {text}
        </Notice>
      ))}

      <dl className="stats">
        {recommended && (
          <StatItem
            label="Rugi di SL"
            note={`Target ${formatUsd(numbers.targetLoss)}, maksimal ${formatUsd(numbers.maxLoss)}`}
          >
            <Money usd={recommended.loss} idr={recommended.lossIdr} sign="−" tone="loss" size="lg" />
          </StatItem>
        )}
        {recommended && recommended.profit !== null && (
          <StatItem label="Profit di TP" note="Pada lot rekomendasi">
            <Money usd={recommended.profit} idr={recommended.profitIdr} sign="+" tone="profit" size="lg" />
          </StatItem>
        )}
        <StatItem
          label="Jarak SL"
          note={
            <>
              <strong>{formatPercent(result.slPct)}</strong> dari harga entry
            </>
          }
        >
          {formatPips(result.slPips)} pip
        </StatItem>
        {result.tpValid && (
          <StatItem
            label="Jarak TP"
            note={
              <>
                <strong>{formatPercent(result.tpPct)}</strong> dari harga entry
              </>
            }
          >
            {formatPips(result.tpPips)} pip
          </StatItem>
        )}
        {result.rr !== null && (
          <StatItem label="Rasio TP : SL" note="Hanya info, tidak dipakai menghitung lot">
            {formatRatio(result.rr)}
          </StatItem>
        )}
      </dl>
    </Card>
  )
}
