import { useState } from 'react'
import PositionForm from '../components/PositionForm.jsx'
import ResultSummary from '../components/ResultSummary.jsx'
import PriceLadder from '../components/PriceLadder.jsx'
import LotOptionsTable from '../components/LotOptionsTable.jsx'
import { usePositionCalc } from '../hooks/usePositionCalc.js'
import { DEFAULT_PAIR, getPair } from '../data/pairs.js'

const DEFAULT_FORM = {
  ...DEFAULT_PAIR.sample,
  targetLoss: '20',
  maxLoss: '30',
  usdIdr: '17843',
}

export default function Calculator() {
  const [symbol, setSymbol] = useState(DEFAULT_PAIR.symbol)
  const [form, setForm] = useState(DEFAULT_FORM)

  const pair = getPair(symbol)
  const { numbers, result } = usePositionCalc({ pair, form })

  const onFieldChange = (name) => (value) => setForm((current) => ({ ...current, [name]: value }))

  // Digit dan rentang harga tiap pair beda, jadi harga ikut diganti ke contoh pair itu.
  const onPairChange = (value) => {
    setSymbol(value)
    setForm((current) => ({ ...current, ...getPair(value).sample }))
  }

  return (
    <section className="calc container" id="kalkulator" aria-label="Kalkulator lot">
      <PositionForm
        symbol={symbol}
        onPairChange={onPairChange}
        form={form}
        onFieldChange={onFieldChange}
        result={result}
      />
      <div className="calc__output">
        <div className="calc__main">
          <ResultSummary result={result} numbers={numbers} />
          <PriceLadder result={result} numbers={numbers} pair={pair} />
        </div>
        <LotOptionsTable result={result} />
      </div>
    </section>
  )
}
