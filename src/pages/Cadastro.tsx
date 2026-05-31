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
    <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background: 'linear-gradient(160deg, #F0EBF9, #FFF7EC, #EBF8F5)' }}>

      {/* Hero */}
        <div className="flex flex-col items-center pt-16 pb-10 px-6">
        <h1 className="text-4xl font-bold tracking-tight flex items-center">
          <span style={{ color: '#A391E6' }}>E</span><span style={{ color: '#7FCDBA' }}>l</span><span style={{ color: '#FFB89C' }}>l</span><span style={{ color: '#FFB89C' }}>♥</span>
        </h1>
        <p className="text-[#9B8FA8] text-sm mt-1">Cuidar juntos, mesmo em casas diferentes.</p>
        <div className="mt-6 w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ background: 'rgba(163,145,230,0.15)' }}>
            🤝
        </div>
        </div>

      {/* Card */}
        <div className="flex-1 bg-[#FFF7EC] rounded-t-3xl px-6 pt-8 pb-10">

        {/* Vínculo */}
        <p className="text-xs font-bold text-[#9B8FA8] uppercase tracking-widest mb-3">
            Qual é o seu vínculo com a criança?
        </p>
        <div className="grid grid-cols-3 gap-2 mb-2">
            {vinculos.slice(0, 6).map(v => (
            <button
                key={v.id}
                onClick={() => setVinculo(v.id)}
                className={`rounded-xl py-3 flex flex-col items-center border-2 transition-all ${
                vinculo === v.id
                    ? 'border-[#A391E6] bg-[#EDEAF8]'
                    : 'border-[#E8E4F4] bg-white'
                }`}
            >
                <span className="text-2xl">{v.emoji}</span>
                <span className="text-xs font-semibold text-[#3D3560] mt-1">{v.label}</span>
            </button>
            ))}
        </div>
        <button
            onClick={() => setVinculo('responsavel')}
            className={`w-full rounded-xl py-3 px-4 flex items-center gap-3 border-2 transition-all mb-6 ${
            vinculo === 'responsavel'
                ? 'border-[#A391E6] bg-[#EDEAF8]'
                : 'border-[#E8E4F4] bg-white'
            }`}
        >
            <span className="text-2xl">🧑‍⚖️</span>
            <div className="text-left">
            <div className="text-sm font-semibold text-[#3D3560]">Responsável Legal / Tutor</div>
            <div className="text-xs text-[#9B8FA8]">Guarda judicial ou tutela</div>
            </div>
        </button>

        {/* Campos */}
        <div className="flex flex-col gap-4">
            <div>
            <p className="text-xs font-bold text-[#9B8FA8] uppercase tracking-widest mb-1">
                Nome completo
            </p>
            <input
                type="text"
                placeholder=""
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full border-2 border-[#E8E4F4] rounded-xl px-4 py-3 text-sm text-[#3D3560] outline-none focus:border-[#A391E6] bg-white"
            />
            </div>
            <div>
            <p className="text-xs font-bold text-[#9B8FA8] uppercase tracking-widest mb-1">
                E-mail
            </p>
            <input
                type="email"
                placeholder=""
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-[#E8E4F4] rounded-xl px-4 py-3 text-sm text-[#3D3560] outline-none focus:border-[#A391E6] bg-white"
            />
            </div>
            <div>
            <p className="text-xs font-bold text-[#9B8FA8] uppercase tracking-widest mb-1">
                Senha
            </p>
            <input
                type="password"
                placeholder=""
                value={senha}
                onChange={e => setSenha(e.target.value)}
                className="w-full border-2 border-[#E8E4F4] rounded-xl px-4 py-3 text-sm text-[#3D3560] outline-none focus:border-[#A391E6] bg-white"
            />
            </div>
        </div>

        {/* Erro */}
        {erro && (
            <p className="text-sm text-[#FFB89C] mt-3 font-medium">{erro}</p>
        )}

        {/* Botão */}
        <button
            onClick={handleCadastro}
            disabled={loading}
            className="w-full mt-6 bg-[#A391E6] text-white font-semibold py-4 rounded-full text-sm disabled:opacity-60"
        >
            {loading ? 'Criando conta...' : 'Criar minha conta →'}
        </button>

        {/* Login */}
        <div className="mt-4 text-center">
            <span className="text-sm text-[#9B8FA8]">Já tem conta? </span>
            <Link to="/login" className="text-sm font-semibold text-[#A391E6]">
            Entrar
            </Link>
        </div>

        </div>
    </div>
    )
}