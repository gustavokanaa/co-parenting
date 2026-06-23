    import { useEffect, useState } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { supabase } from '../lib/supabase'
    import { VINCULOS, labelVinculo, emojiVinculo, corVinculo } from '../lib/vinculos'
    import BottomNav from '../components/BottomNav'

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
    const [meuPapel, setMeuPapel] = useState('')
    const [mostrarConvite, setMostrarConvite] = useState(false)
    const [linkGerado, setLinkGerado] = useState('')
    const [vinculoConvite, setVinculoConvite] = useState('mae')
    const [papelConvite, setPapelConvite] = useState('participante_familiar')
    const [gerando, setGerando] = useState(false)
    const [toastMsg, setToastMsg] = useState('')
    const [toastTipo, setToastTipo] = useState<'erro' | 'sucesso'>('erro')
    // ── FIM NOVO ──────────────────────────────────────────────────────

    useEffect(() => {
        async function carregarDados() {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) { navigate('/login'); return }

        const { data: membroAtual } = await supabase
            .from('membros_familia')
            .select('crianca_id, papel')
            .eq('user_id', userData.user.id)
            .eq('ativo', true)
            .limit(1)
            .single()

        if (!membroAtual) { navigate('/cadastro-crianca'); return }

        const criancaId = membroAtual.crianca_id
        setCriancaId(criancaId) // ── NOVO ──
        setMeuPapel(membroAtual.papel)

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
    function mostrarToast(msg: string, tipo: 'erro' | 'sucesso' = 'erro') {
        setToastTipo(tipo)
        setToastMsg(msg)
        setTimeout(() => setToastMsg(''), 4000)
    }

    function handleAbrirConvite() {
        if (meuPapel !== 'responsavel_principal') {
            mostrarToast('Você não tem permissão para convidar novos membros. Apenas o responsável principal pode realizar convites.')
            return
        }
        setMostrarConvite(true)
        setLinkGerado('')
    }

    async function gerarConvite() {
        if (!criancaId) return
        setGerando(true)

        if (papelConvite === 'responsavel_principal') {
            const { count } = await supabase
                .from('membros_familia')
                .select('*', { count: 'exact', head: true })
                .eq('crianca_id', criancaId)
                .eq('papel', 'responsavel_principal')
                .eq('ativo', true)
            if ((count ?? 0) >= 2) {
                setGerando(false)
                mostrarToast('Já existem 2 Responsáveis Principais. Remova um antes de convidar outro.')
                return
            }
        }

        const { data: userData } = await supabase.auth.getUser()
        const token = crypto.randomUUID()
        const { error: erroConvite } = await supabase.from('convites').insert({
        crianca_id: criancaId,
        criado_por: userData.user?.id,
        vinculo: vinculoConvite,
        papel: papelConvite,
        token,
        })
        if (erroConvite) {
        setGerando(false)
        mostrarToast('Erro ao gerar convite. Tente novamente.')
        return
        }
        const link = `${window.location.origin}/convite/${token}`
        setLinkGerado(link)
        setGerando(false)
    }
    // ── FIM NOVO ──────────────────────────────────────────────────────

    function getEmoji(vinculo: string) { return emojiVinculo(vinculo) }
    function getCorAvatar(vinculo: string) { return corVinculo(vinculo) }

    if (loading) {
        return (
        <div className="h-screen bg-[#FFF8F2] flex items-center justify-center max-w-md mx-auto">
            <p className="text-[#9B7FD4] font-semibold">Carregando...</p>
        </div>
        )
    }

    return (
        <div className="h-screen overflow-hidden bg-[#FFF8F2] flex flex-col max-w-md mx-auto">

        {toastMsg && (
            <div className="fixed top-4 left-0 right-0 flex justify-center z-50 px-5 pointer-events-none">
                <div
                    className="w-full max-w-md text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-lg leading-snug pointer-events-auto"
                    style={{ backgroundColor: toastTipo === 'sucesso' ? '#9B7FD4' : '#E07A5F' }}
                >
                    {toastMsg}
                </div>
            </div>
        )}

        <div className="bg-gradient-to-br from-[#2A1F3D] to-[#9B7FD4] px-6 pt-12 pb-6">
            <h1 className="text-white text-2xl font-bold">
            Família {criancaNome ? `de ${criancaNome}` : ''}
            </h1>
            <p className="text-white/50 text-xs mt-1">Gerencie quem acompanha a vida dela</p>
        </div>

        <div className="flex-1 px-5 pt-5 pb-4 flex flex-col gap-5 overflow-y-auto">

            <div className="bg-[#EDE5F8] rounded-xl px-4 py-3">
            <p className="text-xs text-[#9B7FD4] leading-relaxed">
                <span className="font-bold">Responsável Principal</span> — controle total (máx. 2).{' '}
                <span className="font-bold">Participante Familiar</span> — visualiza e posta no diário.
            </p>
            </div>

            <div>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-[#2A1F3D]">Responsáveis Principais</h2>
                <span className="bg-[#EDE5F8] text-[#9B7FD4] text-xs font-bold px-2 py-0.5 rounded-full">
                {responsaveis.length} / 2
                </span>
            </div>
            {responsaveis.length === 0 ? (
                <p className="text-xs text-[#8A7A9B]">Nenhum responsável cadastrado</p>
            ) : (
                <div className="flex flex-col gap-3">
                {responsaveis.map(m => (
                    <div key={m.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border-l-4 border-[#9B7FD4]">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: getCorAvatar(m.vinculo) }}>
                        {getEmoji(m.vinculo)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#2A1F3D]">{m.nome}</p>
                        {m.voce && (
                            <span className="bg-[#9B7FD4] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">você</span>
                        )}
                        </div>
                        <p className="text-xs text-[#9B7FD4] font-medium">{labelVinculo(m.vinculo)} · Responsável Principal</p>
                        <p className="text-[10px] text-[#8A7A9B] mt-0.5">Desde {m.desde}</p>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>

            {participantes.length > 0 && (
            <div>
                <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-[#2A1F3D]">Participantes Familiares</h2>
                <span className="bg-[#F5EDE3] text-[#8B6A3E] text-xs font-bold px-2 py-0.5 rounded-full">
                    {participantes.length} membro{participantes.length > 1 ? 's' : ''}
                </span>
                </div>
                <div className="flex flex-col gap-3">
                {participantes.map(m => (
                    <div key={m.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border-l-4 border-[#E8D5F0]">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: getCorAvatar(m.vinculo) }}>
                        {getEmoji(m.vinculo)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#2A1F3D]">{m.nome}</p>
                        {m.voce && (
                            <span className="bg-[#9B7FD4] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">você</span>
                        )}
                        </div>
                        <p className="text-xs text-[#9B7FD4] font-medium">{labelVinculo(m.vinculo)} · Participante Familiar</p>
                        <p className="text-[10px] text-[#8A7A9B] mt-0.5">Desde {m.desde}</p>
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
            <div className="bg-[#FFF8F2] rounded-t-3xl px-6 pt-6 pb-10 w-full max-w-md">
                <h2 className="text-lg font-bold text-[#2A1F3D] mb-5">Convidar membro</h2>
                {!linkGerado ? (
                <>
                    <div className="flex flex-col gap-4">
                    <div>
                        <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-2">Vínculo</p>
                        <div className="grid grid-cols-3 gap-2">
                        {VINCULOS.filter(v => v.id !== 'responsavel').map(v => (
                            <button key={v.id} onClick={() => setVinculoConvite(v.id)}
                            className={`rounded-xl py-3 flex flex-col items-center border-2 transition-all ${
                                vinculoConvite === v.id ? 'border-[#9B7FD4] bg-[#EDE5F8]' : 'border-[#E8D5F0] bg-white'
                            }`}>
                            <span className="text-xl">{v.emoji}</span>
                            <span className="text-xs font-semibold text-[#2A1F3D] mt-1">{v.label}</span>
                            </button>
                        ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-2">Papel</p>
                        <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'responsavel_principal', label: 'Responsável Principal', desc: 'Controle total' },
                            { id: 'participante_familiar', label: 'Participante Familiar', desc: 'Visualiza e posta' },
                        ].map(p => (
                            <button key={p.id} onClick={() => setPapelConvite(p.id)}
                            className={`rounded-xl py-3 px-3 flex flex-col items-start border-2 transition-all ${
                                papelConvite === p.id ? 'border-[#9B7FD4] bg-[#EDE5F8]' : 'border-[#E8D5F0] bg-white'
                            }`}>
                            <span className="text-xs font-bold text-[#2A1F3D]">{p.label}</span>
                            <span className="text-[10px] text-[#8A7A9B] mt-0.5">{p.desc}</span>
                            </button>
                        ))}
                        </div>
                    </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                    <button onClick={() => setMostrarConvite(false)}
                        className="flex-1 border-2 border-[#E8D5F0] text-[#8A7A9B] font-semibold py-4 rounded-full text-sm">
                        Cancelar
                    </button>
                    <button onClick={gerarConvite} disabled={gerando}
                        className="flex-1 bg-[#9B7FD4] text-white font-semibold py-4 rounded-full text-sm disabled:opacity-60">
                        {gerando ? 'Gerando...' : 'Gerar link →'}
                    </button>
                    </div>
                </>
                ) : (
                <>
                    <div className="bg-[#EDE5F8] rounded-xl p-4 mb-4">
                    <p className="text-xs font-bold text-[#9B7FD4] mb-2">Link gerado! Compartilhe:</p>
                    <p className="text-xs text-[#2A1F3D] break-all">{linkGerado}</p>
                    </div>
                    <button
                    onClick={() => { navigator.clipboard.writeText(linkGerado); mostrarToast('✓ Link copiado!', 'sucesso') }}
                    className="w-full bg-[#9B7FD4] text-white font-semibold py-4 rounded-full text-sm mb-3">
                    📋 Copiar link
                    </button>
                    <button onClick={() => setMostrarConvite(false)}
                    className="w-full border-2 border-[#E8D5F0] text-[#8A7A9B] font-semibold py-3 rounded-full text-sm">
                    Fechar
                    </button>
                </>
                )}
            </div>
            </div>
        )}
        {/* ── FIM NOVO ──────────────────────────────────────────────── */}

        <div className="w-full shrink-0">
            <div className="px-5 pt-3 pb-2 bg-[#FFF8F2]">
            <button
                onClick={handleAbrirConvite}
                className="w-full bg-[#9B7FD4] text-white font-semibold py-4 rounded-full text-sm flex items-center justify-center gap-2"
            >
                👋 Convidar novo membro
            </button>
            </div>
            <BottomNav />
        </div>

        </div>
    )
    }