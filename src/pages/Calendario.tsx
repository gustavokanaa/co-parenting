import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const eventos = [
    { dia: 15, titulo: 'Consulta pediatra', hora: '14h00', criador: 'Ana', quemLeva: 'Carlos', confirmacoes: ['Ana ✓', 'Carlos ✓'], cor: '#3D8C8C' },
    { dia: 18, titulo: 'Mostra Cultural — Escola', hora: '19h00', criador: 'Escola', quemLeva: '', confirmacoes: ['Ana ✓', 'Carlos ⏳'], cor: '#E07A5F' },
    { dia: 22, titulo: 'Aniversário Sofia', hora: 'Dia inteiro', criador: 'Ana', quemLeva: '', confirmacoes: ['Ana ✓', 'Carlos ✓'], cor: '#D4B896' },
]

const diasComEvento = [15, 18, 22]

export default function Calendario() {
    const navigate = useNavigate()
    const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null)

  // Março 2026 começa no domingo (0)
    const diasMes = Array.from({ length: 31 }, (_, i) => i + 1)
  const offset = 0 // domingo

    const eventosDoDia = diaSelecionado
    ? eventos.filter(e => e.dia === diaSelecionado)
    : eventos

    return (
    <div className="min-h-screen bg-[#FFFCF8] flex flex-col max-w-md mx-auto">

      {/* Header */}
        <div className="bg-[#1C2B2B] px-6 pt-12 pb-0">
        <h1 className="text-white text-2xl font-bold">Calendário</h1>
        <p className="text-white/50 text-xs mt-1">Março 2026 · Sofia</p>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 mt-5">
            {diasSemana.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-white/40 uppercase py-1">
                {d}
            </div>
            ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-y-1 pb-5">
            {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} />
            ))}
            {diasMes.map(dia => {
            const temEvento = diasComEvento.includes(dia)
            const hoje = dia === 24
            const selecionado = dia === diaSelecionado
            return (
                <button
                key={dia}
                onClick={() => setDiaSelecionado(selecionado ? null : dia)}
                className={`relative flex flex-col items-center justify-center aspect-square rounded-full text-sm mx-auto w-8 transition-all
                    ${hoje ? 'bg-[#3D8C8C] text-white font-bold' : ''}
                    ${selecionado && !hoje ? 'bg-white/20 text-white font-bold' : ''}
                    ${!hoje && !selecionado ? 'text-white/60' : ''}
                `}
                >
                {dia}
                {temEvento && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#E07A5F]" />
                )}
                </button>
            )
            })}
        </div>
        </div>

      {/* Lista de eventos */}
        <div className="flex-1 px-5 pt-5 pb-24 flex flex-col gap-4 overflow-y-auto">
        {diaSelecionado && (
            <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest">
            {diaSelecionado} de Março
            </p>
        )}
        {!diaSelecionado && (
            <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest">
            Próximos eventos
            </p>
        )}

        {eventosDoDia.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-3">📭</span>
            <p className="text-sm text-[#8FA3A3]">Nenhum evento neste dia</p>
            </div>
        )}

        {eventosDoDia.map((ev, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm" style={{ borderLeft: `4px solid ${ev.cor}` }}>
            <p className="text-sm font-bold text-[#1C2B2B]">{ev.titulo}</p>
            <p className="text-xs text-[#8FA3A3] mt-1">
                {ev.hora} {ev.criador ? `· Criado por ${ev.criador}` : ''} {ev.quemLeva ? `· ${ev.quemLeva} leva` : ''}
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
                {ev.confirmacoes.map((c, j) => (
                <span
                    key={j}
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    c.includes('✓')
                        ? 'bg-[#E8F5E9] text-[#388E3C]'
                        : 'bg-[#FFF8E1] text-[#F57F17]'
                    }`}
                >
                    {c}
                </span>
                ))}
            </div>
            </div>
        ))}
        </div>

      {/* FAB */}
        <button className="fixed bottom-20 right-4 w-12 h-12 bg-[#E07A5F] rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
        +
        </button>

      {/* Bottom nav */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-[#E2EEEE] bg-white px-4 py-3 flex justify-around items-center">
        <button onClick={() => navigate('/home')} className="flex flex-col items-center gap-1 px-3 py-2">
            <span className="text-xl">🏠</span>
            <span className="text-[10px] text-[#8FA3A3]">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 bg-[#EAF4F4] px-3 py-2 rounded-xl">
            <span className="text-xl">📅</span>
            <span className="text-[10px] font-semibold text-[#3D8C8C]">Calendário</span>
        </button>
        <button onClick={() => navigate('/perfil')} className="flex flex-col items-center gap-1 px-3 py-2">
            <span className="text-xl">👤</span>
            <span className="text-[10px] text-[#8FA3A3]">Perfil</span>
        </button>
        <button onClick={() => navigate('/diario')} className="flex flex-col items-center gap-1 px-3 py-2">
            <span className="text-xl">📖</span>
            <span className="text-[10px] text-[#8FA3A3]">Diário</span>
        </button>
        <button onClick={() => navigate('/familia')} className="flex flex-col items-center gap-1 px-3 py-2">
            <span className="text-xl">👨‍👩‍👧</span>
            <span className="text-[10px] text-[#8FA3A3]">Família</span>
        </button>
        </div>

    </div>
    )
}