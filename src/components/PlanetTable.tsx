import { PLANETS, SOURCES } from '../data/astronomy2027'
import { MoonIcon } from './MoonIcon'

export function PlanetTable() {
  return (
    <div className="table-block">
      <div className="table-heading">
        <h2>Периоды наблюдения планет · Москва, 2027</h2>
      </div>

      <div className="legend-row">
        <span className="legend-item">
          <MoonIcon kind="new" size={22} /> Новолуние
        </span>
        <span className="legend-item">
          <MoonIcon kind="first" size={22} /> 1-я четверть (свет справа)
        </span>
        <span className="legend-item">
          <MoonIcon kind="full" size={22} /> Полнолуние
        </span>
        <span className="legend-item">
          <MoonIcon kind="last" size={22} /> Последняя четверть (свет слева)
        </span>
      </div>

      <table className="planet-table">
        <thead>
          <tr>
            <th>Планета</th>
            <th>Окна видимости</th>
            <th>Ключевое событие</th>
            <th>Заметка наблюдателя</th>
          </tr>
        </thead>
        <tbody>
          {PLANETS.map((p) => (
            <tr key={p.id}>
              <td>
                <span className="planet-swatch" style={{ background: p.color }} />
                <strong>{p.name}</strong>
              </td>
              <td>{p.tablePeriod}</td>
              <td>{p.highlight}</td>
              <td>{p.tableNote}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="sources">{SOURCES}</p>
    </div>
  )
}
