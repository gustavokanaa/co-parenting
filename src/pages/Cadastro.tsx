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
    if (!nome) return setErro('Informe seu nome completo.')
    if (!email) return setErro('Informe seu e-mail.')
    if (senha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres.')

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
    <div className="min-h-screen bg-[#3D8C8C] flex flex-col">

      {/* Hero */}
        <div className="flex flex-col items-center pt-16 pb-10 px-6">
        <h1 className="text-4xl font-bold text-white tracking-tight">Linkar</h1>
        <p className="text-white/70 text-sm mt-1">Conectados pelo que mais importa</p>
        <div className="mt-6 w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl">
            🤝    
        </div>
        </div>

      {/* Card */}
        <div className="flex-1 bg-[#FFFCF8] rounded-t-3xl px-6 pt-8 pb-10">

        {/* Vínculo */}
        <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest mb-3">
            Qual é o seu vínculo com a criança?
        </p>
        <div className="grid grid-cols-3 gap-2 mb-2">
            {vinculos.slice(0, 6).map(v => (
            <button
                key={v.id}
                onClick={() => setVinculo(v.id)}
                className={`rounded-xl py-3 flex flex-col items-center border-2 transition-all ${
                vinculo === v.id
                    ? 'border-[#3D8C8C] bg-[#EAF4F4]'
                    : 'border-[#E2EEEE] bg-white'
                }`}
            >
                <span className="text-2xl">{v.emoji}</span>
                <span className="text-xs font-semibold text-[#1C2B2B] mt-1">{v.label}</span>
            </button>
            ))}
        </div>
        <button
            onClick={() => setVinculo('responsavel')}
            className={`w-full rounded-xl py-3 px-4 flex items-center gap-3 border-2 transition-all mb-6 ${
            vinculo === 'responsavel'
                ? 'border-[#3D8C8C] bg-[#EAF4F4]'
                : 'border-[#E2EEEE] bg-white'
            }`}
        >
            <span className="text-2xl">🧑‍⚖️</span>
            <div className="text-left">
            <div className="text-sm font-semibold text-[#1C2B2B]">Responsável Legal / Tutor</div>
            <div className="text-xs text-[#8FA3A3]">Guarda judicial ou tutela</div>
            </div>
        </button>

        {/* Campos */}
        <div className="flex flex-col gap-4">
            <div>
            <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest mb-1">
                Nome completo
            </p>
            <input
                type="text"
                placeholder="Ana Silva"
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full border-2 border-[#E2EEEE] rounded-xl px-4 py-3 text-sm text-[#1C2B2B] outline-none focus:border-[#3D8C8C] bg-white"
            />
            </div>
            <div>
            <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest mb-1">
                E-mail
            </p>
            <input
                type="email"
                placeholder="ana@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-[#E2EEEE] rounded-xl px-4 py-3 text-sm text-[#1C2B2B] outline-none focus:border-[#3D8C8C] bg-white"
            />
            </div>
            <div>
            <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest mb-1">
                Senha
            </p>
            <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                className="w-full border-2 border-[#E2EEEE] rounded-xl px-4 py-3 text-sm text-[#1C2B2B] outline-none focus:border-[#3D8C8C] bg-white"
            />
            </div>
        </div>

        {/* Erro */}
        {erro && (
            <p className="text-sm text-[#E07A5F] mt-3 font-medium">{erro}</p>
        )}

        {/* Botão */}
        <button
            onClick={handleCadastro}
            disabled={loading}
            className="w-full mt-6 bg-[#3D8C8C] text-white font-semibold py-4 rounded-full text-sm disabled:opacity-60"
        >
            {loading ? 'Criando conta...' : 'Criar minha conta →'}
        </button>

        {/* Login */}
        <div className="mt-4 text-center">
            <span className="text-sm text-[#8FA3A3]">Já tem conta? </span>
            <Link to="/login" className="text-sm font-semibold text-[#3D8C8C]">
            Entrar
            </Link>
        </div>

        </div>
    </div>
    )
}