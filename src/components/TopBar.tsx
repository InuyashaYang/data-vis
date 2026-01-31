import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const THEME_KEY = 'theme'
type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  const stored = window.localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: light)')?.matches ? 'light' : 'dark'
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

function toggleTheme() {
  const cur = (document.documentElement.dataset.theme as Theme | undefined) ?? 'dark'
  const next: Theme = cur === 'light' ? 'dark' : 'light'
  window.localStorage.setItem(THEME_KEY, next)
  applyTheme(next)
}

export function TopBar() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const t = getInitialTheme()
    setTheme(t)
    applyTheme(t)

    const mq = window.matchMedia?.('(prefers-color-scheme: light)')
    if (!mq) return
    const onChange = () => {
      const stored = window.localStorage.getItem(THEME_KEY)
      if (stored === 'light' || stored === 'dark') return
      const next: Theme = mq.matches ? 'light' : 'dark'
      setTheme(next)
      applyTheme(next)
    }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  function onToggleTheme() {
    toggleTheme()
    const t = (document.documentElement.dataset.theme as Theme | undefined) ?? 'dark'
    setTheme(t)
  }

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link className="brand" to="/">
          <span className="brand__mark">DV</span>
          <span className="brand__name">Dataset Showcase</span>
        </Link>
        <nav className="nav">
          <NavLink className={({ isActive }) => (isActive ? 'nav__link is-active' : 'nav__link')} to="/">
            Datasets
          </NavLink>
          <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? 'Light' : 'Dark'}
          </button>
        </nav>
      </div>
    </header>
  )
}
