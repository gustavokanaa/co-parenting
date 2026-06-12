import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Supabase redireciona para a URL raiz com o token no hash.
// Reescrevemos a URL antes do React Router inicializar para que o
// usuário caia na tela correta de redefinição.
const hash = window.location.hash
if (hash.includes('type=recovery')) {
    window.history.replaceState(null, '', '/redefinir-senha' + hash)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
