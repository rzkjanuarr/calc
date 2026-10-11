// tone: warn | error | info. Error dibacakan langsung oleh screen reader.
export default function Notice({ tone = 'info', children }) {
  return (
    <p className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}
