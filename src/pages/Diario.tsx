import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Post {
    id: string
    autor_nome: string
    autor_vinculo: string
    autor_papel: string
    texto: string
    tag: string
    tem_foto: boolean
    reacoes: number
    created_at: string
}

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

    const tags = ['☀️ Manhã', '🌙 Noite', '🏠 Tarde', '🚲 Conquista', '🏥 Saúde', '🌟 Especial']

    useEffect(() => {
        async function carregarDados() {
            const { data: userData } = await supabase.auth.getUser()
            if (!userData.user) { navigate('/login'); return }

            const user = userData.user
            const nome = user.user_metadata?.nome_completo || 'Responsável'
            setAutorNome(nome)

            const { data: membroData } = await supabase
                .from('membros_familia')
                .select('crianca_id, vinculo, papel')
                .eq('user_id', user.id)
                .eq('ativo', true)
                .limit(1)
                .single()

            if (!membroData) { navigate('/cadastro-crianca'); return }

            setAutorVinculo(membroData.vinculo)
            setAutorPapel(membroData.papel)
            setCriancaId(membroData.crianca_id)

            const { data: criancaData } = await supabase
                .from('criancas')
                .select('nome')
                .eq('id', membroData.crianca_id)
                .single()

            if (criancaData) setCriancaNome(criancaData.nome)

            await carregarPosts(membroData.crianca_id)
        }
        carregarDados()
    }, [navigate])

    async function carregarPosts(cid: string) {
        const { data } = await supabase
            .from('posts_diario')
            .select('*')
            .eq('crianca_id', cid)
            .order('created_at', { ascending: false })
        if (data) setPosts(data)
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

    return (
        <div className="h-screen overflow-hidden bg-[#FFF7EC] flex flex-col max-w-md mx-auto">

            {/* Header */}
            <div className="px-6 pt-12 pb-5 shrink-0" style={{ background: 'linear-gradient(135deg, #3D3560 0%, #A391E6 100%)' }}>
                <h1 className="text-white text-2xl font-bold">
                    Diário {criancaNome ? `de ${criancaNome}` : ''}
                </h1>
                <p className="text-white/60 text-xs mt-1">Memórias compartilhadas pela família</p>
            </div>

            {/* Compose */}
            <div className="mx-5 mt-4 bg-white rounded-2xl p-4 border border-[#E8E4F4] shrink-0">
                <textarea
                    value={texto}
                    onChange={e => setTexto(e.target.value)}
                    placeholder={`O que aconteceu hoje${criancaNome ? ` com ${criancaNome}` : ''}? 🌟`}
                    className="w-full text-sm text-[#3D3560] placeholder-[#C9C0D8] outline-none resize-none h-16 bg-transparent"
                />

                {/* Tags */}
                <div className="flex gap-2 flex-wrap mt-2 pt-2 border-t border-[#E8E4F4]">
                    {tags.map(t => (
                        <button
                            key={t}
                            onClick={() => setTag(tag === t ? '' : t)}
                            className={`text-xs px-2 py-1 rounded-full border transition-all ${tag === t
                                    ? 'bg-[#A391E6] text-white border-[#A391E6]'
                                    : 'bg-white text-[#9B8FA8] border-[#E8E4F4]'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex justify-end mt-3">
                    <button
                        onClick={publicarPost}
                        disabled={!texto.trim() || loading}
                        className="bg-[#A391E6] text-white text-xs font-semibold px-4 py-2 rounded-full disabled:opacity-40"
                    >
                        {loading ? 'Publicando...' : 'Publicar'}
                    </button>
                </div>
                {erroPost && <p className="text-xs text-[#E07A5F] mt-2 font-medium">{erroPost}</p>}
            </div>

            {/* Feed */}
            <div className="flex-1 min-h-0 px-5 pt-4 pb-4 flex flex-col gap-4 overflow-y-auto">
                {posts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="text-4xl mb-3">📖</span>
                        <p className="text-sm text-[#9B8FA8]">Nenhum registro ainda</p>
                        <p className="text-xs text-[#9B8FA8] mt-1">Seja o primeiro a registrar um momento!</p>
                    </div>
                )}

                {posts.map(post => (
                    <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                                style={{ background: getCorAvatar(post.autor_papel) }}
                            >
                                👤
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#3D3560]">
                                    {post.autor_nome} · {post.autor_vinculo}
                                </p>
                                <p className="text-[10px] text-[#9B8FA8]">
                                    {formatarTempo(post.created_at)} · {post.autor_papel === 'responsavel_principal' ? 'Responsável Principal' : 'Participante Familiar'}
                                </p>
                            </div>
                        </div>

                        <div className="px-4 pb-3">
                            {post.tag && (
                                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 bg-[#EDEAF8] text-[#A391E6]">
                                    {post.tag}
                                </span>
                            )}
                            <p className="text-sm text-[#4A3A6E] leading-relaxed">{post.texto}</p>
                        </div>

                        <div className="flex gap-4 px-4 py-3 border-t border-[#E8E4F4]">
                            <button className="flex items-center gap-1 text-xs text-[#9B8FA8]">
                                <span>❤️</span> {post.reacoes}
                            </button>
                            <button className="flex items-center gap-1 text-xs text-[#9B8FA8]">
                                <span>💬</span> Responder
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom nav */}
            <div className="w-full border-t border-[#E8E4F4] bg-white px-4 py-3 flex justify-around items-center shrink-0">
                <button onClick={() => navigate('/home')} className="flex flex-col items-center gap-1 px-3 py-2">
                    <span className="text-xl">🏠</span>
                    <span className="text-[10px] text-[#9B8FA8]">Home</span>
                </button>
                <button onClick={() => navigate('/calendario')} className="flex flex-col items-center gap-1 px-3 py-2">
                    <span className="text-xl">📅</span>
                    <span className="text-[10px] text-[#9B8FA8]">Calendário</span>
                </button>
                <button onClick={() => navigate('/perfil')} className="flex flex-col items-center gap-1 px-3 py-2">
                    <span className="text-xl">👤</span>
                    <span className="text-[10px] text-[#9B8FA8]">Perfil</span>
                </button>
                <button className="flex flex-col items-center gap-1 bg-[#EDEAF8] px-3 py-2 rounded-xl">
                    <span className="text-xl">📖</span>
                    <span className="text-[10px] font-semibold text-[#A391E6]">Diário</span>
                </button>
                <button onClick={() => navigate('/familia')} className="flex flex-col items-center gap-1 px-3 py-2">
                    <span className="text-xl">👨‍👩‍👧</span>
                    <span className="text-[10px] text-[#9B8FA8]">Família</span>
                </button>
            </div>

        </div>
    )
}