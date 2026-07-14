import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AdminApp } from './AdminApp'
import './styles.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Missing root element for admin SPA')
}

createRoot(rootElement).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
)
