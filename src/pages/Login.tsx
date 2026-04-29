import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'

    export default function Login() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const cadastroOk = searchParams.get('cadastro') === 'ok'

    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [erro, setErro] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleLogin() {
    if (!email.trim()) return setErro('Informe seu e-mail.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErro('Informe um e-mail válido.')
    if (!senha) return setErro('Informe sua senha.')
    if (senha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres.')
    if (senha.length > 50) return setErro('A senha deve ter no máximo 50 caracteres.')

        setErro('')
        setLoading(true)

        const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
        })

        if (error) {
        setErro('E-mail ou senha incorretos.')
        setLoading(false)
        return
        }

        const { data: membroData } = await supabase
        .from('membros_familia')
        .select('crianca_id')
        .eq('user_id', signInData.user.id)
        .eq('ativo', true)
        .limit(1)
        .single()

        setLoading(false)

        if (membroData) {
        navigate('/home')
        } else {
        navigate('/cadastro-crianca')
        }
    }

    return (
        <div className="min-h-screen bg-[#3D8C8C] flex flex-col max-w-md mx-auto">

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

            {cadastroOk && (
            <div className="bg-[#EAF4F4] border border-[#3D8C8C] rounded-xl px-4 py-3 mb-6">
                <p className="text-sm text-[#3D8C8C] font-semibold">
                ✅ Conta criada! Faça login para continuar.
                </p>
            </div>
            )}

            <h2 className="text-2xl font-bold text-[#1C2B2B] mb-1">
            Bem-vindo de volta
            </h2>
            <p className="text-sm text-[#8FA3A3] mb-8">
            Entre para acompanhar a vida do seu filho
            </p>

            <div className="flex flex-col gap-4">
            <div>
                <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest mb-1">E-mail</p>
                <input
                type="email"
                placeholder="ana@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-[#E2EEEE] rounded-xl px-4 py-3 text-sm text-[#1C2B2B] outline-none focus:border-[#3D8C8C] bg-white"
                />
            </div>
            <div>
                <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest mb-1">Senha</p>
                <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full border-2 border-[#E2EEEE] rounded-xl px-4 py-3 text-sm text-[#1C2B2B] outline-none focus:border-[#3D8C8C] bg-white"
                />
            </div>
            </div>

            {erro && (
            <p className="text-sm text-[#E07A5F] mt-3 font-medium">{erro}</p>
            )}

            <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-6 bg-[#3D8C8C] text-white font-semibold py-4 rounded-full text-sm disabled:opacity-60"
            >
            {loading ? 'Entrando...' : 'Entrar →'}
            </button>

            <div className="mt-4 text-center">
            <span className="text-sm text-[#8FA3A3]">Não tem conta? </span>
            <Link to="/cadastro" className="text-sm font-semibold text-[#3D8C8C]">
                Criar conta
            </Link>
            </div>

        </div>
        </div>
    )
}