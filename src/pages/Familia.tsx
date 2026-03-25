import { useNavigate } from 'react-router-dom'

const responsaveis = [
    {
    nome: 'Ana Silva',
    vinculo: 'Mãe',
    papel: 'Responsável Principal',
    emoji: '👩',
    cor: '#EAF4F4',
    desde: 'Desde Jan 2026',
    voce: true,
    },
    {
    nome: 'Carlos Souza',
    vinculo: 'Pai',
    papel: 'Responsável Principal',
    emoji: '👨',
    cor: '#FCEEE9',
    desde: 'Desde Jan 2026 · Ativo há 2h',
    voce: false,
    },
]

const participantes = [
    {
    nome: 'Rosa Souza',
    vinculo: 'Avó',
    papel: 'Participante Familiar',
    emoji: '👵',
    cor: '#F3EAF8',
    desde: 'Convidada por Carlos · Ativa há 1d',
    },
    {
    nome: 'Pedro Silva',
    vinculo: 'Tio',
    papel: 'Participante Familiar',
    emoji: '👨‍👧',
    cor: '#E8F4EC',
    desde: 'Convidado por Ana · Ativo há 3d',
    },
]

const pendentes = [
    {
    email: 'maria.tia@email.com',
    vinculo: 'Tia',
    papel: 'Participante Familiar',
    desde: 'Convite enviado há 2 dias',
    },
]

const permissoes = [
    { acao: 'Ver calendário', principal: true, familiar: true },
    { acao: 'Criar eventos', principal: true, familiar: false },
    { acao: 'Ver diário', principal: true, familiar: true },
    { acao: 'Postar no diário', principal: true, familiar: true },
    { acao: 'Editar perfil da criança', principal: true, familiar: false },
    { acao: 'Ver documentos', principal: true, familiar: false },
    { acao: 'Convidar membros', principal: true, familiar: false },
]

export default function Familia() {
    const navigate = useNavigate()

    return (
    <div className="min-h-screen bg-[#FFFCF8] flex flex-col max-w-md mx-auto">

      {/* Header */}
        <div className="bg-gradient-to-br from-[#1C2B2B] to-[#2A4E4E] px-6 pt-12 pb-6">
        <h1 className="text-white text-2xl font-bold">Família da Sofia</h1>
        <p className="text-white/50 text-xs mt-1">Gerencie quem acompanha a vida dela</p>
        </div>

        <div className="flex-1 px-5 pt-5 pb-32 flex flex-col gap-5 overflow-y-auto">

        {/* Aviso de papéis */}
        <div className="bg-[#EAF4F4] rounded-xl px-4 py-3">
            <p className="text-xs text-[#3D8C8C] leading-relaxed">
            <span className="font-bold">Responsável Principal</span> — controle total (máx. 2).{' '}
            <span className="font-bold">Participante Familiar</span> — visualiza e posta no diário.
            </p>
        </div>

        {/* Responsáveis Principais */}
        <div>
            <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-[#1C2B2B]">Responsáveis Principais</h2>
            <span className="bg-[#EAF4F4] text-[#3D8C8C] text-xs font-bold px-2 py-0.5 rounded-full">2 / 2</span>
            </div>
            <div className="flex flex-col gap-3">
            {responsaveis.map((m, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border-l-4 border-[#3D8C8C]">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ background: m.cor }}>
                    {m.emoji}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#1C2B2B]">{m.nome}</p>
                    {m.voce && (
                        <span className="bg-[#3D8C8C] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">você</span>
                    )}
                    </div>
                    <p className="text-xs text-[#3D8C8C] font-medium">{m.vinculo} · {m.papel}</p>
                    <p className="text-[10px] text-[#8FA3A3] mt-0.5">{m.desde}</p>
                </div>
                <button className="w-8 h-8 rounded-lg bg-[#EAF4F4] flex items-center justify-center text-sm flex-shrink-0">
                    ✏️
                </button>
                </div>
            ))}
            </div>
        </div>

        {/* Participantes Familiares */}
        <div>
            <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-[#1C2B2B]">Participantes Familiares</h2>
            <span className="bg-[#F5EDE3] text-[#8B6A3E] text-xs font-bold px-2 py-0.5 rounded-full">2 membros</span>
            </div>
            <div className="flex flex-col gap-3">
            {participantes.map((m, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border-l-4 border-[#E2EEEE]">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ background: m.cor }}>
                    {m.emoji}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1C2B2B]">{m.nome}</p>
                    <p className="text-xs text-[#3D8C8C] font-medium">{m.vinculo} · {m.papel}</p>
                    <p className="text-[10px] text-[#8FA3A3] mt-0.5">{m.desde}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button className="w-8 h-8 rounded-lg bg-[#EAF4F4] flex items-center justify-center text-sm">✏️</button>
                    <button className="w-8 h-8 rounded-lg bg-[#FDECEA] flex items-center justify-center text-sm">✕</button>
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* Convites Pendentes */}
        <div>
            <h2 className="text-sm font-bold text-[#1C2B2B] mb-3">Convites pendentes</h2>
            {pendentes.map((p, i) => (
            <div key={i} className="bg-[#FFFDF0] border border-[#F0C040] rounded-2xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#FFF8E1] flex items-center justify-center text-xl flex-shrink-0">
                ⏳
                </div>
                <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1C2B2B]">{p.email}</p>
                <p className="text-xs text-[#3D8C8C] font-medium">{p.vinculo} · {p.papel}</p>
                <p className="text-[10px] text-[#8FA3A3] mt-0.5">{p.desde}</p>
                </div>
                <button className="w-8 h-8 rounded-lg bg-[#FDECEA] flex items-center justify-center text-sm flex-shrink-0">✕</button>
            </div>
            ))}
        </div>

        {/* Tabela de permissões */}
        <div>
            <h2 className="text-sm font-bold text-[#1C2B2B] mb-3">Tabela de permissões</h2>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 bg-[#1C2B2B] px-4 py-2">
                <span className="text-[10px] font-bold text-white/60 uppercase">Ação</span>
                <span className="text-[10px] font-bold text-white text-center uppercase">Principal</span>
                <span className="text-[10px] font-bold text-white text-center uppercase">Familiar</span>
            </div>
            {permissoes.map((p, i) => (
                <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-[#E2EEEE] last:border-0 items-center">
                <span className="text-xs text-[#4A5E5E]">{p.acao}</span>
                <span className="text-center text-sm font-bold" style={{ color: '#3D8C8C' }}>
                    {p.principal ? '✓' : ''}
                </span>
                <span className="text-center text-sm font-bold" style={{ color: p.familiar ? '#3D8C8C' : '#E0A0A0' }}>
                    {p.familiar ? '✓' : '✕'}
                </span>
                </div>
            ))}
            </div>
        </div>

        </div>

      {/* Botão convidar */}
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-2 bg-[#FFFCF8]">
        <button className="w-full bg-[#3D8C8C] text-white font-semibold py-4 rounded-full text-sm flex items-center justify-center gap-2">
            👋 Convidar novo membro
        </button>
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
    )
}