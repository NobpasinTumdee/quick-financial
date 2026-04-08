import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './Root.css'
import App from './App.tsx'

AOS.init({
  duration: 600,
  easing: 'ease-out-cubic',
  once: true,
  offset: 50,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
