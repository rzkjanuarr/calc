// Satu baris statistik di dalam <dl>: label, nilai, dan catatan kecil.
export default function StatItem({ label, children, note }) {
  return (
    <div className="stat">
      <dt className="stat__label">{label}</dt>
      <dd className="stat__value">{children}</dd>
      {note && <dd className="stat__note">{note}</dd>}
    </div>
  )
}
