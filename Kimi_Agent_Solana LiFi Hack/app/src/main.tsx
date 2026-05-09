import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Buffer } from 'buffer'
import './index.css'
import App from './App.tsx'

if (!(window as any).Buffer) {
  (window as any).Buffer = Buffer
}

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
  </HashRouter>,
)
