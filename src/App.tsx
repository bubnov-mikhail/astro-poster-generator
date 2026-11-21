import { Infographic } from './components/Infographic'
import './App.css'

export default function App() {
  return (
    <div className="app-shell">
      <div className="toolbar no-print">
        <div>
          <strong>Небо над Москвой · 2027</strong>
          <span>Инфографика для печати · А4 · 1200 dpi</span>
        </div>
        <div className="toolbar-actions">
          <a
            className="toolbar-link"
            href="/print/nebo-moskva-2027-A4-1200dpi.jpg"
            download="nebo-moskva-2027-A4-1200dpi.jpg"
          >
            Скачать A4 · 1200 dpi
          </a>
          <button type="button" onClick={() => window.print()}>
            Печать / PDF
          </button>
        </div>
      </div>
      <Infographic />
    </div>
  )
}
