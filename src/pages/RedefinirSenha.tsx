import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Status = 'verificando' | 'pronto' | 'invalido' | 'sucesso'

export default function RedefinirSenha() {
    const navigate = useNavigate()
    const [status, setStatus] = useState<Status>('verificando')
    const [senha, setSenha] = useState('')
    const [confirmar, setConfirmar] = useState('')
    const [erro, setErro] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Supabase JS v2 parseia o hash da URL automaticamente ao inicializar.
        // Verificamos a sessão atual e escutamos PASSWORD_RECOVERY como fallback.
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setStatus('pronto')
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setStatus('pronto')
            }
        })

        // Se após 4s ainda não há sessão, o link é inválido/expirado
        const timeout = setTimeout(() => {
            setStatus(prev => prev === 'verificando' ? 'invalido' : prev)
        }, 4000)

        return () => {
            subscription.unsubscribe()
            clearTimeout(timeout)
        }
    }, [])

    async function handleRedefinir() {
        if (senha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres.')
        if (senha.length > 50) return setErro('A senha deve ter no máximo 50 caracteres.')
        if (senha !== confirmar) return setErro('As senhas não conferem.')

        setErro('')
        setLoading(true)

        const { error } = await supabase.auth.updateUser({ password: senha })

        setLoading(false)

        if (error) {
            setErro('Não foi possível redefinir a senha. O link pode ter expirado.')
            return
        }

        await supabase.auth.signOut()
        setStatus('sucesso')
    }

    if (status === 'verificando') {
        return (
            <div className="min-h-screen flex items-center justify-center max-w-md mx-auto" style={{ background: 'linear-gradient(165deg, #2A1F3D 0%, #4A2E6A 40%, #9B7FD4 100%)' }}>
                <p className="text-white font-semibold">Verificando link...</p>
            </div>
        )
    }

    if (status === 'invalido') {
        return (
            <div className="min-h-screen bg-[#FFF8F2] flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto">
                <span className="text-5xl mb-4">⏰</span>
                <h1 className="text-xl font-bold text-[#2A1F3D]">Link expirado</h1>
                <p className="text-sm text-[#8A7A9B] mt-2 leading-relaxed">
                    Este link de redefinição não é mais válido.
                    Solicite um novo link pelo login.
                </p>
                <button
                    onClick={() => navigate('/esqueci-senha')}
                    className="mt-6 bg-[#9B7FD4] text-white font-semibold py-3 px-8 rounded-full text-sm"
                >
                    Solicitar novo link
                </button>
                <button
                    onClick={() => navigate('/login')}
                    className="mt-3 text-sm text-[#9B7FD4] font-medium"
                >
                    Voltar ao login
                </button>
            </div>
        )
    }

    if (status === 'sucesso') {
        return (
            <div className="min-h-screen bg-[#FFF8F2] flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#EDE5F8] flex items-center justify-center text-3xl mb-4">
                    ✅
                </div>
                <h1 className="text-xl font-bold text-[#2A1F3D]">Senha redefinida!</h1>
                <p className="text-sm text-[#8A7A9B] mt-2 leading-relaxed">
                    Sua senha foi atualizada com sucesso. Faça login para continuar.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="mt-6 bg-[#9B7FD4] text-white font-semibold py-3 px-8 rounded-full text-sm"
                >
                    Ir para o login →
                </button>
            </div>
        )
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
                    🔒
                </div>
            </div>

            {/* Card */}
            <div className="flex-1 bg-[#FFF8F2] rounded-t-3xl px-6 pt-8 pb-10">
                <h2 className="text-2xl font-bold text-[#2A1F3D] mb-1">
                    Nova senha
                </h2>
                <p className="text-sm text-[#8A7A9B] mb-8">
                    Escolha uma senha segura com pelo menos 6 caracteres.
                </p>

                <div className="flex flex-col gap-4">
                    <div>
                        <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-1">Nova senha</p>
                        <input
                            type="password"
                            value={senha}
                            onChange={e => setSenha(e.target.value)}
                            className="w-full border-2 border-[#E8D5F0] rounded-xl px-4 py-3 text-sm text-[#2A1F3D] outline-none focus:border-[#9B7FD4] bg-white"
                        />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-1">Confirmar senha</p>
                        <input
                            type="password"
                            value={confirmar}
                            onChange={e => setConfirmar(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleRedefinir()}
                            className="w-full border-2 border-[#E8D5F0] rounded-xl px-4 py-3 text-sm text-[#2A1F3D] outline-none focus:border-[#9B7FD4] bg-white"
                        />
                    </div>
                </div>

                {erro && (
                    <p className="text-sm text-[#FF7B54] mt-3 font-medium">{erro}</p>
                )}

                <button
                    onClick={handleRedefinir}
                    disabled={loading}
                    className="w-full mt-6 bg-[#9B7FD4] text-white font-semibold py-4 rounded-full text-sm disabled:opacity-60"
                >
                    {loading ? 'Salvando...' : 'Salvar nova senha →'}
                </button>
            </div>
        </div>
    )
}
