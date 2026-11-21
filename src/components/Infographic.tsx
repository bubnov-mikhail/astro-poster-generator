import { CircularChart } from './CircularChart'
import { PlanetTable } from './PlanetTable'

export function Infographic() {
  return (
    <article className="poster" id="poster">
      <div className="poster-sky" aria-hidden>
        <img
          className="poster-sky-img"
          src="/art/moscow-evening-sky.jpg"
          alt=""
          draggable={false}
        />
        <div className="poster-sky-veil" />
      </div>

      <header className="poster-header">
        <p className="eyebrow">Астрономический календарь наблюдателя</p>
        <h1>Небо над Москвой · 2027</h1>
      </header>

      <div className="chart-wrap">
        <div className="chart-stage">
          <CircularChart />
        </div>
      </div>

      <PlanetTable />

      <footer className="poster-footer">
        <span>Печать: А4 или 10×15 · масштаб «по ширине листа»</span>
        <span>Северное полушарие: у растущей Луны свет справа</span>
      </footer>
    </article>
  )
}
