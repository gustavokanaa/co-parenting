import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Home() {
const navigate = useNavigate()
const [nomeUsuario, setNomeUsuario] = useState('')

useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
    if (!data.user) {
        navigate('/login')
        return
    }
    const nome = data.user.user_metadata?.nome_completo || 'Responsável'
    setNomeUsuario(nome.split(' ')[0])
    })
}, [navigate])

function getSaudacao() {
    const hora = new Date().getHours()
    if (hora < 12) return 'Bom dia'
    if (hora < 18) return 'Boa tarde'
    return 'Boa noite'
}

const eventos = [
    { dia: '15', mes: 'Mar', titulo: 'Consulta pediatra', sub: 'Dr. Mendes · 14h · Carlos leva', cor: '#3D8C8C' },
    { dia: '18', mes: 'Mar', titulo: 'Mostra Cultural — Escola', sub: '19h · Aguardando confirmação', cor: '#E07A5F' },
    { dia: '22', mes: 'Mar', titulo: 'Aniversário Sofia', sub: '🎉 Planejamento em andamento', cor: '#D4B896' },
]

return (
    <div className="min-h-screen bg-[#FFFCF8] flex flex-col max-w-md mx-auto">

      {/* Header */}
    <div className="bg-[#1C2B2B] px-6 pt-12 pb-6">
        <p className="text-white/60 text-sm">{getSaudacao()} 👋</p>
        <h1 className="text-white text-2xl font-bold mt-1">{nomeUsuario}</h1>
    </div>

      {/* Card da criança */}
    <div className="mx-5 mt-5 bg-gradient-to-br from-[#3D8C8C] to-[#2A6E6E] rounded-3xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
        🧒
        </div>
        <div>
        <p className="text-white font-bold text-lg">Sofia</p>
        <p className="text-white/70 text-xs mt-0.5">7 anos · 2ª série</p>
        <div className="flex gap-2 mt-2 flex-wrap">
            <span className="bg-white/15 text-white text-xs px-2 py-0.5 rounded-full">👩 Ana · Mãe</span>
            <span className="bg-white/15 text-white text-xs px-2 py-0.5 rounded-full">👨 Carlos · Pai</span>
            <span className="bg-white/15 text-white text-xs px-2 py-0.5 rounded-full">👵 Rosa · Avó</span>
        </div>
        </div>
    </div>

      {/* Humor do dia */}
    <div className="mx-5 mt-4 bg-[#FCEEE9] rounded-2xl p-4 flex items-center gap-3">
        <span className="text-4xl">😊</span>
        <div>
        <p className="text-xs font-bold text-[#E07A5F] uppercase tracking-wide">Humor hoje</p>
        <p className="text-sm text-[#1C2B2B] mt-0.5">Sofia foi para escola animada — registrado por Carlos</p>
        </div>
    </div>

      {/* Próximos eventos */}
    <div className="mx-5 mt-6">
        <div className="flex justify-between items-center mb-3">
        <h2 className="text-[#1C2B2B] font-bold text-base">Próximos eventos</h2>
        <span className="text-xs font-semibold text-[#3D8C8C]">Ver todos</span>
        </div>
        <div className="flex flex-col gap-3">
        {eventos.map((ev, i) => (
            <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-11 bg-[#EAF4F4] rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-base font-bold text-[#3D8C8C] leading-none">{ev.dia}</span>
                <span className="text-[9px] text-[#6BB5B5] font-bold uppercase tracking-wide">{ev.mes}</span>
            </div>
            <div className="flex-1">
                <p className="text-sm font-semibold text-[#1C2B2B]">{ev.titulo}</p>
                <p className="text-xs text-[#8FA3A3] mt-0.5">{ev.sub}</p>
            </div>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ev.cor }} />
            </div>
        ))}
        </div>
    </div>

      {/* Bottom nav */}
    <div className="mt-auto mx-0 border-t border-[#E2EEEE] bg-white px-4 py-3 flex justify-around items-center">
        <button className="flex flex-col items-center gap-1 bg-[#EAF4F4] px-3 py-2 rounded-xl">
        <span className="text-xl">🏠</span>
        <span className="text-[10px] font-semibold text-[#3D8C8C]">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 px-3 py-2">
        <span className="text-xl">📅</span>
        <span className="text-[10px] text-[#8FA3A3]">Calendário</span>
        </button>
        <button className="flex flex-col items-center gap-1 px-3 py-2">
        <span className="text-xl">👤</span>
        <span className="text-[10px] text-[#8FA3A3]">Perfil</span>
        </button>
        <button className="flex flex-col items-center gap-1 px-3 py-2">
        <span className="text-xl">📖</span>
        <span className="text-[10px] text-[#8FA3A3]">Diário</span>
        </button>
        <button className="flex flex-col items-center gap-1 px-3 py-2">
        <span className="text-xl">👨‍👩‍👧</span>
        <span className="text-[10px] text-[#8FA3A3]">Família</span>
        </button>
        </div>

    </div>
    )
    }