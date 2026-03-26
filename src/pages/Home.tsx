import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

interface Crianca {
    id: string
    nome: string
    data_nascimento: string
}

interface Membro {
    nome: string
    vinculo: string
}

interface Evento {
    id: string
    titulo: string
    data_evento: string
    hora_evento: string
    quem_leva: string
}

export default function Home() {
    const navigate = useNavigate()
    const [nomeUsuario, setNomeUsuario] = useState('')
    const [crianca, setCrianca] = useState<Crianca | null>(null)
    const [membros, setMembros] = useState<Membro[]>([])
    const [eventos, setEventos] = useState<Evento[]>([])
    const [loading, setLoading] = useState(true)

    function calcularIdade(dataNascimento: string) {
        const hoje = new Date()
        const nasc = new Date(dataNascimento)
        let idade = hoje.getFullYear() - nasc.getFullYear()
        const mes = hoje.getMonth() - nasc.getMonth()
        if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) idade--
        return idade
    }

    function getSaudacao() {
        const hora = new Date().getHours()
        if (hora < 12) return 'Bom dia'
        if (hora < 18) return 'Boa tarde'
        return 'Boa noite'
    }

    function formatarData(data: string) {
        const d = new Date(data + 'T00:00:00')
        return {
            dia: d.getDate().toString(),
            mes: d.toLocaleString('pt-BR', { month: 'short' }).replace('.', ''),
        }
    }

    useEffect(() => {
        async function carregarDados() {
            const { data: userData } = await supabase.auth.getUser()
            if (!userData.user) { navigate('/login'); return }

            const user = userData.user
            const nome = user.user_metadata?.nome_completo || 'Responsável'
            setNomeUsuario(nome.split(' ')[0])

            // Busca o membro para encontrar a criança
            const { data: membroData } = await supabase
                .from('membros_familia')
                .select('crianca_id')
                .eq('user_id', user.id)
                .eq('ativo', true)
                .limit(1)
                .single()

            if (!membroData) {
                navigate('/cadastro-crianca')
                return
            }

            const criancaId = membroData.crianca_id

            // Busca dados da criança
            const { data: criancaData } = await supabase
                .from('criancas')
                .select('id, nome, data_nascimento')
                .eq('id', criancaId)
                .single()

            if (criancaData) setCrianca(criancaData)

            // Busca membros da família
            const { data: membrosData } = await supabase
                .from('membros_familia')
                .select('nome, vinculo')
                .eq('crianca_id', criancaId)
                .eq('ativo', true)

            if (membrosData) setMembros(membrosData)

            // Busca próximos eventos
            const hoje = new Date().toISOString().split('T')[0]
            const { data: eventosData } = await supabase
                .from('eventos')
                .select('id, titulo, data_evento, hora_evento, quem_leva')
                .eq('crianca_id', criancaId)
                .gte('data_evento', hoje)
                .order('data_evento', { ascending: true })
                .limit(3)

            if (eventosData) setEventos(eventosData)

            setLoading(false)
        }

        carregarDados()
    }, [navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFFCF8] flex items-center justify-center">
                <p className="text-[#3D8C8C] font-semibold">Carregando...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FFFCF8] flex flex-col max-w-md mx-auto">

            {/* Header */}
            <div className="bg-[#1C2B2B] px-6 pt-12 pb-6">
                <p className="text-white/60 text-sm">{getSaudacao()} 👋</p>
                <h1 className="text-white text-2xl font-bold mt-1">{nomeUsuario}</h1>
            </div>

            {/* Card da criança */}
            {crianca && (
                <div className="mx-5 mt-5 bg-gradient-to-br from-[#3D8C8C] to-[#2A6E6E] rounded-3xl p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
                        🧒
                    </div>
                    <div>
                        <p className="text-white font-bold text-lg">{crianca.nome}</p>
                        <p className="text-white/70 text-xs mt-0.5">
                            {calcularIdade(crianca.data_nascimento)} anos
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {membros.map((m, i) => (
                                <span key={i} className="bg-white/15 text-white text-xs px-2 py-0.5 rounded-full">
                                    {m.nome.split(' ')[0]} · {m.vinculo}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Próximos eventos */}
            <div className="mx-5 mt-6">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-[#1C2B2B] font-bold text-base">Próximos eventos</h2>
                    <span
                        onClick={() => navigate('/calendario')}
                        className="text-xs font-semibold text-[#3D8C8C] cursor-pointer"
                    >
                        Ver todos
                    </span>
                </div>

                {eventos.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                        <p className="text-3xl mb-2">📭</p>
                        <p className="text-sm text-[#8FA3A3]">Nenhum evento próximo</p>
                        <button
                            onClick={() => navigate('/calendario')}
                            className="mt-3 text-xs font-semibold text-[#3D8C8C]"
                        >
                            + Criar evento
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {eventos.map((ev) => {
                            const { dia, mes } = formatarData(ev.data_evento)
                            return (
                                <div key={ev.id} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
                                    <div className="w-10 h-11 bg-[#EAF4F4] rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                                        <span className="text-base font-bold text-[#3D8C8C] leading-none">{dia}</span>
                                        <span className="text-[9px] text-[#6BB5B5] font-bold uppercase tracking-wide">{mes}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-[#1C2B2B]">{ev.titulo}</p>
                                        <p className="text-xs text-[#8FA3A3] mt-0.5">
                                            {ev.hora_evento ? ev.hora_evento.slice(0, 5) + 'h' : 'Dia inteiro'}
                                            {ev.quem_leva ? ` · ${ev.quem_leva} leva` : ''}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div style={{ height: 80 }} />

            {/* Bottom nav */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-[#E2EEEE] bg-white px-4 py-3 flex justify-around items-center">
                <button className="flex flex-col items-center gap-1 bg-[#EAF4F4] px-3 py-2 rounded-xl">
                    <span className="text-xl">🏠</span>
                    <span className="text-[10px] font-semibold text-[#3D8C8C]">Home</span>
                </button>
                <button onClick={() => navigate('/calendario')} className="flex flex-col items-center gap-1 px-3 py-2">
                    <span className="text-xl">📅</span>
                    <span className="text-[10px] text-[#8FA3A3]">Calendário</span>
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