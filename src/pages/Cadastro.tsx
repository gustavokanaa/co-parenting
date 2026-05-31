import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

const vinculos = [
    { id: 'mae', label: 'Mãe', emoji: '👩' },
    { id: 'pai', label: 'Pai', emoji: '👨' },
    { id: 'avo', label: 'Avó', emoji: '👵' },
    { id: 'avop', label: 'Avô', emoji: '👴' },
    { id: 'tia', label: 'Tia', emoji: '👩‍👧' },
    { id: 'tio', label: 'Tio', emoji: '👨‍👧' },
    { id: 'responsavel', label: 'Responsável Legal', emoji: '🧑‍⚖️' },
]

export default function Cadastro() {
    const navigate = useNavigate()
    const [vinculo, setVinculo] = useState('')
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [erro, setErro] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleCadastro() {
    if (!vinculo) return setErro('Selecione seu vínculo com a criança.')
    if (!nome.trim()) return setErro('Informe seu nome completo.')
    if (nome.trim().length < 3) return setErro('O nome deve ter pelo menos 3 caracteres.')
    if (!email.trim()) return setErro('Informe seu e-mail.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErro('Informe um e-mail válido.')
    if (senha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres.')
    if (senha.length > 50) return setErro('A senha deve ter no máximo 50 caracteres.')

    setErro('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
        data: { nome_completo: nome, vinculo },
        },
    })

    setLoading(false)

    if (error) {
        setErro(error.message)
    } else {
        navigate('/login?cadastro=ok')
    }
    }

    return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background: 'linear-gradient(165deg, #2A1F3D 0%, #4A2E6A 40%, #9B7FD4 100%)' }}>

      {/* Hero */}
        <div className="flex flex-col items-center pt-16 pb-10 px-6">
        <h1 className="text-4xl font-bold tracking-tight">
          <span style={{ color: '#9B7FD4' }}>P</span><span style={{ color: '#FF7B54' }}>a</span><span style={{ color: '#5CC8B0' }}>r</span><span style={{ color: '#FFB830' }}>e</span><span style={{ color: '#FF9BB5' }}>n</span><span style={{ color: '#9B7FD4' }}>t</span><span style={{ color: '#FF7B54' }}>a</span>
        </h1>
        <p className="text-white/70 text-sm mt-1">Cuidar juntos, mesmo em casas diferentes.</p>
        <div className="mt-6 w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl">
            🤝    
        </div>
        </div>

      {/* Card */}
        <div className="flex-1 bg-[#FFF8F2] rounded-t-3xl px-6 pt-8 pb-10">

        {/* Vínculo */}
        <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-3">
            Qual é o seu vínculo com a criança?
        </p>
        <div className="grid grid-cols-3 gap-2 mb-2">
            {vinculos.slice(0, 6).map(v => (
            <button
                key={v.id}
                onClick={() => setVinculo(v.id)}
                className={`rounded-xl py-3 flex flex-col items-center border-2 transition-all ${
                vinculo === v.id
                    ? 'border-[#9B7FD4] bg-[#EDE5F8]'
                    : 'border-[#E8D5F0] bg-white'
                }`}
            >
                <span className="text-2xl">{v.emoji}</span>
                <span className="text-xs font-semibold text-[#2A1F3D] mt-1">{v.label}</span>
            </button>
            ))}
        </div>
        <button
            onClick={() => setVinculo('responsavel')}
            className={`w-full rounded-xl py-3 px-4 flex items-center gap-3 border-2 transition-all mb-6 ${
            vinculo === 'responsavel'
                ? 'border-[#9B7FD4] bg-[#EDE5F8]'
                : 'border-[#E8D5F0] bg-white'
            }`}
        >
            <span className="text-2xl">🧑‍⚖️</span>
            <div className="text-left">
            <div className="text-sm font-semibold text-[#2A1F3D]">Responsável Legal / Tutor</div>
            <div className="text-xs text-[#8A7A9B]">Guarda judicial ou tutela</div>
            </div>
        </button>

        {/* Campos */}
        <div className="flex flex-col gap-4">
            <div>
            <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-1">
                Nome completo
            </p>
            <input
                type="text"
                placeholder=""
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full border-2 border-[#E8D5F0] rounded-xl px-4 py-3 text-sm text-[#2A1F3D] outline-none focus:border-[#9B7FD4] bg-white"
            />
            </div>
            <div>
            <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-1">
                E-mail
            </p>
            <input
                type="email"
                placeholder=""
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-[#E8D5F0] rounded-xl px-4 py-3 text-sm text-[#2A1F3D] outline-none focus:border-[#9B7FD4] bg-white"
            />
            </div>
            <div>
            <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-1">
                Senha
            </p>
            <input
                type="password"
                placeholder=""
                value={senha}
                onChange={e => setSenha(e.target.value)}
                className="w-full border-2 border-[#E8D5F0] rounded-xl px-4 py-3 text-sm text-[#2A1F3D] outline-none focus:border-[#9B7FD4] bg-white"
            />
            </div>
        </div>

        {/* Erro */}
        {erro && (
            <p className="text-sm text-[#FF7B54] mt-3 font-medium">{erro}</p>
        )}

        {/* Botão */}
        <button
            onClick={handleCadastro}
            disabled={loading}
            className="w-full mt-6 bg-[#9B7FD4] text-white font-semibold py-4 rounded-full text-sm disabled:opacity-60"
        >
            {loading ? 'Criando conta...' : 'Criar minha conta →'}
        </button>

        {/* Login */}
        <div className="mt-4 text-center">
            <span className="text-sm text-[#8A7A9B]">Já tem conta? </span>
            <Link to="/login" className="text-sm font-semibold text-[#9B7FD4]">
            Entrar
            </Link>
        </div>

        </div>
    </div>
    )
}