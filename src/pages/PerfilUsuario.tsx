import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { IconChevronLeft } from '@tabler/icons-react'
import BottomNav from '../components/BottomNav'

type Mensagem = { tipo: 'erro' | 'sucesso'; texto: string } | null

export default function PerfilUsuario() {
    const navigate = useNavigate()
    const [carregando, setCarregando] = useState(true)
    const [emailAtual, setEmailAtual] = useState('')

    // Nome
    const [nome, setNome] = useState('')
    const [salvandoNome, setSalvandoNome] = useState(false)
    const [msgNome, setMsgNome] = useState<Mensagem>(null)

    // E-mail
    const [novoEmail, setNovoEmail] = useState('')
    const [salvandoEmail, setSalvandoEmail] = useState(false)
    const [msgEmail, setMsgEmail] = useState<Mensagem>(null)

    // Senha
    const [senhaAtual, setSenhaAtual] = useState('')
    const [novaSenha, setNovaSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const [salvandoSenha, setSalvandoSenha] = useState(false)
    const [msgSenha, setMsgSenha] = useState<Mensagem>(null)

    useEffect(() => {
        async function carregar() {
            const { data: userData } = await supabase.auth.getUser()
            if (!userData.user) { navigate('/login'); return }

            setEmailAtual(userData.user.email || '')
            setNome(userData.user.user_metadata?.nome_completo || '')
            setCarregando(false)
        }
        carregar()
    }, [navigate])

    async function salvarNome() {
        const nomeAparado = nome.trim()
        if (nomeAparado.length < 2) {
            setMsgNome({ tipo: 'erro', texto: 'O nome deve ter pelo menos 2 caracteres.' })
            return
        }

        setSalvandoNome(true)
        setMsgNome(null)

        const { error: erroAuth } = await supabase.auth.updateUser({
            data: { nome_completo: nomeAparado },
        })
        if (erroAuth) {
            setSalvandoNome(false)
            setMsgNome({ tipo: 'erro', texto: 'Erro ao salvar o nome. Tente novamente.' })
            return
        }

        // Propaga para membros_familia.nome e posts_diario.autor_nome (Família/Diário/feed da Home)
        const { error: erroPropagacao } = await supabase.rpc('atualizar_nome_em_familia', {
            p_novo_nome: nomeAparado,
        })

        setSalvandoNome(false)

        if (erroPropagacao) {
            setMsgNome({ tipo: 'erro', texto: 'Nome de login salvo, mas não deu pra atualizar em Família/Diário. Tente de novo.' })
            return
        }

        setMsgNome({ tipo: 'sucesso', texto: 'Nome atualizado com sucesso!' })
    }

    async function salvarEmail() {
        const emailAparado = novoEmail.trim()
        if (!emailAparado || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAparado)) {
            setMsgEmail({ tipo: 'erro', texto: 'Informe um e-mail válido.' })
            return
        }
        if (emailAparado.toLowerCase() === emailAtual.toLowerCase()) {
            setMsgEmail({ tipo: 'erro', texto: 'Esse já é o seu e-mail atual.' })
            return
        }

        setSalvandoEmail(true)
        setMsgEmail(null)

        const { error } = await supabase.auth.updateUser({ email: emailAparado })

        setSalvandoEmail(false)

        if (error) {
            setMsgEmail({ tipo: 'erro', texto: 'Erro ao solicitar a troca de e-mail. Tente novamente.' })
            return
        }

        setNovoEmail('')
        setMsgEmail({
            tipo: 'sucesso',
            texto: 'Enviamos um link de confirmação — a troca só é efetivada depois que você confirmar. Verifique a caixa de entrada do seu e-mail atual e/ou do novo (depende da configuração de segurança do projeto). Até lá, seu login continua sendo com o e-mail atual.',
        })
    }

    async function salvarSenha() {
        if (!senhaAtual) {
            setMsgSenha({ tipo: 'erro', texto: 'Informe sua senha atual.' })
            return
        }
        if (novaSenha.length < 8) {
            setMsgSenha({ tipo: 'erro', texto: 'A nova senha deve ter pelo menos 8 caracteres.' })
            return
        }
        if (novaSenha !== confirmarSenha) {
            setMsgSenha({ tipo: 'erro', texto: 'As senhas não conferem.' })
            return
        }

        setSalvandoSenha(true)
        setMsgSenha(null)

        // Reautentica com a senha atual antes de trocar — só prossegue se ela bater
        const { error: erroLogin } = await supabase.auth.signInWithPassword({
            email: emailAtual,
            password: senhaAtual,
        })

        if (erroLogin) {
            setSalvandoSenha(false)
            setMsgSenha({ tipo: 'erro', texto: 'Senha atual incorreta.' })
            return
        }

        const { error: erroUpdate } = await supabase.auth.updateUser({ password: novaSenha })

        setSalvandoSenha(false)

        if (erroUpdate) {
            setMsgSenha({ tipo: 'erro', texto: 'Erro ao salvar a nova senha. Tente novamente.' })
            return
        }

        setSenhaAtual('')
        setNovaSenha('')
        setConfirmarSenha('')
        setMsgSenha({ tipo: 'sucesso', texto: 'Senha alterada com sucesso!' })
    }

    function renderMensagem(msg: Mensagem) {
        if (!msg) return null
        return (
            <p className={`text-xs mt-2 font-medium leading-relaxed ${msg.tipo === 'sucesso' ? 'text-[#0F6E56]' : 'text-[#E07A5F]'}`}>
                {msg.texto}
            </p>
        )
    }

    if (carregando) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#FFF8F2] max-w-md mx-auto">
                <p className="text-sm text-[#8A7A9B]">Carregando...</p>
            </div>
        )
    }

    return (
        <div className="h-screen overflow-hidden bg-[#FFF8F2] flex flex-col max-w-md mx-auto">

            {/* Header */}
            <div className="bg-gradient-to-br from-[#2A1F3D] to-[#9B7FD4] px-6 pt-12 pb-6 flex items-center gap-3 shrink-0">
                <button
                    onClick={() => navigate('/perfil')}
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"
                >
                    <IconChevronLeft size={20} strokeWidth={2} />
                </button>
                <div>
                    <h1 className="text-white text-xl font-bold">Meu perfil</h1>
                    <p className="text-white/60 text-xs mt-0.5">Dados da sua conta</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">

                {/* Nome */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-2">Nome completo</p>
                    <input
                        type="text"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        className="w-full border-2 border-[#E8D5F0] rounded-xl px-4 py-3 text-sm text-[#2A1F3D] outline-none focus:border-[#9B7FD4] bg-white"
                    />
                    {renderMensagem(msgNome)}
                    <button
                        onClick={salvarNome}
                        disabled={salvandoNome}
                        className="w-full mt-3 bg-[#9B7FD4] text-white font-semibold py-3 rounded-full text-sm disabled:opacity-60"
                    >
                        {salvandoNome ? 'Salvando...' : 'Salvar nome'}
                    </button>
                </div>

                {/* E-mail */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-2">E-mail</p>
                    <p className="text-xs text-[#8A7A9B] mb-2">
                        Atual: <span className="font-semibold text-[#2A1F3D]">{emailAtual}</span>
                    </p>
                    <input
                        type="email"
                        value={novoEmail}
                        onChange={e => setNovoEmail(e.target.value)}
                        placeholder="Novo e-mail"
                        className="w-full border-2 border-[#E8D5F0] rounded-xl px-4 py-3 text-sm text-[#2A1F3D] placeholder-[#C5B8D8] outline-none focus:border-[#9B7FD4] bg-white"
                    />
                    {renderMensagem(msgEmail)}
                    <button
                        onClick={salvarEmail}
                        disabled={salvandoEmail}
                        className="w-full mt-3 bg-[#9B7FD4] text-white font-semibold py-3 rounded-full text-sm disabled:opacity-60"
                    >
                        {salvandoEmail ? 'Enviando...' : 'Trocar e-mail'}
                    </button>
                </div>

                {/* Senha */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <p className="text-xs font-bold text-[#8A7A9B] uppercase tracking-widest mb-2">Alterar senha</p>
                    <div className="flex flex-col gap-3">
                        <input
                            type="password"
                            value={senhaAtual}
                            onChange={e => setSenhaAtual(e.target.value)}
                            placeholder="Senha atual"
                            className="w-full border-2 border-[#E8D5F0] rounded-xl px-4 py-3 text-sm text-[#2A1F3D] placeholder-[#C5B8D8] outline-none focus:border-[#9B7FD4] bg-white"
                        />
                        <input
                            type="password"
                            value={novaSenha}
                            onChange={e => setNovaSenha(e.target.value)}
                            placeholder="Nova senha (mín. 8 caracteres)"
                            className="w-full border-2 border-[#E8D5F0] rounded-xl px-4 py-3 text-sm text-[#2A1F3D] placeholder-[#C5B8D8] outline-none focus:border-[#9B7FD4] bg-white"
                        />
                        <input
                            type="password"
                            value={confirmarSenha}
                            onChange={e => setConfirmarSenha(e.target.value)}
                            placeholder="Confirmar nova senha"
                            onKeyDown={e => e.key === 'Enter' && salvarSenha()}
                            className="w-full border-2 border-[#E8D5F0] rounded-xl px-4 py-3 text-sm text-[#2A1F3D] placeholder-[#C5B8D8] outline-none focus:border-[#9B7FD4] bg-white"
                        />
                    </div>
                    {renderMensagem(msgSenha)}
                    <button
                        onClick={salvarSenha}
                        disabled={salvandoSenha}
                        className="w-full mt-3 bg-[#9B7FD4] text-white font-semibold py-3 rounded-full text-sm disabled:opacity-60"
                    >
                        {salvandoSenha ? 'Salvando...' : 'Salvar nova senha'}
                    </button>
                </div>

            </div>

            <BottomNav />

        </div>
    )
}
