import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// After every component's styles, so the shared hover and page-transition rules win ties.
import './motion.css'
import { PageDataProvider } from './pageData.tsx'
import { readEmbeddedPageData } from './pageDataUrl.ts'
import TransitionRouter from './TransitionRouter.tsx'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <TransitionRouter>
      <PageDataProvider cache={readEmbeddedPageData()}>
        <App />
      </PageDataProvider>
    </TransitionRouter>
  </StrictMode>
)

// Built pages arrive with their HTML already inside #root (scripts/build.mjs): React takes it over.
// The dev server sends an empty #root, so there the app is drawn from scratch.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
