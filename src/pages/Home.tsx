import { useEffect, useMemo, useState } from 'react'
import { loadIndex } from '../lib/data'
import type { DatasetCard as DatasetCardType } from '../lib/types'
import { DatasetCard } from '../components/DatasetCard'

export function Home() {
  const [datasets, setDatasets] = useState<DatasetCardType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    loadIndex()
      .then((idx) => {
        if (cancelled) return
        setDatasets(idx.datasets ?? [])
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return datasets
    return datasets.filter((d) => {
      const hay = [d.id, d.name, d.description, d.taskType, ...(d.tags ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(query)
    })
  }, [datasets, q])

  return (
    <main className="page">
      <section className="hero">
        <div className="hero__inner">
          <h1 className="hero__title">Math Dataset Showcase</h1>
          <p className="hero__subtitle">A simple GitHub Pages gallery for markdown-based math annotation samples.</p>

          <div className="search">
            <input
              className="search__input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search datasets..."
              aria-label="Search datasets"
            />
            <div className="search__hint">{filtered.length} / {datasets.length}</div>
          </div>
        </div>
      </section>

      <section className="section">
        {loading ? <div className="state">Loading datasets…</div> : null}
        {error ? <div className="state state--error">{error}</div> : null}

        {!loading && !error ? (
          <div className="grid">
            {filtered.map((d) => (
              <DatasetCard key={d.id} dataset={d} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  )
}
