import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function EsqueciSenha() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [erro, setErro] = useState('')
    const [loading, setLoading] = useState(false)
    const [enviado, setEnviado] = useState(false)

    async function handleEnviar() {
        if (!email.trim()) return setErro('Informe seu e-mail.')
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErro('Informe um e-mail válido.')

        setErro('')
        setLoading(true)

        const redirectTo = `${window.location.origin}/redefinir-senha`

        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

        setLoading(false)

        if (error) {
            setErro('Não foi possível enviar o e-mail. Tente novamente.')
            return
        }

        setEnviado(true)
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
                    🔑
                </div>
            </div>

            {/* Card */}
            <div className="flex-1 bg-[#FFF8F2] rounded-t-3xl px-6 pt-8 pb-10">

                {enviado ? (
                    <div className="flex flex-col items-center text-center pt-4">
                        <div className="w-16 h-16 rounded-full bg-[#EDE5F8] flex items-center justify-center text-3xl mb-4">
                            📬
                        </div>
                        <h2 className="text-xl font-bold text-[#2A1F3D] mb-2">E-mail enviado!</h2>
                        <p className="text-sm text-[#8A7A9B] leading-relaxed mb-2">
                            Enviamos um link para <span className="font-semibold text-[#2A1F3D]">{email}</span>.
                        </p>
                        <p className="text-sm text-[#8A7A9B] leading-relaxed mb-8">
                            Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                        </p>
                        <p className="text-xs text-[#8A7A9B] mb-6">
                            Não recebeu? Verifique a pasta de spam ou tente novamente.
                        </p>
                        <button
                            onClick={() => { setEnviado(false); setEmail('') }}
                            className="w-full border-2 border-[#E8D5F0] text-[#8A7A9B] font-semibold py-4 rounded-full text-sm mb-3"
                        >
                            Tentar com outro e-mail
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-[#9B7FD4] text-white font-semibold py-4 rounded-full text-sm"
                        >
                            Voltar ao login
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-[#2A1F3D] mb-1">
                            Redefinir senha
                        </h2>
                        <p className="text-sm text-[#8A7A9B] mb-8">
                            Informe seu e-mail e enviaremos um link para você criar uma nova senha.
                        </p>

                        <div>
                            <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-1">E-mail</p>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleEnviar()}
                                className="w-full border-2 border-[#E8D5F0] rounded-xl px-4 py-3 text-sm text-[#2A1F3D] outline-none focus:border-[#9B7FD4] bg-white"
                            />
                        </div>

                        {erro && (
                            <p className="text-sm text-[#FF7B54] mt-3 font-medium">{erro}</p>
                        )}

                        <button
                            onClick={handleEnviar}
                            disabled={loading}
                            className="w-full mt-6 bg-[#9B7FD4] text-white font-semibold py-4 rounded-full text-sm disabled:opacity-60"
                        >
                            {loading ? 'Enviando...' : 'Enviar link →'}
                        </button>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full mt-3 border-2 border-[#E8D5F0] text-[#8A7A9B] font-semibold py-4 rounded-full text-sm"
                        >
                            ← Voltar ao login
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
