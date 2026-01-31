import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { loadDatasetMeta, loadDatasetPage } from '../lib/data'
import type { DatasetMeta, DatasetPage, MathSample } from '../lib/types'
import { SampleCard } from '../components/SampleCard'

const DEFAULT_PAGE = 1

export function Dataset() {
  const { id } = useParams()
  const datasetId = id ?? ''

  const [sp, setSp] = useSearchParams()
  const page = Math.max(1, Number(sp.get('page') ?? DEFAULT_PAGE) || DEFAULT_PAGE)

  const [meta, setMeta] = useState<DatasetMeta | null>(null)
  const [data, setData] = useState<DatasetPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    let cancelled = false
    if (!datasetId) return

    setLoading(true)
    setError(null)

    Promise.all([loadDatasetMeta(datasetId), loadDatasetPage(datasetId, page)])
      .then(([m, p]) => {
        if (cancelled) return
        setMeta(m)
        setData(p)
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
  }, [datasetId, page])

  const samples: MathSample[] = data?.samples ?? []
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return samples
    return samples.filter((s) => {
      const topics = s.annotations?.topics ?? []
      const hay = [s.id, s.content.prompt_md, s.content.answer_md, s.content.solution_md, ...topics]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(query)
    })
  }, [samples, q])

  const total = data?.total ?? 0
  const pageSize = data?.pageSize ?? 20
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canPrev = page > 1
  const canNext = page < totalPages

  function gotoPage(nextPage: number) {
    const n = Math.min(Math.max(1, nextPage), totalPages)
    sp.set('page', String(n))
    setSp(sp, { replace: false })
  }

  return (
    <main className="page">
      <section className="section section--tight">
        <div className="crumbs">
          <Link className="crumbs__link" to="/">
            Datasets
          </Link>
          <span className="crumbs__sep">/</span>
          <span className="crumbs__current">{meta?.name ?? datasetId}</span>
        </div>

        <div className="dataset-head">
          <div>
            <h1 className="dataset-head__title">{meta?.name ?? datasetId}</h1>
            {meta?.description ? <p className="dataset-head__desc">{meta.description}</p> : null}
          </div>

          <div className="dataset-head__tools">
            <input
              className="search__input search__input--compact"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter samples…"
              aria-label="Filter samples"
            />
            <div className="pager">
              <button className="btn" disabled={!canPrev} onClick={() => gotoPage(page - 1)}>
                Prev
              </button>
              <div className="pager__info">
                Page {page} / {totalPages}
              </div>
              <button className="btn" disabled={!canNext} onClick={() => gotoPage(page + 1)}>
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        {loading ? <div className="state">Loading samples…</div> : null}
        {error ? <div className="state state--error">{error}</div> : null}

        {!loading && !error ? (
          <>
            <div className="state state--quiet">
              Showing {filtered.length} / {samples.length} on this page • Total {total}
            </div>
            <div className="samples">
              {filtered.map((s) => (
                <SampleCard key={s.id} sample={s} />
              ))}
            </div>
          </>
        ) : null}
      </section>
    </main>
  )
}
