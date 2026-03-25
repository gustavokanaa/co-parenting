import { useNavigate } from 'react-router-dom'

const documentos = [
    { nome: 'Certidão de Nascimento', emoji: '📋', data: 'Jan 2026' },
    { nome: 'Carteira de Vacinas', emoji: '💉', data: 'Fev 2026' },
    { nome: 'RG', emoji: '🆔', data: 'Jan 2026' },
]

export default function Perfil() {
    const navigate = useNavigate()

    return (
    <div className="min-h-screen bg-[#FFFCF8] flex flex-col max-w-md mx-auto">

      {/* Header */}
        <div className="bg-gradient-to-br from-[#1C2B2B] to-[#3D8C8C] px-6 pt-12 pb-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl border-2 border-white/30 mb-3">
            🧒
        </div>
        <h1 className="text-white text-2xl font-bold">Sofia Silva</h1>
        <p className="text-white/60 text-sm mt-1">8 anos · Nascida em 22/03/2018</p>
        <div className="flex gap-2 mt-3 flex-wrap justify-center">
            <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-full">👩 Ana · Mãe</span>
            <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-full">👨 Carlos · Pai</span>
            <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-full">👵 Rosa · Avó</span>
        </div>
        </div>

      {/* Conteúdo */}
        <div className="flex-1 px-5 pt-5 pb-24 flex flex-col gap-4 overflow-y-auto">

        {/* Saúde */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#EAF4F4] px-4 py-3 flex items-center gap-2">
            <span className="text-base">🏥</span>
            <span className="text-xs font-bold text-[#3D8C8C] uppercase tracking-wide">Saúde</span>
            </div>
            {[
            { label: 'Tipo sanguíneo', valor: 'A+' },
            { label: 'Alergias', valor: '⚠️ Amendoim · Dipirona', destaque: true },
            { label: 'Medicamento atual', valor: 'Zyrtec · 5ml/noite' },
            { label: 'Pediatra', valor: 'Dr. Mendes · (11) 99999-9999' },
            ].map((item, i) => (
            <div key={i} className="px-4 py-3 flex justify-between items-center border-b border-[#E2EEEE] last:border-0">
                <span className="text-xs text-[#8FA3A3]">{item.label}</span>
                <span className={`text-xs font-semibold ${item.destaque ? 'text-[#E07A5F] bg-[#FCEEE9] px-2 py-0.5 rounded-full' : 'text-[#1C2B2B]'}`}>
                {item.valor}
                </span>
            </div>
            ))}
        </div>

        {/* Escola */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#EAF4F4] px-4 py-3 flex items-center gap-2">
            <span className="text-base">🏫</span>
            <span className="text-xs font-bold text-[#3D8C8C] uppercase tracking-wide">Escola</span>
            </div>
            {[
            { label: 'Escola', valor: 'EM João de Barro' },
            { label: 'Série', valor: '2º ano · Período tarde' },
            { label: 'Professora', valor: 'Profa. Márcia' },
            ].map((item, i) => (
            <div key={i} className="px-4 py-3 flex justify-between items-center border-b border-[#E2EEEE] last:border-0">
                <span className="text-xs text-[#8FA3A3]">{item.label}</span>
                <span className="text-xs font-semibold text-[#1C2B2B]">{item.valor}</span>
            </div>
            ))}
        </div>

        {/* Documentos */}
        <div className="flex justify-between items-center mt-2">
            <h2 className="text-sm font-bold text-[#1C2B2B]">Documentos</h2>
            <span className="text-xs font-semibold text-[#3D8C8C]">+ Adicionar</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
            {documentos.map((doc, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex flex-col items-center shadow-sm cursor-pointer">
                <span className="text-3xl mb-2">{doc.emoji}</span>
                <p className="text-xs font-semibold text-[#1C2B2B] text-center">{doc.nome}</p>
                <p className="text-[10px] text-[#8FA3A3] mt-1">{doc.data}</p>
            </div>
            ))}
            <div className="bg-transparent border-2 border-dashed border-[#E2EEEE] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer">
            <span className="text-2xl text-[#8FA3A3]">+</span>
            <p className="text-xs text-[#8FA3A3] mt-1">Novo doc</p>
            </div>
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