    import { useEffect, useState } from 'react'
    import { useNavigate, useParams } from 'react-router-dom'
    import { supabase } from '../lib/supabase'

    export default function Convite() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [convite, setConvite] = useState<any>(null)
    const [criancaNome, setCriancaNome] = useState('')
    const [status, setStatus] = useState<'carregando' | 'valido' | 'invalido' | 'usado'>('carregando')
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [erro, setErro] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function verificarConvite() {
        if (!token) { setStatus('invalido'); return }

        const { data } = await supabase
            .from('convites')
            .select('*')
            .eq('token', token)
            .single()

        if (!data) { setStatus('invalido'); return }
        if (data.usado) { setStatus('usado'); return }
        if (new Date(data.expires_at) < new Date()) { setStatus('invalido'); return }

        const { data: crianca } = await supabase
            .from('criancas')
            .select('nome')
            .eq('id', data.crianca_id)
            .single()

        if (crianca) setCriancaNome(crianca.nome)
        setConvite(data)
        setStatus('valido')
        }
        verificarConvite()
    }, [token])

    async function handleAceitar() {
        if (!nome) return setErro('Informe seu nome.')
        if (!email) return setErro('Informe seu e-mail.')
        if (senha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres.')

        setErro('')
        setLoading(true)

        // Cria a conta
        const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
            data: {
            nome_completo: nome,
            vinculo: convite.vinculo,
            },
        },
        })

        if (authError) {
        // Tenta fazer login se já existe
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
        })
        if (loginError) {
            setErro('Erro ao criar conta. Verifique seus dados.')
            setLoading(false)
            return
        }
        await entrarNaFamilia(loginData.user.id)
        } else if (authData.user) {
        await entrarNaFamilia(authData.user.id)
        }

        setLoading(false)
    }

    async function entrarNaFamilia(userId: string) {
        // Bloqueia se o usuário já pertence a qualquer família
        const { data: familiaExistente } = await supabase
        .from('membros_familia')
        .select('id')
        .eq('user_id', userId)
        .eq('ativo', true)
        .limit(1)
        .maybeSingle()

        if (familiaExistente) {
        setErro('Você já pertence a uma família. No momento, cada usuário pode fazer parte de apenas uma família.')
        setLoading(false)
        return
        }

        await supabase.from('membros_familia').insert({
        crianca_id: convite.crianca_id,
        user_id: userId,
        nome,
        vinculo: convite.vinculo,
        papel: convite.papel,
        convidado_por: convite.criado_por,
        ativo: true,
        })

        // Marca convite como usado
        await supabase
        .from('convites')
        .update({ usado: true })
        .eq('id', convite.id)

        navigate('/home')
    }

    if (status === 'carregando') {
        return (
        <div className="min-h-screen flex items-center justify-center max-w-md mx-auto" style={{ background: 'linear-gradient(160deg, #F0EBF9, #FFF7EC, #EBF8F5)' }}>
            <p className="text-[#3D3560] font-semibold">Verificando convite...</p>
        </div>
        )
    }

    if (status === 'invalido') {
        return (
        <div className="min-h-screen bg-[#FFF7EC] flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto">
            <span className="text-5xl mb-4">❌</span>
            <h1 className="text-xl font-bold text-[#3D3560]">Convite inválido</h1>
            <p className="text-sm text-[#9B8FA8] mt-2">Este link não existe ou expirou.</p>
            <button onClick={() => navigate('/login')}
            className="mt-6 bg-[#A391E6] text-white font-semibold py-3 px-8 rounded-full text-sm">
            Ir para o login
            </button>
        </div>
        )
    }

    if (status === 'usado') {
        return (
        <div className="min-h-screen bg-[#FFF7EC] flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto">
            <span className="text-5xl mb-4">✅</span>
            <h1 className="text-xl font-bold text-[#3D3560]">Convite já utilizado</h1>
            <p className="text-sm text-[#9B8FA8] mt-2">Este link já foi usado. Faça login para acessar.</p>
            <button onClick={() => navigate('/login')}
            className="mt-6 bg-[#A391E6] text-white font-semibold py-3 px-8 rounded-full text-sm">
            Fazer login
            </button>
        </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background: 'linear-gradient(160deg, #F0EBF9, #FFF7EC, #EBF8F5)' }}>

        {/* Hero */}
        <div className="flex flex-col items-center pt-16 pb-8 px-6">
            <h1 className="text-3xl font-bold flex items-center">
              <span style={{ color: '#A391E6' }}>E</span><span style={{ color: '#7FCDBA' }}>l</span><span style={{ color: '#FFB89C' }}>l</span><span style={{ color: '#FFB89C' }}>♥</span>
            </h1>
            <p className="text-[#9B8FA8] text-sm mt-1">Você foi convidado!</p>
            <div className="mt-6 w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ background: 'rgba(163,145,230,0.15)' }}>
            👋
            </div>
        </div>

        {/* Card */}
        <div className="flex-1 bg-[#FFF7EC] rounded-t-3xl px-6 pt-8 pb-10">

            <div className="bg-[#EDEAF8] rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-[#A391E6] font-semibold text-center">
                Você foi convidado para acompanhar{' '}
                <span className="font-bold">{criancaNome}</span>
            </p>
            <p className="text-xs text-[#9B8FA8] text-center mt-1 capitalize">
                Papel: {convite.papel === 'responsavel_principal' ? 'Responsável Principal' : 'Participante Familiar'}
            </p>
            </div>

            <div className="flex flex-col gap-4">
            <div>
                <p className="text-xs font-bold text-[#9B8FA8] uppercase tracking-widest mb-1">Seu nome</p>
                <input type="text" placeholder="" value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full border-2 border-[#E8E4F4] rounded-xl px-4 py-3 text-sm text-[#3D3560] outline-none focus:border-[#A391E6] bg-white" />
            </div>
            <div>
                <p className="text-xs font-bold text-[#9B8FA8] uppercase tracking-widest mb-1">E-mail</p>
                <input type="email" placeholder="" value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-[#E8E4F4] rounded-xl px-4 py-3 text-sm text-[#3D3560] outline-none focus:border-[#A391E6] bg-white" />
            </div>
            <div>
                <p className="text-xs font-bold text-[#9B8FA8] uppercase tracking-widest mb-1">Senha</p>
                <input type="password" placeholder="" value={senha}
                onChange={e => setSenha(e.target.value)}
                className="w-full border-2 border-[#E8E4F4] rounded-xl px-4 py-3 text-sm text-[#3D3560] outline-none focus:border-[#A391E6] bg-white" />
            </div>
            </div>

            {erro && <p className="text-sm text-[#FFB89C] mt-3 font-medium">{erro}</p>}

            <button onClick={handleAceitar} disabled={loading}
            className="w-full mt-6 bg-[#A391E6] text-white font-semibold py-4 rounded-full text-sm disabled:opacity-60">
            {loading ? 'Entrando...' : 'Aceitar convite →'}
            </button>

            <p className="text-xs text-[#9B8FA8] text-center mt-4">
            Já tem conta? Use o mesmo e-mail e senha para entrar.
            </p>
        </div>
        </div>
    )
    }