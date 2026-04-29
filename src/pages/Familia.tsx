    import { useEffect, useState } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { supabase } from '../lib/supabase'
    import { VINCULOS, labelVinculo, emojiVinculo, corVinculo } from '../lib/vinculos'

    interface Membro {
    id: string
    nome: string
    vinculo: string
    papel: string
    desde: string
    user_id: string
    voce?: boolean
    }

export default function Familia() {
    const navigate = useNavigate()
    const [responsaveis, setResponsaveis] = useState<Membro[]>([])
    const [participantes, setParticipantes] = useState<Membro[]>([])
    const [loading, setLoading] = useState(true)
    const [criancaNome, setCriancaNome] = useState('')

    // ── NOVO ──────────────────────────────────────────────────────────
    const [criancaId, setCriancaId] = useState<string | null>(null)
    const [mostrarConvite, setMostrarConvite] = useState(false)
    const [linkGerado, setLinkGerado] = useState('')
    const [vincuoConvite, setVinculoConvite] = useState('mae')
    const [papelConvite, setPapelConvite] = useState('participante_familiar')
    const [gerando, setGerando] = useState(false)
    // ── FIM NOVO ──────────────────────────────────────────────────────

    useEffect(() => {
        async function carregarDados() {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) { navigate('/login'); return }

        const { data: membroAtual } = await supabase
            .from('membros_familia')
            .select('crianca_id')
            .eq('user_id', userData.user.id)
            .eq('ativo', true)
            .limit(1)
            .single()

        if (!membroAtual) { navigate('/cadastro-crianca'); return }

        const criancaId = membroAtual.crianca_id
        setCriancaId(criancaId) // ── NOVO ──

        const { data: criancaData } = await supabase
            .from('criancas')
            .select('nome')
            .eq('id', criancaId)
            .single()

        if (criancaData) setCriancaNome(criancaData.nome)

        const { data: membros } = await supabase
            .from('membros_familia')
            .select('id, nome, vinculo, papel, created_at, user_id')
            .eq('crianca_id', criancaId)
            .eq('ativo', true)
            .order('created_at', { ascending: true })

        if (membros) {
            const comVoce = membros.map(m => ({
            ...m,
            desde: new Date(m.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
            voce: m.user_id === userData.user.id,
            }))
            setResponsaveis(comVoce.filter(m => m.papel === 'responsavel_principal'))
            setParticipantes(comVoce.filter(m => m.papel === 'participante_familiar'))
        }

        setLoading(false)
        }
        carregarDados()
    }, [navigate])

    // ── NOVO ──────────────────────────────────────────────────────────
    async function gerarConvite() {
        if (!criancaId) return
        setGerando(true)
        const { data: userData } = await supabase.auth.getUser()
        const token = crypto.randomUUID()
        await supabase.from('convites').insert({
        crianca_id: criancaId,
        criado_por: userData.user?.id,
        vinculo: vincuoConvite,
        papel: papelConvite,
        token,
        })
        const link = `${window.location.origin}/convite/${token}`
        setLinkGerado(link)
        setGerando(false)
    }
    // ── FIM NOVO ──────────────────────────────────────────────────────

    function getEmoji(vinculo: string) { return emojiVinculo(vinculo) }
    function getCorAvatar(vinculo: string) { return corVinculo(vinculo) }

    if (loading) {
        return (
        <div className="min-h-screen bg-[#FFFCF8] flex items-center justify-center max-w-md mx-auto">
            <p className="text-[#3D8C8C] font-semibold">Carregando...</p>
        </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FFFCF8] flex flex-col max-w-md mx-auto">

        <div className="bg-gradient-to-br from-[#1C2B2B] to-[#2A4E4E] px-6 pt-12 pb-6">
            <h1 className="text-white text-2xl font-bold">
            Família {criancaNome ? `de ${criancaNome}` : ''}
            </h1>
            <p className="text-white/50 text-xs mt-1">Gerencie quem acompanha a vida dela</p>
        </div>

        <div className="flex-1 px-5 pt-5 pb-36 flex flex-col gap-5 overflow-y-auto">

            <div className="bg-[#EAF4F4] rounded-xl px-4 py-3">
            <p className="text-xs text-[#3D8C8C] leading-relaxed">
                <span className="font-bold">Responsável Principal</span> — controle total (máx. 2).{' '}
                <span className="font-bold">Participante Familiar</span> — visualiza e posta no diário.
            </p>
            </div>

            <div>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-[#1C2B2B]">Responsáveis Principais</h2>
                <span className="bg-[#EAF4F4] text-[#3D8C8C] text-xs font-bold px-2 py-0.5 rounded-full">
                {responsaveis.length} / 2
                </span>
            </div>
            {responsaveis.length === 0 ? (
                <p className="text-xs text-[#8FA3A3]">Nenhum responsável cadastrado</p>
            ) : (
                <div className="flex flex-col gap-3">
                {responsaveis.map(m => (
                    <div key={m.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border-l-4 border-[#3D8C8C]">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: getCorAvatar(m.vinculo) }}>
                        {getEmoji(m.vinculo)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#1C2B2B]">{m.nome}</p>
                        {m.voce && (
                            <span className="bg-[#3D8C8C] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">você</span>
                        )}
                        </div>
                        <p className="text-xs text-[#3D8C8C] font-medium">{labelVinculo(m.vinculo)} · Responsável Principal</p>
                        <p className="text-[10px] text-[#8FA3A3] mt-0.5">Desde {m.desde}</p>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>

            {participantes.length > 0 && (
            <div>
                <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-[#1C2B2B]">Participantes Familiares</h2>
                <span className="bg-[#F5EDE3] text-[#8B6A3E] text-xs font-bold px-2 py-0.5 rounded-full">
                    {participantes.length} membro{participantes.length > 1 ? 's' : ''}
                </span>
                </div>
                <div className="flex flex-col gap-3">
                {participantes.map(m => (
                    <div key={m.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border-l-4 border-[#E2EEEE]">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: getCorAvatar(m.vinculo) }}>
                        {getEmoji(m.vinculo)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#1C2B2B]">{m.nome}</p>
                        {m.voce && (
                            <span className="bg-[#3D8C8C] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">você</span>
                        )}
                        </div>
                        <p className="text-xs text-[#3D8C8C] font-medium">{labelVinculo(m.vinculo)} · Participante Familiar</p>
                        <p className="text-[10px] text-[#8FA3A3] mt-0.5">Desde {m.desde}</p>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}

        </div>

        {/* ── NOVO — Modal de convite ────────────────────────────────── */}
        {mostrarConvite && (
            <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-20">
            <div className="bg-[#FFFCF8] rounded-t-3xl px-6 pt-6 pb-10 w-full max-w-md">
                <h2 className="text-lg font-bold text-[#1C2B2B] mb-5">Convidar membro</h2>
                {!linkGerado ? (
                <>
                    <div className="flex flex-col gap-4">
                    <div>
                        <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest mb-2">Vínculo</p>
                        <div className="grid grid-cols-3 gap-2">
                        {VINCULOS.filter(v => v.id !== 'responsavel').map(v => (
                            <button key={v.id} onClick={() => setVinculoConvite(v.id)}
                            className={`rounded-xl py-3 flex flex-col items-center border-2 transition-all ${
                                vincuoConvite === v.id ? 'border-[#3D8C8C] bg-[#EAF4F4]' : 'border-[#E2EEEE] bg-white'
                            }`}>
                            <span className="text-xl">{v.emoji}</span>
                            <span className="text-xs font-semibold text-[#1C2B2B] mt-1">{v.label}</span>
                            </button>
                        ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest mb-2">Papel</p>
                        <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'responsavel_principal', label: 'Responsável Principal', desc: 'Controle total' },
                            { id: 'participante_familiar', label: 'Participante Familiar', desc: 'Visualiza e posta' },
                        ].map(p => (
                            <button key={p.id} onClick={() => setPapelConvite(p.id)}
                            className={`rounded-xl py-3 px-3 flex flex-col items-start border-2 transition-all ${
                                papelConvite === p.id ? 'border-[#3D8C8C] bg-[#EAF4F4]' : 'border-[#E2EEEE] bg-white'
                            }`}>
                            <span className="text-xs font-bold text-[#1C2B2B]">{p.label}</span>
                            <span className="text-[10px] text-[#8FA3A3] mt-0.5">{p.desc}</span>
                            </button>
                        ))}
                        </div>
                    </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                    <button onClick={() => setMostrarConvite(false)}
                        className="flex-1 border-2 border-[#E2EEEE] text-[#8FA3A3] font-semibold py-4 rounded-full text-sm">
                        Cancelar
                    </button>
                    <button onClick={gerarConvite} disabled={gerando}
                        className="flex-1 bg-[#3D8C8C] text-white font-semibold py-4 rounded-full text-sm disabled:opacity-60">
                        {gerando ? 'Gerando...' : 'Gerar link →'}
                    </button>
                    </div>
                </>
                ) : (
                <>
                    <div className="bg-[#EAF4F4] rounded-xl p-4 mb-4">
                    <p className="text-xs font-bold text-[#3D8C8C] mb-2">Link gerado! Compartilhe:</p>
                    <p className="text-xs text-[#1C2B2B] break-all">{linkGerado}</p>
                    </div>
                    <button
                    onClick={() => { navigator.clipboard.writeText(linkGerado); alert('Link copiado!') }}
                    className="w-full bg-[#3D8C8C] text-white font-semibold py-4 rounded-full text-sm mb-3">
                    📋 Copiar link
                    </button>
                    <button onClick={() => setMostrarConvite(false)}
                    className="w-full border-2 border-[#E2EEEE] text-[#8FA3A3] font-semibold py-3 rounded-full text-sm">
                    Fechar
                    </button>
                </>
                )}
            </div>
            </div>
        )}
        {/* ── FIM NOVO ──────────────────────────────────────────────── */}

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-10">
            <div className="px-5 pt-3 pb-2 bg-[#FFFCF8]">
            <button
                onClick={() => { setMostrarConvite(true); setLinkGerado('') }}
                className="w-full bg-[#3D8C8C] text-white font-semibold py-4 rounded-full text-sm flex items-center justify-center gap-2"
            >
                👋 Convidar novo membro
            </button>
            </div>
            <div className="border-t border-[#E2EEEE] bg-white px-4 py-3 flex justify-around items-center">
            <button onClick={() => navigate('/home')} className="flex flex-col items-center gap-1 px-3 py-2">
                <span className="text-xl">🏠</span>
                <span className="text-[10px] text-[#8FA3A3]">Home</span>
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
            <button className="flex flex-col items-center gap-1 bg-[#EAF4F4] px-3 py-2 rounded-xl">
                <span className="text-xl">👨‍👩‍👧</span>
                <span className="text-[10px] font-semibold text-[#3D8C8C]">Família</span>
            </button>
            </div>
        </div>

        </div>
    )
    }