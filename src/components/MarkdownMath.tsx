import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

function normalizeLatex(md: string) {
  // JSON strings treat some sequences like "\f" (form feed) and "\b" (backspace)
  // which can silently break LaTeX commands like "\frac" or "\beta".
  // This tries to recover common cases without being overly clever.
  let s = md

  // Control chars that commonly appear when backslashes were not escaped in JSON.
  // "\f" in JSON becomes a form-feed control char in the parsed string.
  s = s.replace(/\f(?=rac)/g, '\\frac')

  // Replace remaining form-feed/backspace chars with a backslash.
  s = s.replace(/\f/g, '\\')
  s = s.replace(/\x08/g, '\\')

  // Also recover cases where the backslash is stripped entirely (e.g. "frac{a}{b}").
  s = s.replace(/(^|[^\\])frac\{/g, '$1\\frac{')
  s = s.replace(/(^|[^\\])ge(?=\b|\s|\d|\{|\}|\)|\]|\.|,|;|:|$)/g, '$1\\ge')
  s = s.replace(/(^|[^\\])le(?=\b|\s|\d|\{|\}|\)|\]|\.|,|;|:|$)/g, '$1\\le')
  s = s.replace(/(^|[^\\])cdot\b/g, '$1\\cdot')
  s = s.replace(/(^|[^\\])sqrt\{/g, '$1\\sqrt{')
  s = s.replace(/(^|[^\\])int\b/g, '$1\\int')

  return s
}

export function MarkdownMath({ md }: { md: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {normalizeLatex(md)}
    </ReactMarkdown>
  )
}
