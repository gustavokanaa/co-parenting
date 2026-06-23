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

            {cadastroOk && (
            <div className="bg-[#EDE5F8] border border-[#9B7FD4] rounded-xl px-4 py-3 mb-6">
                <p className="text-sm text-[#9B7FD4] font-semibold">
                ✅ Conta criada! Faça login para continuar.
                </p>
            </div>
            )}

            <h2 className="text-2xl font-bold text-[#2A1F3D] mb-1">
            Bem-vindo de volta
            </h2>
            <p className="text-sm text-[#8A7A9B] mb-8">
            Entre para acompanhar a vida do seu filho
            </p>

            <div className="flex flex-col gap-4">
            <div>
                <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-1">E-mail</p>
                <input
                type="email"
                placeholder=""
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-[#E8D5F0] rounded-xl px-4 py-3 text-sm text-[#2A1F3D] outline-none focus:border-[#9B7FD4] bg-white"
                />
            </div>
            <div>
                <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-1">Senha</p>
                <input
                type="password"
                placeholder=""
                value={senha}
                onChange={e => setSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full border-2 border-[#E8D5F0] rounded-xl px-4 py-3 text-sm text-[#2A1F3D] outline-none focus:border-[#9B7FD4] bg-white"
                />
            </div>
            </div>

            {erro && (
            <p className="text-sm text-[#FF7B54] mt-3 font-medium">{erro}</p>
            )}

            <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-6 bg-[#9B7FD4] text-white font-semibold py-4 rounded-full text-sm disabled:opacity-60"
            >
            {loading ? 'Entrando...' : 'Entrar →'}
            </button>

            <div className="mt-3 text-center">
            <Link to="/esqueci-senha" className="text-sm text-[#9B7FD4] font-medium">
                Esqueci minha senha
            </Link>
            </div>

            <div className="mt-4 text-center">
            <span className="text-sm text-[#8A7A9B]">Não tem conta? </span>
            <Link to="/cadastro" className="text-sm font-semibold text-[#9B7FD4]">
                Criar conta
            </Link>
            </div>

        </div>
        </div>
    )
}