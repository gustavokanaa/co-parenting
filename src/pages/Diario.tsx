import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
    IconSun, IconMoon, IconSunset2, IconTrophy, IconHeartRateMonitor, IconSparkles,
    IconHeart, IconMessageCircle, IconNotebook, IconCamera, IconTrash,
} from '@tabler/icons-react'
import { labelVinculo } from '../lib/vinculos'
import BottomNav from '../components/BottomNav'
import { DiarioSkeleton } from '../components/Skeleton'

const TAGS = [
    { key: '☀️ Manhã',     icon: IconSun,               label: 'Manhã',     color: '#BA7517', bg: '#FAEEDA' },
    { key: '🌙 Noite',     icon: IconMoon,              label: 'Noite',     color: '#185FA5', bg: '#E6F1FB' },
    { key: '🏠 Tarde',     icon: IconSunset2,           label: 'Tarde',     color: '#639922', bg: '#EAF3DE' },
    { key: '🚲 Conquista', icon: IconTrophy,            label: 'Conquista', color: '#534AB7', bg: '#EEEDFE' },
    { key: '🏥 Saúde',     icon: IconHeartRateMonitor,  label: 'Saúde',     color: '#A32D2D', bg: '#FCEBEB' },
    { key: '🌟 Especial',  icon: IconSparkles,          label: 'Especial',  color: '#0F6E56', bg: '#E1F5EE' },
]

interface Post {
    id: string
    autor_id: string
    autor_nome: string
    autor_vinculo: string
    autor_papel: string
    texto: string
    tag: string
    tem_foto: boolean
    reacoes: number
    created_at: string
    resposta_a: string | null
}

const POSTS_POR_PAGINA = 20

export default function Diario() {
    const navigate = useNavigate()
    const [posts, setPosts] = useState<Post[]>([])
    const [criancaId, setCriancaId] = useState<string | null>(null)
    const [criancaNome, setCriancaNome] = useState('')
    const [texto, setTexto] = useState('')
    const [tag, setTag] = useState('')
    const [loading, setLoading] = useState(false)
    const [erroPost, setErroPost] = useState('')
    const [autorNome, setAutorNome] = useState('')
    const [autorVinculo, setAutorVinculo] = useState('')
    const [autorPapel, setAutorPapel] = useState('')
    const [userId, setUserId] = useState<string | null>(null)
    const [curtidos, setCurtidos] = useState<Set<string>>(new Set())
    const [respondendo, setRespondendo] = useState<string | null>(null)
    const [textoResposta, setTextoResposta] = useState<Record<string, string>>({})
    const [respostas, setRespostas] = useState<Record<string, Post[]>>({})
    const [temMaisPosts, setTemMaisPosts] = useState(false)
    const [carregandoMais, setCarregandoMais] = useState(false)
    const [carregandoInicial, setCarregandoInicial] = useState(true)
    const [modalExcluirPost, setModalExcluirPost] = useState<string | null>(null)

    useEffect(() => {
        async function carregarDados() {
            const { data: userData } = await supabase.auth.getUser()
            if (!userData.user) { navigate('/login'); return }

            const user = userData.user
            const nome = user.user_metadata?.nome_completo || 'Responsável'
            setAutorNome(nome)
            setUserId(user.id)

            // Independentes entre si (dependem só de user.id) → paralelas
            const [{ data: reacoes }, { data: membroData }] = await Promise.all([
                supabase
                    .from('diario_reacoes')
                    .select('post_id')
                    .eq('user_id', user.id),
                supabase
                    .from('membros_familia')
                    .select('crianca_id, vinculo, papel')
                    .eq('user_id', user.id)
                    .eq('ativo', true)
                    .limit(1)
                    .single(),
            ])
            if (reacoes) setCurtidos(new Set(reacoes.map(r => r.post_id as string)))

            if (!membroData) { navigate('/cadastro-crianca'); return }

            setAutorVinculo(membroData.vinculo)
            setAutorPapel(membroData.papel)
            setCriancaId(membroData.crianca_id)

            // Independentes entre si (dependem só de crianca_id) → paralelas
            const [{ data: criancaData }] = await Promise.all([
                supabase
                    .from('criancas')
                    .select('nome')
                    .eq('id', membroData.crianca_id)
                    .single(),
                carregarPosts(membroData.crianca_id),
            ])

            if (criancaData) setCriancaNome(criancaData.nome)
            setCarregandoInicial(false)
        }
        carregarDados()
    }, [navigate])

    async function carregarPosts(cid: string) {
        const { data } = await supabase
            .from('posts_diario')
            .select('*')
            .eq('crianca_id', cid)
            .is('resposta_a', null)
            .order('created_at', { ascending: false })
            .range(0, POSTS_POR_PAGINA - 1)
        if (data) {
            setPosts(data)
            setTemMaisPosts(data.length === POSTS_POR_PAGINA)
            await carregarRespostas(data.map(p => p.id))
        }
    }

    async function carregarMaisPosts() {
        if (!criancaId || carregandoMais) return
        setCarregandoMais(true)
        const { data } = await supabase
            .from('posts_diario')
            .select('*')
            .eq('crianca_id', criancaId)
            .is('resposta_a', null)
            .order('created_at', { ascending: false })
            .range(posts.length, posts.length + POSTS_POR_PAGINA - 1)
        if (data) {
            setPosts(prev => [...prev, ...data])
            setTemMaisPosts(data.length === POSTS_POR_PAGINA)
            await carregarRespostas(data.map(p => p.id))
        }
        setCarregandoMais(false)
    }

    // ── NOVO ── busca as respostas (posts com resposta_a preenchido) dos posts-pai informados
    async function carregarRespostas(postIds: string[]) {
        if (postIds.length === 0) return
        const { data } = await supabase
            .from('posts_diario')
            .select('*')
            .in('resposta_a', postIds)
            .order('created_at', { ascending: true })

        setRespostas(prev => {
            const agrupado = { ...prev }
            for (const id of postIds) agrupado[id] = []
            for (const r of data || []) {
                const pai = r.resposta_a as string
                agrupado[pai] = [...(agrupado[pai] || []), r]
            }
            return agrupado
        })
    }

    function excluirPost(postId: string) {
        setModalExcluirPost(postId)
    }

    async function confirmarExclusaoPost() {
        if (!modalExcluirPost) return
        const idExcluido = modalExcluirPost
        await supabase.from('posts_diario').delete().eq('id', idExcluido)
        setPosts(prev => prev.filter(p => p.id !== idExcluido))
        // ── NOVO ── remove o item do mapa de respostas, seja ele um post-pai (cai em cascata no banco) ou uma resposta
        setRespostas(prev => {
            const atualizado: Record<string, Post[]> = {}
            for (const [paiId, lista] of Object.entries(prev)) {
                if (paiId === idExcluido) continue
                atualizado[paiId] = lista.filter(r => r.id !== idExcluido)
            }
            return atualizado
        })
        setModalExcluirPost(null)
    }

    async function publicarPost() {
        if (!texto.trim() || !criancaId) return
        setLoading(true)
        setErroPost('')

        const { data: userData } = await supabase.auth.getUser()
        const { error: erroInsert } = await supabase.from('posts_diario').insert({
            crianca_id: criancaId,
            autor_id: userData.user?.id,
            autor_nome: autorNome,
            autor_vinculo: autorVinculo,
            autor_papel: autorPapel,
            texto,
            tag: tag || null,
        })

        if (erroInsert) {
            setErroPost('Erro ao publicar. Tente novamente.')
            setLoading(false)
            return
        }

        setTexto('')
        setTag('')
        await carregarPosts(criancaId)
        setLoading(false)
    }

    async function toggleCurtida(post: Post) {
        if (!userId) return
        const jaCurtiu = curtidos.has(post.id)

        // Optimistic update
        const novoCurtidos = new Set(curtidos)
        jaCurtiu ? novoCurtidos.delete(post.id) : novoCurtidos.add(post.id)
        setCurtidos(novoCurtidos)
        setPosts(prev => prev.map(p => p.id === post.id
            ? { ...p, reacoes: jaCurtiu ? p.reacoes - 1 : p.reacoes + 1 }
            : p
        ))

        if (jaCurtiu) {
            await supabase
                .from('diario_reacoes')
                .delete()
                .eq('user_id', userId)
                .eq('post_id', post.id)
        } else {
            const { error } = await supabase
                .from('diario_reacoes')
                .insert({ user_id: userId, post_id: post.id })
            if (error) {
                // Rollback se já existia (violação de PK)
                setCurtidos(curtidos)
                setPosts(prev => prev.map(p => p.id === post.id ? { ...p, reacoes: post.reacoes } : p))
                return
            }
        }

        // Sincroniza contador real no post
        const { count } = await supabase
            .from('diario_reacoes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)

        await supabase
            .from('posts_diario')
            .update({ reacoes: count ?? 0 })
            .eq('id', post.id)
    }

    async function publicarResposta(postOriginal: Post) {
        const texto = textoResposta[postOriginal.id]?.trim()
        if (!texto || !criancaId || !userId) return

        // ── NOVO ── resposta é gravada com resposta_a apontando pro post-pai, sem prefixo de seta/nome no texto
        const { error } = await supabase.from('posts_diario').insert({
            crianca_id: criancaId,
            autor_id: userId,
            autor_nome: autorNome,
            autor_vinculo: autorVinculo,
            autor_papel: autorPapel,
            texto,
            tag: null,
            resposta_a: postOriginal.id,
        })

        if (!error) {
            setRespondendo(null)
            setTextoResposta(prev => ({ ...prev, [postOriginal.id]: '' }))
            await carregarRespostas([postOriginal.id])
        }
    }

    function formatarTempo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime()
        const min = Math.floor(diff / 60000)
        const h = Math.floor(diff / 3600000)
        const d = Math.floor(diff / 86400000)
        if (min < 1) return 'Agora'
        if (min < 60) return `Há ${min} min`
        if (h < 24) return `Há ${h}h`
        if (d === 1) return 'Ontem'
        return `Há ${d} dias`
    }

    function getCorAvatar(papel: string) {
        return papel === 'responsavel_principal' ? '#FCEEE9' : '#F3EAF8'
    }

    function getIniciais(nome: string) {
        const partes = nome.trim().split(' ')
        if (partes.length >= 2) return partes[0][0].toUpperCase() + partes[1][0].toUpperCase()
        return partes[0].slice(0, 2).toUpperCase()
    }

    if (carregandoInicial) {
        return <DiarioSkeleton />
    }

    return (
        <div className="h-screen overflow-hidden bg-[#FFF8F2] flex flex-col max-w-md mx-auto">

            {/* Header */}
            <div className="px-6 pt-12 pb-5 shrink-0" style={{ background: 'linear-gradient(135deg, #2A1F3D 0%, #9B7FD4 100%)' }}>
                <h1 className="text-white text-2xl font-bold">
                    Diário {criancaNome ? `de ${criancaNome}` : ''}
                </h1>
                <p className="text-white/60 text-xs mt-1">Memórias compartilhadas pela família</p>
            </div>

            {/* Compose */}
            <div className="mx-5 mt-4 bg-white rounded-2xl p-4 border border-[#E8D5F0] shrink-0">
                <textarea
                    value={texto}
                    onChange={e => setTexto(e.target.value)}
                    placeholder={`O que aconteceu hoje${criancaNome ? ` com ${criancaNome}` : ''}? ✨`}
                    className="w-full text-sm text-[#2A1F3D] placeholder-[#C5B8D8] outline-none resize-none h-16 bg-transparent"
                />

                {/* Tags */}
                <div className="flex gap-2 flex-wrap mt-2 pt-2 border-t border-[#E8D5F0]">
                    {TAGS.map(t => {
                        const active = tag === t.key
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTag(active ? '' : t.key)}
                                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all"
                                style={active
                                    ? { backgroundColor: t.bg, color: t.color, borderColor: 'transparent' }
                                    : { backgroundColor: 'white', color: '#8A7A9B', borderColor: '#E8D5F0' }
                                }
                            >
                                <t.icon size={11} strokeWidth={2} />
                                {t.label}
                            </button>
                        )
                    })}
                </div>

                <div className="flex justify-between items-center mt-3">
                    <button
                        disabled
                        title="Em breve"
                        className="flex items-center gap-1 text-xs font-semibold text-[#C5B8D8] px-3 py-2 rounded-full border border-[#E8D5F0] cursor-not-allowed"
                    >
                        <IconCamera size={14} strokeWidth={2} />
                        Em breve
                    </button>
                    <button
                        onClick={publicarPost}
                        disabled={!texto.trim() || loading}
                        className="bg-[#9B7FD4] text-white text-xs font-semibold px-4 py-2 rounded-full disabled:opacity-40"
                    >
                        {loading ? 'Publicando...' : 'Publicar'}
                    </button>
                </div>
                {erroPost && <p className="text-xs text-[#E07A5F] mt-2 font-medium">{erroPost}</p>}
            </div>

            {/* Feed */}
            <div className="flex-1 min-h-0 px-5 pt-4 pb-4 overflow-y-auto">
                {posts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <IconNotebook size={48} color="#C5B8D8" strokeWidth={1} className="mb-3" />
                        <p className="text-sm text-[#8A7A9B]">Nenhum registro ainda</p>
                        <p className="text-xs text-[#8A7A9B] mt-1">Seja o primeiro a registrar um momento!</p>
                    </div>
                )}
                <div className="flex flex-col gap-4">
                    {posts.map(post => {
                        const tagCfg = post.tag ? TAGS.find(t => t.key === post.tag) : null
                        return (
                            <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm relative">
                                {post.autor_id === userId && (
                                    <button
                                        onClick={() => excluirPost(post.id)}
                                        title="Excluir post"
                                        className="absolute top-3 right-3 p-1.5 rounded-full bg-[#EDE5F8] text-[#7B5BB4] hover:bg-[#FF7B54] hover:text-white transition-colors"
                                    >
                                        <IconTrash size={16} strokeWidth={2} />
                                    </button>
                                )}
                                <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                        style={{
                                            background: getCorAvatar(post.autor_papel),
                                            color: post.autor_papel === 'responsavel_principal' ? '#B85C38' : '#7B5B9E',
                                        }}
                                    >
                                        {getIniciais(post.autor_nome)}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-8">
                                        <p className="text-sm font-semibold text-[#2A1F3D]">
                                            {post.autor_nome} · {labelVinculo(post.autor_vinculo)}
                                        </p>
                                        <p className="text-[10px] text-[#8A7A9B]">
                                            {formatarTempo(post.created_at)} · {post.autor_papel === 'responsavel_principal' ? 'Responsável Principal' : 'Participante Familiar'}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-4 pb-3">
                                    {tagCfg && (
                                        <span
                                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
                                            style={{ backgroundColor: tagCfg.bg, color: tagCfg.color }}
                                        >
                                            <tagCfg.icon size={10} strokeWidth={2} />
                                            {tagCfg.label}
                                        </span>
                                    )}
                                    <p className="text-sm text-[#4A3A6E] leading-relaxed">{post.texto}</p>
                                </div>

                                <div className="flex gap-4 px-4 py-3 border-t border-[#E8D5F0]">
                                    <button
                                        onClick={() => toggleCurtida(post)}
                                        className={`flex items-center gap-1 text-xs transition-colors ${curtidos.has(post.id) ? 'text-[#9B7FD4]' : 'text-[#8A7A9B]'}`}
                                    >
                                        <IconHeart
                                            size={14}
                                            strokeWidth={1.5}
                                            fill={curtidos.has(post.id) ? '#9B7FD4' : 'none'}
                                        />
                                        {post.reacoes > 0 ? post.reacoes : ''}
                                    </button>
                                    <button
                                        onClick={() => setRespondendo(respondendo === post.id ? null : post.id)}
                                        className={`flex items-center gap-1 text-xs transition-colors ${respondendo === post.id ? 'text-[#9B7FD4]' : 'text-[#8A7A9B]'}`}
                                    >
                                        <IconMessageCircle size={14} strokeWidth={1.5} /> Responder
                                    </button>
                                </div>

                                {/* ── NOVO ── respostas aninhadas, recuadas abaixo do post original (estilo comentários do Instagram) */}
                                {(respostas[post.id] || []).length > 0 && (
                                    <div className="flex flex-col gap-3 px-4 pb-3 pt-1 border-t border-[#E8D5F0]">
                                        {respostas[post.id].map(resposta => (
                                            <div key={resposta.id} className="flex items-start gap-2 pl-4 border-l-2 border-[#E8D5F0]">
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                                                    style={{
                                                        background: getCorAvatar(resposta.autor_papel),
                                                        color: resposta.autor_papel === 'responsavel_principal' ? '#B85C38' : '#7B5B9E',
                                                    }}
                                                >
                                                    {getIniciais(resposta.autor_nome)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs leading-snug">
                                                        <span className="font-semibold text-[#2A1F3D]">{resposta.autor_nome}</span>
                                                        {' '}
                                                        <span className="text-[#4A3A6E]">{resposta.texto}</span>
                                                    </p>
                                                    <p className="text-[10px] text-[#8A7A9B] mt-0.5">{formatarTempo(resposta.created_at)}</p>
                                                </div>
                                                {resposta.autor_id === userId && (
                                                    <button
                                                        onClick={() => excluirPost(resposta.id)}
                                                        title="Excluir resposta"
                                                        className="p-1 rounded-full text-[#8A7A9B] hover:text-[#FF7B54] transition-colors flex-shrink-0"
                                                    >
                                                        <IconTrash size={12} strokeWidth={2} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {respondendo === post.id && (
                                    <div className="px-4 pb-4 pt-1">
                                        <textarea
                                            value={textoResposta[post.id] || ''}
                                            onChange={e => setTextoResposta(prev => ({ ...prev, [post.id]: e.target.value }))}
                                            placeholder={`Responder para ${post.autor_nome.split(' ')[0]}...`}
                                            className="w-full text-sm text-[#2A1F3D] placeholder-[#C5B8D8] outline-none resize-none h-14 bg-[#FAF6FF] rounded-xl px-3 py-2 border border-[#E8D5F0]"
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button
                                                onClick={() => setRespondendo(null)}
                                                className="text-xs text-[#8A7A9B] px-3 py-1.5"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => publicarResposta(post)}
                                                disabled={!textoResposta[post.id]?.trim()}
                                                className="bg-[#9B7FD4] text-white text-xs font-semibold px-4 py-1.5 rounded-full disabled:opacity-40"
                                            >
                                                Publicar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
                {temMaisPosts && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={carregarMaisPosts}
                            disabled={carregandoMais}
                            className="text-xs font-semibold text-[#9B7FD4] bg-white border border-[#E8D5F0] px-4 py-2 rounded-full disabled:opacity-50"
                        >
                            {carregandoMais ? 'Carregando...' : 'Carregar mais'}
                        </button>
                    </div>
                )}
            </div>

            {/* Modal de confirmação de exclusão de post */}
            {modalExcluirPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 px-5">
                    <div className="bg-[#FFF8F2] rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <div className="flex flex-col items-center text-center gap-3">
                            <IconTrash size={40} color="#9B7FD4" strokeWidth={1.5} />
                            <h2 className="text-lg font-bold text-[#2A1F3D]">Excluir post?</h2>
                            <p className="text-sm text-[#8A7A9B] leading-relaxed">
                                Esta ação não pode ser desfeita. O registro será removido do diário para todos os membros da família.
                            </p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setModalExcluirPost(null)}
                                className="flex-1 border-2 border-[#E8D5F0] text-[#8A7A9B] font-semibold py-4 rounded-full text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarExclusaoPost}
                                className="flex-1 bg-[#9B7FD4] hover:bg-[#7B5BB4] text-white font-semibold py-4 rounded-full text-sm transition-colors"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />

        </div>
    )
}
