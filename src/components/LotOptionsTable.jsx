import Card from './ui/Card.jsx';
import Badge from './ui/Badge.jsx';
import Money from './ui/Money.jsx';
import { formatLot } from '../lib/format.js';

function Status({ option }) {
  if (option.isRecommended) return <Badge tone="ok">Rekomendasi</Badge>;
  if (option.withinMax) return <Badge tone="neutral">Dalam batas</Badge>;
  return <Badge tone="over">Lewat batas</Badge>;
}

// Alternatif lot di sekitar lot ideal, lengkap dengan rugi dan profit masing-masing.
export default function LotOptionsTable({ result }) {
  if (result.status !== 'ok') return null;
  const showProfit = result.tpValid;

  return (
    <Card title="Pilihan lot lain" className="options">
      <div className="table-wrap">
        <table className="table">
          <caption className="sr-only">
            Alternatif lot beserta rugi di SL dan profit di TP
          </caption>
          <thead>
            <tr>
              <th scope="col">Lot</th>
              <th scope="col">Rugi di SL</th>
              {showProfit && <th scope="col">Profit di TP</th>}
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {result.options.map((option) => (
              <tr
                key={option.steps}
                className={option.isRecommended ? 'is-recommended' : undefined}>
                <th scope="row" className="table__lot">
                  {formatLot(option.lot)}
                </th>
                <td>
                  <Money
                    usd={option.loss}
                    idr={option.lossIdr}
                    sign="−"
                    size="sm"
                    tone="loss"
                  />
                </td>
                {showProfit && (
                  <td>
                    <Money
                      usd={option.profit}
                      idr={option.profitIdr}
                      sign="+"
                      size="sm"
                      tone="profit"
                    />
                  </td>
                )}
                <td>
                  <Status option={option} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
