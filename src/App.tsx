import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

function App() {
  const [status, setStatus] = useState("Testando conexão")

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      setStatus("Conexão bem sucedida!")
    }).catch(() => {
      setStatus("Falha na conexão.")
    })
  }, [])
  
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-teal-700 mb-4">Co-parenting</h1>
        <p className="text-gray-600">{status}</p>
        </div>
    </div>
  )
}

export default App