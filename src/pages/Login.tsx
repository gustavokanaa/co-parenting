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

            {cadastroOk && (
            <div className="bg-[#EDEAF8] border border-[#A391E6] rounded-xl px-4 py-3 mb-6">
                <p className="text-sm text-[#A391E6] font-semibold">
                ✅ Conta criada! Faça login para continuar.
                </p>
            </div>
            )}

            <h2 className="text-2xl font-bold text-[#3D3560] mb-1">
            Bem-vindo de volta
            </h2>
            <p className="text-sm text-[#9B8FA8] mb-8">
            Entre para acompanhar a vida do seu filho
            </p>

            <div className="flex flex-col gap-4">
            <div>
                <p className="text-xs font-bold text-[#9B8FA8] uppercase tracking-widest mb-1">E-mail</p>
                <input
                type="email"
                placeholder=""
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-[#E8E4F4] rounded-xl px-4 py-3 text-sm text-[#3D3560] outline-none focus:border-[#A391E6] bg-white"
                />
            </div>
            <div>
                <p className="text-xs font-bold text-[#9B8FA8] uppercase tracking-widest mb-1">Senha</p>
                <input
                type="password"
                placeholder=""
                value={senha}
                onChange={e => setSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full border-2 border-[#E8E4F4] rounded-xl px-4 py-3 text-sm text-[#3D3560] outline-none focus:border-[#A391E6] bg-white"
                />
            </div>
            </div>

            {erro && (
            <p className="text-sm text-[#FFB89C] mt-3 font-medium">{erro}</p>
            )}

            <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-6 bg-[#A391E6] text-white font-semibold py-4 rounded-full text-sm disabled:opacity-60"
            >
            {loading ? 'Entrando...' : 'Entrar →'}
            </button>

            <div className="mt-4 text-center">
            <span className="text-sm text-[#9B8FA8]">Não tem conta? </span>
            <Link to="/cadastro" className="text-sm font-semibold text-[#A391E6]">
                Criar conta
            </Link>
            </div>

        </div>
        </div>
    )
}