    import { useEffect, useState } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { supabase } from '../lib/supabase'

    const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

    interface Evento {
    id: string
    titulo: string
    data_evento: string
    hora_evento: string
    quem_leva: string
    quem_busca: string
    criado_por: string
    }

    interface Confirmacao {
    evento_id: string
    user_id: string
    nome: string
    status: string
    }

    interface NovoEvento {
    titulo: string
    data_evento: string
    hora_evento: string
    quem_leva: string
    quem_busca: string
    }

    export default function Calendario() {
    const navigate = useNavigate()
    const hoje = new Date()
    const [mes, setMes] = useState(hoje.getMonth())
    const [ano, setAno] = useState(hoje.getFullYear())
    const [eventos, setEventos] = useState<Evento[]>([])
    const [confirmacoes, setConfirmacoes] = useState<Confirmacao[]>([])
    const [criancaId, setCriancaId] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [nomeUsuario, setNomeUsuario] = useState('')
    const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null)
    const [mostrarForm, setMostrarForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [papel, setPapel] = useState<String | null>(null)
    const [modalExcluir, setModalExcluir] = useState<string | null>(null)
    const [novoEvento, setNovoEvento] = useState<NovoEvento>({
        titulo: '', data_evento: '', hora_evento: '', quem_leva: '', quem_busca: '',
    })

    const diaAtual = hoje.getDate()
    const mesAtualReal = hoje.getMonth()
    const anoAtualReal = hoje.getFullYear()
    const diasNoMes = new Date(ano, mes + 1, 0).getDate()
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay()
    const nomeMes = new Date(ano, mes).toLocaleString('pt-BR', { month: 'long' })

    async function carregarEventos(cid: string, m: number, a: number) {
        const inicioMes = `${a}-${String(m + 1).padStart(2, '0')}-01`
        const fimMes = `${a}-${String(m + 1).padStart(2, '0')}-${new Date(a, m + 1, 0).getDate()}`
        const { data } = await supabase
        .from('eventos')
        .select('*')
        .eq('crianca_id', cid)
        .gte('data_evento', inicioMes)
        .lte('data_evento', fimMes)
        .order('data_evento', { ascending: true })
        if (data) setEventos(data)
    }

    async function carregarConfirmacoes(cid: string, m: number, a: number) {
        const inicioMes = `${a}-${String(m + 1).padStart(2, '0')}-01`
        const fimMes = `${a}-${String(m + 1).padStart(2, '0')}-${new Date(a, m + 1, 0).getDate()}`
        const { data: eventosDoMes } = await supabase
        .from('eventos')
        .select('id')
        .eq('crianca_id', cid)
        .gte('data_evento', inicioMes)
        .lte('data_evento', fimMes)
        if (!eventosDoMes || eventosDoMes.length === 0) return
        const ids = eventosDoMes.map(e => e.id)
        const { data } = await supabase
        .from('confirmacoes_evento')
        .select('*')
        .in('evento_id', ids)
        if (data) setConfirmacoes(data)
    }

    useEffect(() => {
        async function carregarDados() {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) { navigate('/login'); return }

        setUserId(userData.user.id)
        const nome = userData.user.user_metadata?.nome_completo || 'Responsável'
        setNomeUsuario(nome)

        const { data: membroData } = await supabase
            .from('membros_familia')
            .select('crianca_id')
            .eq('user_id', userData.user.id)
            .eq('ativo', true)
            .limit(1)
            .single()

        if (!membroData) { navigate('/cadastro-crianca'); return }

        setCriancaId(membroData.crianca_id)

        const { data: membroCompleto} = await supabase
            .from('membros_familia')
            .select('papel')
            .eq('user_id', userData.user.id)
            .eq('crianca_id', membroData.crianca_id)
            .single()

        if (membroCompleto) setPapel(membroCompleto.papel)

        await carregarEventos(membroData.crianca_id, mes, ano)
        await carregarConfirmacoes(membroData.crianca_id, mes, ano)
        }
        carregarDados()
    }, [navigate, mes, ano])

    async function confirmarPresenca(eventoId: string, status: 'confirmado' | 'recusado') {
        if (!userId) return
        const existente = confirmacoes.find(c => c.evento_id === eventoId && c.user_id === userId)
        if (existente) {
        await supabase
            .from('confirmacoes_evento')
            .update({ status })
            .eq('evento_id', eventoId)
            .eq('user_id', userId)
        } else {
        await supabase.from('confirmacoes_evento').insert({
            evento_id: eventoId,
            user_id: userId,
            nome: nomeUsuario,
            status,
        })
        }
        if (criancaId) await carregarConfirmacoes(criancaId, mes, ano)
    }

    function excluirEvento(eventoId: string) {
        setModalExcluir(eventoId)
    }

    async function confirmarExclusao() {
        if (!modalExcluir) return
        await supabase.from('eventos').delete().eq('id', modalExcluir)
        setEventos(prev => prev.filter(e => e.id !== modalExcluir))
        setConfirmacoes(prev => prev.filter(c => c.evento_id !== modalExcluir))
        setModalExcluir(null)
    }

    async function salvarEvento() {
        if (papel !== 'responsavel_principal') return
        if (!novoEvento.titulo.trim()) {
            alert('Informe o título do evento.')
            return
        }
        if (!novoEvento.data_evento) {
            alert('Informe a data do evento.')
            return
        }
        if (!criancaId) return
        setLoading(true)
        const { data: userData } = await supabase.auth.getUser()
        await supabase.from('eventos').insert({
        crianca_id: criancaId,
        criado_por: userData.user?.id,
        titulo: novoEvento.titulo,
        data_evento: novoEvento.data_evento,
        hora_evento: novoEvento.hora_evento || null,
        quem_leva: novoEvento.quem_leva,
        quem_busca: novoEvento.quem_busca,
        })
        const dataEvento = new Date(novoEvento.data_evento + 'T00:00:00')
        const novoMes = dataEvento.getMonth()
        const novoAno = dataEvento.getFullYear()
        setMes(novoMes)
        setAno(novoAno)
        await carregarEventos(criancaId, novoMes, novoAno)
        await carregarConfirmacoes(criancaId, novoMes, novoAno)
        setNovoEvento({ titulo: '', data_evento: '', hora_evento: '', quem_leva: '', quem_busca: '' })
        setMostrarForm(false)
        setLoading(false)
    }

    function getMinhasConfirmacao(eventoId: string) {
        return confirmacoes.find(c => c.evento_id === eventoId && c.user_id === userId)
    }

    function getConfirmacoesPorEvento(eventoId: string) {
        return confirmacoes.filter(c => c.evento_id === eventoId)
    }

    const diasComEvento = eventos.map(e => new Date(e.data_evento + 'T00:00:00').getDate())
    const eventosFiltrados = diaSelecionado
        ? eventos.filter(e => new Date(e.data_evento + 'T00:00:00').getDate() === diaSelecionado)
        : eventos

    return (
        <div className="h-screen overflow-hidden bg-[#FFF8F2] flex flex-col max-w-md mx-auto relative">

        {/* Header */}
        <div className="px-6 pt-12 pb-0" style={{ background: 'linear-gradient(135deg, #2A1F3D 0%, #9B7FD4 100%)' }}>
            <div className="flex items-center justify-between">
            <h1 className="text-white text-2xl font-bold">Calendário</h1>
            </div>
            <div className="flex items-center justify-between mt-1">
            <button
                onClick={() => { if (mes === 0) { setMes(11); setAno(ano - 1) } else setMes(mes - 1); setDiaSelecionado(null) }}
                className="text-white/60 hover:text-white text-2xl px-2"
            >‹</button>
            <p className="text-white/70 text-sm capitalize">{nomeMes} {ano}</p>
            <button
                onClick={() => { if (mes === 11) { setMes(0); setAno(ano + 1) } else setMes(mes + 1); setDiaSelecionado(null) }}
                className="text-white/60 hover:text-white text-2xl px-2"
            >›</button>
            </div>

            <div className="grid grid-cols-7 mt-4">
            {diasSemana.map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-white/40 uppercase py-1">{d}</div>
            ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1 pb-5">
            {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: diasNoMes }, (_, i) => i + 1).map(dia => {
                const temEvento = diasComEvento.includes(dia)
                const ehHoje = dia === diaAtual && mes === mesAtualReal && ano === anoAtualReal
                const selecionado = dia === diaSelecionado
                return (
                <button key={dia} onClick={() => setDiaSelecionado(selecionado ? null : dia)}
                    className={`relative flex flex-col items-center justify-center aspect-square rounded-full text-sm mx-auto w-8 transition-all
                    ${ehHoje ? 'bg-[#9B7FD4] text-white font-bold' : ''}
                    ${selecionado && !ehHoje ? 'bg-white/20 text-white font-bold' : ''}
                    ${!ehHoje && !selecionado ? 'text-white/60' : ''}
                    `}>
                    {dia}
                    {temEvento && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#FF7B54]" />}
                </button>
                )
            })}
            </div>
        </div>

        {/* Lista de eventos */}
        <div className="flex-1 px-5 pt-5 pb-32 flex flex-col gap-4 overflow-y-auto">
            <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest">
            {diaSelecionado ? `${diaSelecionado} de ${nomeMes}` : 'Todos os eventos do mês'}
            </p>

            {eventosFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-4xl mb-3">📭</span>
                <p className="text-sm text-[#8A7A9B]">Nenhum evento{diaSelecionado ? ' neste dia' : ' este mês'}</p>
            </div>
            )}

            {eventosFiltrados.map((ev) => {
            const minhaConfirmacao = getMinhasConfirmacao(ev.id)
            const todasConfirmacoes = getConfirmacoesPorEvento(ev.id)
            return (
                <div key={ev.id} className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-[#9B7FD4] relative">
                {papel === 'responsavel_principal' && (
                    <button
                    onClick={() => excluirEvento(ev.id)}
                    className="absolute top-3 right-3 text-[#C4C4C4] hover:text-[#C0392B] transition-colors text-base leading-none"
                    title="Excluir evento"
                    >
                    🗑
                    </button>
                )}
                <p className="text-sm font-bold text-[#2A1F3D]">{ev.titulo}</p>
                <p className="text-xs text-[#8A7A9B] mt-1">
                    {ev.hora_evento ? ev.hora_evento.slice(0, 5) + 'h' : 'Dia inteiro'}
                    {ev.quem_leva ? ` · ${ev.quem_leva} leva` : ''}
                    {ev.quem_busca ? ` · ${ev.quem_busca} busca` : ''}
                </p>

                {/* Confirmações existentes */}
                {todasConfirmacoes.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3">
                    {todasConfirmacoes.map((c, i) => (
                        <span key={i} className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        c.status === 'confirmado'
                            ? 'bg-[#E8F5E9] text-[#388E3C]'
                            : 'bg-[#FDECEA] text-[#C0392B]'
                        }`}>
                        {c.status === 'confirmado' ? '✓' : '✕'} {c.nome.split(' ')[0]}
                        </span>
                    ))}
                    </div>
                )}

                {/* Botões de confirmação */}
                <div className="flex gap-2 mt-3">
                    <button
                    onClick={() => confirmarPresenca(ev.id, 'confirmado')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                        minhaConfirmacao?.status === 'confirmado'
                        ? 'bg-[#388E3C] text-white'
                        : 'bg-[#E8F5E9] text-[#388E3C]'
                    }`}
                    >
                    ✓ Vou
                    </button>
                    <button
                    onClick={() => confirmarPresenca(ev.id, 'recusado')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                        minhaConfirmacao?.status === 'recusado'
                        ? 'bg-[#C0392B] text-white'
                        : 'bg-[#FDECEA] text-[#C0392B]'
                    }`}
                    >
                    ✕ Não vou
                    </button>
                </div>
                </div>
            )
            })}
        </div>

        {/* Modal novo evento */}
        {mostrarForm && (
            <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-20">
            <div className="bg-[#FFF8F2] rounded-t-3xl px-6 pt-6 pb-10 w-full max-w-md">
                <h2 className="text-lg font-bold text-[#2A1F3D] mb-5">Novo evento</h2>
                <div className="flex flex-col gap-4">
                {[
                    { label: 'Título', key: 'titulo', placeholder: '', type: 'text' },
                    { label: 'Data', key: 'data_evento', placeholder: '', type: 'date' },
                    { label: 'Horário', key: 'hora_evento', placeholder: '', type: 'time' },
                    { label: 'Quem leva', key: 'quem_leva', placeholder: '', type: 'text' },
                    { label: 'Quem busca', key: 'quem_busca', placeholder: '', type: 'text' },
                ].map(field => (
                    <div key={field.key}>
                    <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-1">{field.label}</p>
                    <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={novoEvento[field.key as keyof NovoEvento]}
                        onChange={e => setNovoEvento({ ...novoEvento, [field.key]: e.target.value })}
                        className="w-full border-2 border-[#E8D5F0] rounded-xl px-4 py-3 text-sm text-[#2A1F3D] outline-none focus:border-[#9B7FD4] bg-white"
                    />
                    </div>
                ))}
                </div>
                <div className="flex gap-3 mt-6">
                <button onClick={() => setMostrarForm(false)}
                    className="flex-1 border-2 border-[#E8D5F0] text-[#8A7A9B] font-semibold py-4 rounded-full text-sm">
                    Cancelar
                </button>
                <button onClick={salvarEvento} disabled={loading}
                    className="flex-1 bg-[#9B7FD4] text-white font-semibold py-4 rounded-full text-sm disabled:opacity-60">
                    {loading ? 'Salvando...' : 'Salvar'}
                </button>
                </div>
            </div>
            </div>
        )}

        {/* Modal de confirmação de exclusão */}
        {modalExcluir && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 px-5">
            <div className="bg-[#FFF8F2] rounded-2xl p-6 w-full max-w-sm shadow-xl">
                <div className="flex flex-col items-center text-center gap-3">
                <span className="text-4xl">🗑️</span>
                <h2 className="text-lg font-bold text-[#2A1F3D]">Excluir evento?</h2>
                <p className="text-sm text-[#8A7A9B] leading-relaxed">
                    Esta ação não pode ser desfeita. O evento será removido para todos os membros da família.
                </p>
                </div>
                <div className="flex gap-3 mt-6">
                <button
                    onClick={() => setModalExcluir(null)}
                    className="flex-1 border-2 border-[#E8D5F0] text-[#8A7A9B] font-semibold py-4 rounded-full text-sm"
                >
                    Cancelar
                </button>
                <button
                    onClick={confirmarExclusao}
                    className="flex-1 text-white font-semibold py-4 rounded-full text-sm"
                    style={{ backgroundColor: '#FF7B54' }}
                >
                    Excluir
                </button>
                </div>
            </div>
            </div>
        )}

        {/* FAB */}
        {papel === 'responsavel_principal' && (
        <button
            onClick={() => setMostrarForm(true)}
            className="absolute bottom-24 right-4 w-12 h-12 bg-[#FF7B54] rounded-full flex items-center justify-center text-white text-2xl shadow-lg z-10"
        >
            +
        </button>
        )}

        {/* Bottom nav */}
        <div className="w-full border-t border-[#E8D5F0] bg-white px-4 py-3 flex justify-around items-center shrink-0">
            <button onClick={() => navigate('/home')} className="flex flex-col items-center gap-1 px-3 py-2">
            <span className="text-xl">🏠</span>
            <span className="text-[10px] text-[#8A7A9B]">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 bg-[#EDE5F8] px-3 py-2 rounded-xl">
            <span className="text-xl">📅</span>
            <span className="text-[10px] font-semibold text-[#9B7FD4]">Calendário</span>
            </button>
            <button onClick={() => navigate('/perfil')} className="flex flex-col items-center gap-1 px-3 py-2">
            <span className="text-xl">👤</span>
            <span className="text-[10px] text-[#8A7A9B]">Perfil</span>
            </button>
            <button onClick={() => navigate('/diario')} className="flex flex-col items-center gap-1 px-3 py-2">
            <span className="text-xl">📖</span>
            <span className="text-[10px] text-[#8A7A9B]">Diário</span>
            </button>
            <button onClick={() => navigate('/familia')} className="flex flex-col items-center gap-1 px-3 py-2">
            <span className="text-xl">👨‍👩‍👧</span>
            <span className="text-[10px] text-[#8A7A9B]">Família</span>
            </button>
        </div>

        </div>
    )
    }