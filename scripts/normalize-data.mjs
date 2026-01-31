import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..')
const RAW_DIR = path.join(ROOT, 'raw', 'data')
const OUT_DIR = path.join(ROOT, 'public', 'data')

const LATEX_COMMANDS = new Set([
  'frac',
  'int',
  'sqrt',
  'sum',
  'prod',
  'lim',
  'left',
  'right',
  'cdot',
  'times',
  'pm',
  'ge',
  'le',
  'neq',
  'infty',
  'log',
  'ln',
  'sin',
  'cos',
  'tan',
  'pi',
  'theta',
  'alpha',
  'beta',
  'gamma',
  'Delta',
  'lambda',
  'mu',
  'sigma',
  'phi',
  'varepsilon',
  'epsilon',
  'forall',
  'exists',
])

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function writeJson(file, obj) {
  ensureDir(path.dirname(file))
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8')
}

function normalizeTokenizedText(input) {
  if (typeof input !== 'string') return input
  let s = input

  // Collapse doubled backslashes that often appear in tokenized exports.
  // Keep doing it a few times to handle \\\\ -> \\ -> \\.
  for (let i = 0; i < 4; i++) s = s.replace(/\\\\/g, '\\')

  // Convert tokenized spaces.
  s = s.replace(/\\\s/g, ' ')

  // Remove wrapping backslashes around words: \Compute\ -> Compute
  s = s.replace(/\\([A-Za-z0-9]+)\\/g, '$1')

  // Unescape common punctuation tokens.
  const punct = {
    '{': '{',
    '}': '}',
    '(': '(',
    ')': ')',
    '[': '[',
    ']': ']',
    '^': '^',
    '_': '_',
    '+': '+',
    '=': '=',
    '.': '.',
    ':': ':',
    ';': ';',
    '!': '!',
    '?': '?',
    ',': ',',
    '|': '|',
  }
  s = s.replace(/\\([{}()[\]^_+=.:;!?|,])/g, (_, ch) => punct[ch] ?? ch)

  // If we still have \Word, keep the backslash only for known LaTeX commands.
  s = s.replace(/\\([A-Za-z]+)\b/g, (m, cmd) => (LATEX_COMMANDS.has(cmd) ? m : cmd))

  // Cleanup multiple spaces.
  s = s.replace(/[ \t]{2,}/g, ' ').trim()
  return s
}

function wrapMathHeuristic(md) {
  if (typeof md !== 'string') return md
  const s = md
  if (s.includes('$')) return s

  const firstCmd = s.search(/\\(frac|int|sqrt|sum|prod|lim|left|right|ge|le|cdot|times|pm)\b/)
  if (firstCmd === -1) return s

  // If it's basically only a formula, wrap everything.
  const prefix = s.slice(0, firstCmd)
  const rest = s.slice(firstCmd)

  // Move trailing punctuation out of math.
  const m = rest.match(/^(.*?)([.?!,:;])?$/)
  const core = (m?.[1] ?? rest).trim()
  const tail = m?.[2] ?? ''

  // If prefix is short/wordy, treat rest as the math chunk.
  if (prefix.trim().length === 0) return `$${core}$${tail}`
  return `${prefix}$${core}$${tail}`
}

function normalizeMarkdownMath(md) {
  if (typeof md !== 'string') return md
  const cleaned = normalizeTokenizedText(md)

  // Apply line-level wrapping for solutions containing multiple statements.
  if (cleaned.includes('\n')) {
    return wrapMathHeuristic(cleaned)
  }

  const lines = cleaned.split('\n')
  const out = lines.map((line) => {
    const t = line.trim()
    if (!t) return ''
    if (t.includes('$')) return line
    if (/\\(frac|int|sqrt|sum|prod|lim|left|right)\b/.test(t) && (/[=_^]/.test(t) || /\\ge\b|\\le\b/.test(t))) {
      return `$${t}$`
    }
    return wrapMathHeuristic(line)
  })
  return out.join('\n')
}

function normalizeDatasetPage(page) {
  if (!page || typeof page !== 'object') return page
  if (!Array.isArray(page.samples)) return page

  const samples = page.samples.map((s) => {
    if (!s || typeof s !== 'object') return s
    const content = s.content && typeof s.content === 'object' ? { ...s.content } : null
    if (content) {
      if (typeof content.prompt_md === 'string') content.prompt_md = normalizeMarkdownMath(content.prompt_md)
      if (typeof content.answer_md === 'string') content.answer_md = normalizeMarkdownMath(content.answer_md)
      if (typeof content.solution_md === 'string') content.solution_md = normalizeMarkdownMath(content.solution_md)
    }
    return { ...s, content: content ?? s.content }
  })

  return { ...page, samples }
}

function copyIfExists(src, dst) {
  if (!fs.existsSync(src)) return false
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    ensureDir(dst)
    for (const ent of fs.readdirSync(src)) {
      copyIfExists(path.join(src, ent), path.join(dst, ent))
    }
    return true
  }
  ensureDir(path.dirname(dst))
  fs.copyFileSync(src, dst)
  return true
}

function main() {
  if (!fs.existsSync(RAW_DIR)) {
    // Nothing to do; keep existing public/data.
    return
  }

  // Start by copying raw -> out, then normalize pages in-place.
  copyIfExists(RAW_DIR, OUT_DIR)

  const datasetsDir = path.join(OUT_DIR, 'datasets')
  if (!fs.existsSync(datasetsDir)) return

  for (const datasetId of fs.readdirSync(datasetsDir)) {
    const pagesDir = path.join(datasetsDir, datasetId, 'pages')
    if (!fs.existsSync(pagesDir)) continue
    for (const file of fs.readdirSync(pagesDir)) {
      if (!file.endsWith('.json')) continue
      const full = path.join(pagesDir, file)
      const page = readJson(full)
      const normalized = normalizeDatasetPage(page)
      writeJson(full, normalized)
    }
  }
}

main()
