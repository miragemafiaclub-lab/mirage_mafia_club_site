import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// Built pages arrive with their HTML already inside #root (scripts/build.mjs): React takes it over.
// The dev server sends an empty #root, so there the app is drawn from scratch.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
