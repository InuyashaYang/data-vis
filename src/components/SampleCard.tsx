import type { MathSample } from '../lib/types'
import { MarkdownMath } from './MarkdownMath'

function labelForStatus(status?: string) {
  if (!status) return null
  const s = status.toLowerCase()
  if (s === 'accepted') return 'Accepted'
  if (s === 'reviewed') return 'Reviewed'
  if (s === 'draft') return 'Draft'
  return status
}

export function SampleCard({ sample }: { sample: MathSample }) {
  const status = labelForStatus(sample.annotations?.status as string | undefined)
  const difficulty = sample.annotations?.difficulty
  const topics = sample.annotations?.topics ?? []

  return (
    <article className="sample">
      <div className="sample__header">
        <div className="sample__id">{sample.id}</div>
        <div className="sample__pills">
          {status ? <span className="pill pill--soft">{status}</span> : null}
          {difficulty ? <span className="pill pill--soft">{String(difficulty)}</span> : null}
        </div>
      </div>

      <div className="sample__block">
        <div className="sample__label">Prompt</div>
        <div className="md">
          <MarkdownMath md={sample.content.prompt_md} />
        </div>
      </div>

      {sample.content.answer_md ? (
        <div className="sample__block">
          <div className="sample__label">Answer</div>
          <div className="md">
            <MarkdownMath md={sample.content.answer_md} />
          </div>
        </div>
      ) : null}

      {sample.content.solution_md ? (
        <details className="sample__details">
          <summary className="sample__summary">Show solution</summary>
          <div className="md md--details">
            <MarkdownMath md={sample.content.solution_md} />
          </div>
        </details>
      ) : null}

      {topics.length ? (
        <div className="sample__tags">
          {topics.slice(0, 10).map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}
