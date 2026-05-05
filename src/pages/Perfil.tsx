    import { useEffect, useState } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { supabase } from '../lib/supabase'
    import { labelVinculo } from '../lib/vinculos'

    interface Crianca {
    id: string
    nome: string
    data_nascimento: string
    tipo_sanguineo: string
    alergias: string
    medicamentos: string
    pediatra: string
    pediatra_telefone: string
    escola: string
    serie: string
    periodo: string
    professora: string
    }

    interface Membro {
    nome: string
    vinculo: string
    }

    export default function Perfil() {
    const navigate = useNavigate()
    const [crianca, setCrianca] = useState<Crianca | null>(null)
    const [membros, setMembros] = useState<Membro[]>([])
    const [loading, setLoading] = useState(true)
    const [papel, setPapel] = useState<string | null>(null)

    // ── EDIÇÃO ────────────────────────────────────────────────────────
    const [mostrarEdicao, setMostrarEdicao] = useState(false)
    const [stepEdicao, setStepEdicao] = useState(1)
    const [salvando, setSalvando] = useState(false)
    const [form, setForm] = useState({
        nome: '', data_nascimento: '',
        tipo_sanguineo: '', alergias: '', medicamentos: '',
        pediatra: '', pediatra_telefone: '',
        escola: '', serie: '', periodo: '', professora: '',
    })
    // ── FIM EDIÇÃO ────────────────────────────────────────────────────

    function calcularIdade(dataNascimento: string) {
        const hoje = new Date()
        const nasc = new Date(dataNascimento)
        let idade = hoje.getFullYear() - nasc.getFullYear()
        const mes = hoje.getMonth() - nasc.getMonth()
        if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) idade--
        return idade
    }

    function formatarData(data: string) {
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
    }

    async function carregarDados() {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) { navigate('/login'); return }

        const { data: membroData } = await supabase
        .from('membros_familia')
        .select('crianca_id')
        .eq('user_id', userData.user.id)
        .eq('ativo', true)
        .limit(1)
        .single()

        if (!membroData) { navigate('/cadastro-crianca'); return }

        const { data: membroCompleto } = await supabase
        .from('membros_familia')
        .select('papel')
        .eq('user_id', userData.user.id)
        .eq('crianca_id', membroData.crianca_id)
        .single()

        if (membroCompleto) setPapel(membroCompleto.papel)

        const { data: criancaData } = await supabase
        .from('criancas')
        .select('*')
        .eq('id', membroData.crianca_id)
        .single()

        if (criancaData) {
        setCrianca(criancaData)
        setForm({
            nome: criancaData.nome || '',
            data_nascimento: criancaData.data_nascimento || '',
            tipo_sanguineo: criancaData.tipo_sanguineo || '',
            alergias: criancaData.alergias || '',
            medicamentos: criancaData.medicamentos || '',
            pediatra: criancaData.pediatra || '',
            pediatra_telefone: criancaData.pediatra_telefone || '',
            escola: criancaData.escola || '',
            serie: criancaData.serie || '',
            periodo: criancaData.periodo || '',
            professora: criancaData.professora || '',
        })
        }

        const { data: membrosData } = await supabase
        .from('membros_familia')
        .select('nome, vinculo')
        .eq('crianca_id', membroData.crianca_id)
        .eq('ativo', true)

        if (membrosData) setMembros(membrosData)
        setLoading(false)
    }

    useEffect(() => { carregarDados() }, [navigate])

    async function salvarEdicao() {
        if (!crianca) return
        setSalvando(true)
        await supabase
        .from('criancas')
        .update({
            nome: form.nome,
            data_nascimento: form.data_nascimento,
            tipo_sanguineo: form.tipo_sanguineo,
            alergias: form.alergias,
            medicamentos: form.medicamentos,
            pediatra: form.pediatra,
            pediatra_telefone: form.pediatra_telefone,
            escola: form.escola,
            serie: form.serie,
            periodo: form.periodo,
            professora: form.professora,
        })
        .eq('id', crianca.id)

        await carregarDados()
        setSalvando(false)
        setMostrarEdicao(false)
        setStepEdicao(1)
    }

    function campo(label: string, key: keyof typeof form, placeholder: string, type = 'text') {
        return (
        <div>
            <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest mb-1">{label}</p>
            <input
            type={type}
            placeholder={placeholder}
            value={form[key]}
            onChange={e => setForm({ ...form, [key]: e.target.value })}
            className="w-full border-2 border-[#E2EEEE] rounded-xl px-4 py-3 text-sm text-[#1C2B2B] outline-none focus:border-[#3D8C8C] bg-white"
            />
        </div>
        )
    }

    if (loading) {
        return (
        <div className="h-screen bg-[#FFFCF8] flex items-center justify-center max-w-md mx-auto">
            <p className="text-[#3D8C8C] font-semibold">Carregando...</p>
        </div>
        )
    }

    return (
        <div className="h-screen overflow-hidden bg-[#FFFCF8] flex flex-col max-w-md mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#1C2B2B] to-[#3D8C8C] px-6 pt-12 pb-8 flex flex-col items-center shrink-0">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl border-2 border-white/30 mb-3">
            🧒
            </div>
            <h1 className="text-white text-2xl font-bold">{crianca?.nome}</h1>
            <p className="text-white/60 text-sm mt-1">
            {crianca ? `${calcularIdade(crianca.data_nascimento)} anos · Nascido em ${formatarData(crianca.data_nascimento)}` : ''}
            </p>
            <div className="flex gap-2 mt-3 flex-wrap justify-center">
            {membros.map((m, i) => (
                <span key={i} className="bg-white/15 text-white text-xs px-3 py-1 rounded-full">
                {m.nome.split(' ')[0]} · {labelVinculo(m.vinculo)}
                </span>
            ))}
            </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 px-5 pt-5 pb-40 flex flex-col gap-4 overflow-y-auto">

            {/* Botão Editar dados */}
            {papel === 'responsavel_principal' && (
            <button
                onClick={() => { setMostrarEdicao(true); setStepEdicao(1) }}
                className="w-full bg-[#EAF4F4] text-[#3D8C8C] text-sm font-semibold px-4 py-3 rounded-2xl border border-[#D0E6E6] flex items-center justify-center gap-2 transition-all hover:bg-[#D5ECEC]"
            >
                ✏️ Editar dados
            </button>
            )}

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#EAF4F4] px-4 py-3 flex items-center gap-2">
                <span>🏥</span>
                <span className="text-xs font-bold text-[#3D8C8C] uppercase tracking-wide">Saúde</span>
            </div>
            {[
                { label: 'Tipo sanguíneo', valor: crianca?.tipo_sanguineo },
                { label: 'Alergias', valor: crianca?.alergias, destaque: true },
                { label: 'Medicamentos', valor: crianca?.medicamentos },
                { label: 'Pediatra', valor: crianca?.pediatra },
                { label: 'Telefone', valor: crianca?.pediatra_telefone },
            ].filter(item => item.valor).map((item, i) => (
                <div key={i} className="px-4 py-3 flex justify-between items-center border-b border-[#E2EEEE] last:border-0">
                <span className="text-xs text-[#8FA3A3]">{item.label}</span>
                <span className={`text-xs font-semibold ${item.destaque ? 'text-[#E07A5F] bg-[#FCEEE9] px-2 py-0.5 rounded-full' : 'text-[#1C2B2B]'}`}>
                    {item.valor}
                </span>
                </div>
            ))}
            {!crianca?.tipo_sanguineo && !crianca?.alergias && !crianca?.medicamentos && !crianca?.pediatra && !crianca?.pediatra_telefone && (
                <div className="px-4 py-4 text-xs text-[#8FA3A3] text-center">Nenhuma informação cadastrada</div>
            )}
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-[#EAF4F4] px-4 py-3 flex items-center gap-2">
                <span>🏫</span>
                <span className="text-xs font-bold text-[#3D8C8C] uppercase tracking-wide">Escola</span>
                </div>
                {[
                { label: 'Escola', valor: crianca?.escola },
                { label: 'Série', valor: crianca?.serie },
                { label: 'Período', valor: crianca?.periodo },
                { label: 'Professora', valor: crianca?.professora },
                ].filter(item => item.valor).map((item, i) => (
                <div key={i} className="px-4 py-3 flex justify-between items-center border-b border-[#E2EEEE] last:border-0">
                    <span className="text-xs text-[#8FA3A3]">{item.label}</span>
                    <span className="text-xs font-semibold text-[#1C2B2B]">{item.valor}</span>
                </div>
                ))}
                {!crianca?.escola && !crianca?.serie && !crianca?.periodo && !crianca?.professora && (
                <div className="px-4 py-4 text-xs text-[#8FA3A3] text-center">Nenhuma informação cadastrada</div>
                )}
            </div>

            <div className="flex justify-between items-center mt-2">
            <h2 className="text-sm font-bold text-[#1C2B2B]">Documentos</h2>
            <span className="text-xs font-semibold text-[#3D8C8C]">+ Adicionar</span>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <p className="text-3xl mb-2">📁</p>
            <p className="text-sm text-[#8FA3A3]">Em breve</p>
            </div>

        </div>

        {/* ── NOVO — Modal de edição ────────────────────────────────── */}
        {mostrarEdicao && (
            <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-[#FFFCF8] rounded-t-3xl px-6 pt-6 pb-10 w-full max-w-md max-h-[90vh] overflow-y-auto">

                {/* Steps */}
                <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#1C2B2B]">
                    {stepEdicao === 1 ? 'Dados básicos' : stepEdicao === 2 ? 'Saúde' : 'Escola'}
                </h2>
                <div className="flex gap-1.5">
                    {[1, 2, 3].map(s => (
                    <div key={s} className={`h-1.5 rounded-full transition-all ${
                        s === stepEdicao ? 'w-6 bg-[#3D8C8C]' : 'w-3 bg-[#E2EEEE]'
                    }`} />
                    ))}
                </div>
                </div>

                {stepEdicao === 1 && (
                <div className="flex flex-col gap-4">
                    {campo('Nome completo', 'nome', '')}
                    {campo('Data de nascimento', 'data_nascimento', '', 'date')}
                </div>
                )}

                {stepEdicao === 2 && (
                <div className="flex flex-col gap-4">
                    <p className="text-xs text-[#8FA3A3] -mt-2">Todos os campos são opcionais</p>
                    {campo('Tipo sanguíneo', 'tipo_sanguineo', '')}
                    {campo('Alergias', 'alergias', '')}
                    {campo('Medicamentos em uso', 'medicamentos', '')}
                    {campo('Pediatra', 'pediatra', '')}
                    {campo('Telefone do pediatra', 'pediatra_telefone', '')}
                </div>
                )}

                {stepEdicao === 3 && (
                <div className="flex flex-col gap-4">
                    <p className="text-xs text-[#8FA3A3] -mt-2">Todos os campos são opcionais</p>
                    {campo('Nome da escola', 'escola', '')}
                    {campo('Série', 'serie', '')}
                    {campo('Período', 'periodo', '')}
                    {campo('Professora', 'professora', '')}
                </div>
                )}

                <div className="flex gap-3 mt-6">
                <button
                    onClick={() => stepEdicao > 1 ? setStepEdicao(stepEdicao - 1) : setMostrarEdicao(false)}
                    className="flex-1 border-2 border-[#E2EEEE] text-[#8FA3A3] font-semibold py-4 rounded-full text-sm"
                >
                    {stepEdicao > 1 ? '← Voltar' : 'Cancelar'}
                </button>
                {stepEdicao < 3 ? (
                    <button
                    onClick={() => setStepEdicao(stepEdicao + 1)}
                    className="flex-1 bg-[#3D8C8C] text-white font-semibold py-4 rounded-full text-sm"
                    >
                    Continuar →
                    </button>
                ) : (
                    <button
                    onClick={salvarEdicao}
                    disabled={salvando}
                    className="flex-1 bg-[#3D8C8C] text-white font-semibold py-4 rounded-full text-sm disabled:opacity-60"
                    >
                    {salvando ? 'Salvando...' : 'Salvar →'}
                    </button>
                )}
                </div>

            </div>
            </div>
        )}
        {/* ── FIM NOVO ──────────────────────────────────────────────── */}

        {/* Bottom nav */}
        <div className="w-full border-t border-[#E2EEEE] bg-white px-4 py-3 flex justify-around items-center shrink-0">
            <button onClick={() => navigate('/home')} className="flex flex-col items-center gap-1 px-3 py-2">
            <span className="text-xl">🏠</span>
            <span className="text-[10px] text-[#8FA3A3]">Home</span>
            </button>
            <button onClick={() => navigate('/calendario')} className="flex flex-col items-center gap-1 px-3 py-2">
            <span className="text-xl">📅</span>
            <span className="text-[10px] text-[#8FA3A3]">Calendário</span>
            </button>
            <button className="flex flex-col items-center gap-1 bg-[#EAF4F4] px-3 py-2 rounded-xl">
            <span className="text-xl">👤</span>
            <span className="text-[10px] font-semibold text-[#3D8C8C]">Perfil</span>
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