import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const posts = [
    {
    id: 1,
    autor: 'Carlos',
    vinculo: 'Pai',
    emoji: '👨',
    cor: '#FCEEE9',
    hora: 'Hoje · 08h14',
    papel: 'Responsável Principal',
    tag: '☀️ Manhã',
    tagBg: '#EAF4F4',
    tagColor: '#3D8C8C',
    texto: 'Sofia acordou animadíssima hoje! Falou que vai apresentar o trabalho de ciências na mostra cultural. Tomou café com banana e foi pra escola cantarolando 🎵',
    reacoes: 2,
    temFoto: false,
    },
    {
    id: 2,
    autor: 'Rosa',
    vinculo: 'Avó',
    emoji: '👵',
    cor: '#F3EAF8',
    hora: 'Hoje · 15h30',
    papel: 'Participante Familiar',
    tag: '🏠 Tarde',
    tagBg: '#F3EAF8',
    tagColor: '#8B5CF6',
    texto: 'Busquei a Sofia na escola hoje. Ela me contou tudo sobre o trabalho de ciências! Fizemos lanche aqui em casa e ela ficou desenhando 🎨',
    reacoes: 3,
    temFoto: false,
    },
    {
    id: 3,
    autor: 'Ana',
    vinculo: 'Mãe',
    emoji: '👩',
    cor: '#EAF4F4',
    hora: 'Ontem · 19h30',
    papel: 'Responsável Principal',
    tag: '🚲 Conquista',
    tagBg: '#EAF4F4',
    tagColor: '#3D8C8C',
    texto: 'Ela pedalou sozinha pela primeira vez sem as rodinhas! Levou uns 20 minutos mas conseguiu. Ficou tão orgulhosa 🥹',
    reacoes: 4,
    temFoto: true,
    },
    {
    id: 4,
    autor: 'Carlos',
    vinculo: 'Pai',
    emoji: '👨',
    cor: '#FCEEE9',
    hora: '2 dias atrás · 21h00',
    papel: 'Responsável Principal',
    tag: '🌙 Noite',
    tagBg: '#EAF4F4',
    tagColor: '#3D8C8C',
    texto: 'Teve um pesadelo de madrugada, ficou com medo. Dormiu no meu quarto. Deixando registrado caso aconteça na casa da Ana ou da Vó Rosa também.',
    reacoes: 1,
    temFoto: false,
    },
]

export default function Diario() {
    const navigate = useNavigate()
    const [texto, setTexto] = useState('')

    return (
    <div className="min-h-screen bg-[#FFFCF8] flex flex-col max-w-md mx-auto">

      {/* Header */}
        <div className="bg-[#F5EDE3] border-b border-[#EDE3D8] px-6 pt-12 pb-5">
        <h1 className="text-[#1C2B2B] text-2xl font-bold">Diário da Sofia</h1>
        <p className="text-[#8FA3A3] text-xs mt-1">Memórias compartilhadas pela família</p>
        </div>

      {/* Compose */}
        <div className="mx-5 mt-4 bg-white rounded-2xl p-4 border border-[#E2EEEE]">
        <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="O que aconteceu hoje com a Sofia? 🌟"
            className="w-full text-sm text-[#1C2B2B] placeholder-[#C5D0D0] outline-none resize-none h-16 bg-transparent"
        />
        <div className="flex justify-between items-center pt-3 border-t border-[#E2EEEE]">
            <div className="flex gap-3">
            <span className="text-lg cursor-pointer">📷</span>
            <span className="text-lg cursor-pointer">😊</span>
            <span className="text-lg cursor-pointer">📍</span>
            </div>
            <button
            className="bg-[#3D8C8C] text-white text-xs font-semibold px-4 py-2 rounded-full disabled:opacity-40"
            disabled={!texto.trim()}
            >
            Publicar
            </button>
        </div>
        </div>

      {/* Feed */}
        <div className="flex-1 px-5 pt-4 pb-24 flex flex-col gap-4 overflow-y-auto">
        {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">

            {/* Header do post */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: post.cor }}
                >
                {post.emoji}
                </div>
                <div>
                <p className="text-sm font-semibold text-[#1C2B2B]">
                    {post.autor} · {post.vinculo}
                </p>
                <p className="text-[10px] text-[#8FA3A3]">{post.hora} · {post.papel}</p>
                </div>
            </div>

            {/* Foto placeholder */}
            {post.temFoto && (
                <div className="w-full h-36 bg-[#F5EDE3] flex items-center justify-center text-4xl">
                📸
                </div>
            )}

            {/* Corpo */}
            <div className="px-4 pb-3">
                <span
                className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
                style={{ background: post.tagBg, color: post.tagColor }}
                >
                {post.tag}
                </span>
                <p className="text-sm text-[#4A5E5E] leading-relaxed">{post.texto}</p>
            </div>

            {/* Footer */}
            <div className="flex gap-4 px-4 py-3 border-t border-[#E2EEEE]">
                <button className="flex items-center gap-1 text-xs text-[#8FA3A3]">
                <span>❤️</span> {post.reacoes}
                </button>
                <button className="flex items-center gap-1 text-xs text-[#8FA3A3]">
                <span>💬</span> Responder
                </button>
            </div>

            </div>
        ))}
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
        <button className="flex flex-col items-center gap-1 bg-[#EAF4F4] px-3 py-2 rounded-xl">
            <span className="text-xl">📖</span>
            <span className="text-[10px] font-semibold text-[#3D8C8C]">Diário</span>
        </button>
        <button onClick={() => navigate('/familia')} className="flex flex-col items-center gap-1 px-3 py-2">
            <span className="text-xl">👨‍👩‍👧</span>
            <span className="text-[10px] text-[#8FA3A3]">Família</span>
        </button>
        </div>

    </div>
    )
}