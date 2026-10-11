import { PAIRS } from '../data/pairs.js';

export default function Hero() {
  return (
    <section className="hero container" id="top">
      <h1 className="hero__title">
        Lot dihitung dari batas rugi, bukan ditebak.
      </h1>
      <p className="hero__lead">
        Masukkan entry, SL, dan TP. Lot dihitung dari batas rugimu — lengkap
        dengan nilai dolar dan rupiah.
      </p>
      {/* <div className="hero__actions">
        <a className="btn" href="#kalkulator">
          Mulai hitung
        </a>
        <p className="hero__pairs">Mendukung {PAIRS.map((pair) => pair.label).join(', ')}.</p>
      </div> */}
    </section>
  );
}
