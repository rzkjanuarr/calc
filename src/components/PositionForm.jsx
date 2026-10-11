import Card from './ui/Card.jsx'
import NumberInput from './ui/NumberInput.jsx'
import SelectField from './ui/SelectField.jsx'
import { PAIRS } from '../data/pairs.js'

const pairOptions = PAIRS.map((pair) => ({ value: pair.symbol, label: pair.label }))

export default function PositionForm({ symbol, onPairChange, form, onFieldChange, result }) {
  const slInvalid = result.status === 'error' && result.field === 'sl'
  const maxInvalid = result.status === 'error' && result.field === 'maxLoss'
  const tpInvalid = result.status === 'ok' && !result.tpValid

  return (
    <Card title="Data posisi" className="form">
      <SelectField
        id="pair"
        label="Pair"
        value={symbol}
        onChange={onPairChange}
        options={pairOptions}
        hint="Memilih pair mengisi harga contoh. Ganti dengan harga dari MT5."
      />

      <div className="form__group">
        <NumberInput id="entry" label="Harga entry" value={form.entry} onChange={onFieldChange('entry')} />
        <NumberInput
          id="sl"
          label="Harga SL"
          value={form.sl}
          onChange={onFieldChange('sl')}
          invalid={slInvalid}
        />
        <NumberInput
          id="tp"
          label="Harga TP"
          value={form.tp}
          onChange={onFieldChange('tp')}
          invalid={tpInvalid}
        />
      </div>

      <div className="form__group form__group--pair">
        <NumberInput
          id="target-loss"
          label="Target rugi"
          prefix="$"
          value={form.targetLoss}
          onChange={onFieldChange('targetLoss')}
        />
        <NumberInput
          id="max-loss"
          label="Maksimal rugi"
          prefix="$"
          value={form.maxLoss}
          onChange={onFieldChange('maxLoss')}
          invalid={maxInvalid}
        />
      </div>

      <NumberInput
        id="usd-idr"
        label="Kurs USD ke rupiah"
        prefix="Rp"
        suffix="per $1"
        inputMode="numeric"
        value={form.usdIdr}
        onChange={onFieldChange('usdIdr')}
        hint="Angka contoh. Ubah ke kurs terbaru. Hanya mengubah tampilan rupiah."
      />
    </Card>
  )
}
