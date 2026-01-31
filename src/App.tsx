import { Navigate, Route, Routes } from 'react-router-dom'
import { TopBar } from './components/TopBar'
import { Home } from './pages/Home'
import { Dataset } from './pages/Dataset'
import { SITE_CONTACT } from './lib/site'

export default function App() {
  return (
    <div className="app">
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dataset/:id" element={<Dataset />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="footer">
        <div className="footer__inner">
          <span>Static site • GitHub Pages ready</span>
          <div className="footer__right">
            <span className="footer__contact">Contact: {SITE_CONTACT || '-'}</span>
            <a className="footer__link" href="https://github.com" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
