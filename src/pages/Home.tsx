import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { labelVinculo } from '../lib/vinculos'
import BottomNav from '../components/BottomNav'
import { HomeSkeleton } from '../components/Skeleton'

interface Crianca {
    id: string
    nome: string
    data_nascimento: string
    emoji: string
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
    const [papel, setPapel] = useState<string | null>(null)

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
            setNomeUsuario(nome)

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
            const hoje = new Date().toISOString().split('T')[0]

            // Queries independentes entre si (todas dependem só de criancaId) → paralelas
            const [
                { data: membroCompleto },
                { data: criancaData },
                { data: membrosData },
                { data: eventosData },
            ] = await Promise.all([
                supabase
                    .from('membros_familia')
                    .select('papel')
                    .eq('user_id', user.id)
                    .eq('crianca_id', criancaId)
                    .single(),
                supabase
                    .from('criancas')
                    .select('id, nome, data_nascimento, emoji')
                    .eq('id', criancaId)
                    .single(),
                supabase
                    .from('membros_familia')
                    .select('nome, vinculo')
                    .eq('crianca_id', criancaId)
                    .eq('ativo', true),
                supabase
                    .from('eventos')
                    .select('id, titulo, data_evento, hora_evento, quem_leva')
                    .eq('crianca_id', criancaId)
                    .gte('data_evento', hoje)
                    .order('data_evento', { ascending: true })
                    .limit(3),
            ])

            if (membroCompleto) setPapel(membroCompleto.papel)
            if (criancaData) setCrianca(criancaData)
            if (membrosData) setMembros(membrosData)
            if (eventosData) setEventos(eventosData)

            setLoading(false)
        }

        carregarDados()
    }, [navigate])

    if (loading) {
        return <HomeSkeleton />
    }

    return (
        <div className="h-screen overflow-hidden bg-[#FFF8F2] flex flex-col max-w-md mx-auto">

            {/* Header */}
            <div className="px-6 pt-12 pb-6" style={{ background: 'linear-gradient(135deg, #2A1F3D 0%, #9B7FD4 100%)' }}>
        <div className="flex justify-between items-start">
            <div>
            <p className="text-white/60 text-sm">{getSaudacao()} 👋</p>
            <h1 className="text-white text-2xl font-bold mt-1">{nomeUsuario}</h1>
            </div>
            <button
            onClick={async () => {
                await supabase.auth.signOut()
                navigate('/login')
            }}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-full mt-1 transition-all"
            >
            Sair
            </button>
        </div>
        </div>

            <div className="flex-1 overflow-y-auto pb-4">

            {/* Card da criança */}
            {crianca && (
                <div className="mx-5 mt-5 bg-gradient-to-br from-[#9B7FD4] to-[#7B5BB4] rounded-3xl p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
                        {crianca.emoji || '🧒'}
                    </div>
                    <div>
                        <p className="text-white font-bold text-lg">{crianca.nome}</p>
                        <p className="text-white/70 text-xs mt-0.5">
                            {calcularIdade(crianca.data_nascimento)} anos
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {membros.map((m, i) => (
                                <span key={i} className="bg-white/15 text-white text-xs px-2 py-0.5 rounded-full">
                                    {m.nome.split(' ')[0]} · {labelVinculo(m.vinculo)}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Próximos eventos */}
            <div className="mx-5 mt-6">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-[#2A1F3D] font-bold text-base">Próximos eventos</h2>
                    <span
                        onClick={() => navigate('/calendario')}
                        className="text-xs font-semibold text-[#9B7FD4] cursor-pointer"
                    >
                        Ver todos
                    </span>
                </div>

                {eventos.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                        <p className="text-3xl mb-2">📭</p>
                        <p className="text-sm text-[#8A7A9B]">Nenhum evento próximo</p>
                        {papel === 'responsavel_principal' && (
                            <button
                                onClick={() => navigate('/calendario')}
                                className="mt-3 text-xs font-semibold text-[#9B7FD4]"
                            >
                                + Criar evento
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {eventos.map((ev) => {
                            const { dia, mes } = formatarData(ev.data_evento)
                            return (
                                <div key={ev.id} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
                                    <div className="w-10 h-11 bg-[#EDE5F8] rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                                        <span className="text-base font-bold text-[#9B7FD4] leading-none">{dia}</span>
                                        <span className="text-[9px] text-[#9B7FD4] font-bold uppercase tracking-wide">{mes}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-[#2A1F3D]">{ev.titulo}</p>
                                        <p className="text-xs text-[#8A7A9B] mt-0.5">
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

            </div>

            <BottomNav />

        </div>
    )
}