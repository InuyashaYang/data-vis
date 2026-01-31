import { Link } from 'react-router-dom'
import type { DatasetCard as DatasetCardType } from '../lib/types'

export function DatasetCard({ dataset }: { dataset: DatasetCardType }) {
  return (
    <Link className="card" to={`/dataset/${encodeURIComponent(dataset.id)}`}>
      <div className="card__title-row">
        <h3 className="card__title">{dataset.name}</h3>
        {dataset.taskType ? <span className="pill">{dataset.taskType}</span> : null}
      </div>
      {dataset.description ? <p className="card__desc">{dataset.description}</p> : null}
      <div className="card__meta">
        <span className="meta">Samples: {dataset.sampleCount ?? '-'}</span>
        <span className="meta">Updated: {dataset.updatedAt ?? '-'}</span>
      </div>
      {dataset.tags?.length ? (
        <div className="card__tags">
          {dataset.tags.slice(0, 6).map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  )
}
