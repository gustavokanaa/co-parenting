import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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

    useEffect(() => {
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

            const { data: criancaData } = await supabase
                .from('criancas')
                .select('*')
                .eq('id', membroData.crianca_id)
                .single()

            if (criancaData) setCrianca(criancaData)

            const { data: membrosData } = await supabase
                .from('membros_familia')
                .select('nome, vinculo')
                .eq('crianca_id', membroData.crianca_id)
                .eq('ativo', true)

            if (membrosData) setMembros(membrosData)
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
            <div className="bg-gradient-to-br from-[#1C2B2B] to-[#3D8C8C] px-6 pt-12 pb-8 flex flex-col items-center">
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
                            {m.nome.split(' ')[0]} · {m.vinculo}
                        </span>
                    ))}
                </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 px-5 pt-5 pb-24 flex flex-col gap-4 overflow-y-auto">

                {/* Saúde */}
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
                    {!crianca?.tipo_sanguineo && !crianca?.alergias && !crianca?.medicamentos && (
                        <div className="px-4 py-4 text-xs text-[#8FA3A3] text-center">Nenhuma informação cadastrada</div>
                    )}
                </div>

                {/* Escola */}
                {(crianca?.escola || crianca?.serie) && (
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
                    </div>
                )}

                {/* Documentos */}
                <div className="flex justify-between items-center mt-2">
                    <h2 className="text-sm font-bold text-[#1C2B2B]">Documentos</h2>
                    <span className="text-xs font-semibold text-[#3D8C8C]">+ Adicionar</span>
                </div>
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                    <p className="text-3xl mb-2">📁</p>
                    <p className="text-sm text-[#8FA3A3]">Em breve</p>
                    <p className="text-xs text-[#8FA3A3] mt-1">Upload de documentos será habilitado</p>
                </div>

            </div>

            {/* Bottom nav */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-[#E2EEEE] bg-white px-4 py-3 flex justify-around items-center">
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