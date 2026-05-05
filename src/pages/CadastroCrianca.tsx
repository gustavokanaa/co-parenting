import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function CadastroCrianca() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')

  // Step 1 — dados básicos
    const [nome, setNome] = useState('')
    const [dataNascimento, setDataNascimento] = useState('')

  // Step 2 — saúde
    const [tipoSanguineo, setTipoSanguineo] = useState('')
    const [alergias, setAlergias] = useState('')
    const [medicamentos, setMedicamentos] = useState('')
    const [pediatra, setPediatra] = useState('')
    const [pediatraTelefone, setPediatraTelefone] = useState('')

  // Step 3 — escola
    const [escola, setEscola] = useState('')
    const [serie, setSerie] = useState('')
    const [periodo, setPeriodo] = useState('')
    const [professora, setProfessora] = useState('')

    async function handleSalvar() {
    if (!nome.trim()) return setErro('Informe o nome da criança.')
    if (nome.trim().length < 2) return setErro('O nome deve ter pelo menos 2 caracteres.')
    if (!dataNascimento) return setErro('Informe a data de nascimento.')
    const nascimento = new Date(dataNascimento)
    const hoje = new Date()
    if (nascimento > hoje) return setErro('A data de nascimento não pode ser no futuro.')
    if (hoje.getFullYear() - nascimento.getFullYear() > 18) return setErro('Idade máxima permitida é 18 anos.')

    setErro('')
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { navigate('/login'); return }

    const user = userData.user
    const nomeCompleto = user.user_metadata?.nome_completo || 'Responsável'
    const vinculo = user.user_metadata?.vinculo || 'responsavel'

    // Cria a criança
    const { data: crianca, error: erroCrianca } = await supabase
        .from('criancas')
        .insert({
        nome,
        data_nascimento: dataNascimento,
        tipo_sanguineo: tipoSanguineo,
        alergias,
        medicamentos,
        pediatra,
        pediatra_telefone: pediatraTelefone,
        escola,
        serie,
        periodo,
        professora,
        })
        .select()
        .single()

    if (erroCrianca) {
        setErro('Erro ao cadastrar criança. Tente novamente.')
        setLoading(false)
        return
    }

    // Adiciona o usuário como Responsável Principal
    await supabase.from('membros_familia').insert({
        crianca_id: crianca.id,
        user_id: user.id,
        nome: nomeCompleto,
        vinculo,
        papel: 'responsavel_principal',
        ativo: true,
    })

    setLoading(false)
    navigate('/home')
    }

    return (
    <div className="min-h-screen bg-[#3D8C8C] flex flex-col max-w-md mx-auto">

      {/* Hero */}
        <div className="flex flex-col items-center pt-12 pb-8 px-6">
        <h1 className="text-3xl font-bold text-white">Linkar</h1>
        <p className="text-white/70 text-sm mt-1">Vamos conhecer sua criança</p>

        {/* Steps */}
        <div className="flex gap-2 mt-6">
            {[1, 2, 3].map(s => (
            <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                s === step ? 'w-8 bg-white' : 'w-4 bg-white/30'
                }`}
            />
            ))}
        </div>
        <p className="text-white/60 text-xs mt-2">
            {step === 1 ? 'Dados básicos' : step === 2 ? 'Saúde' : 'Escola'}
        </p>
        </div>

      {/* Card */}
        <div className="flex-1 bg-[#FFFCF8] rounded-t-3xl px-6 pt-8 pb-10">

        {/* STEP 1 — Dados básicos */}
        {step === 1 && (
            <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-[#1C2B2B]">Dados da criança</h2>
            <div>
                <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest mb-1">Nome completo</p>
                <input
                type="text"
                placeholder=""
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full border-2 border-[#E2EEEE] rounded-xl px-4 py-3 text-sm text-[#1C2B2B] outline-none focus:border-[#3D8C8C] bg-white"
                />
            </div>
            <div>
                <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest mb-1">Data de nascimento</p>
                <input
                type="date"
                value={dataNascimento}
                onChange={e => setDataNascimento(e.target.value)}
                className="w-full border-2 border-[#E2EEEE] rounded-xl px-4 py-3 text-sm text-[#1C2B2B] outline-none focus:border-[#3D8C8C] bg-white"
                />
            </div>
            </div>
        )}

        {/* STEP 2 — Saúde */}
        {step === 2 && (
            <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-[#1C2B2B]">Informações de saúde</h2>
            <p className="text-xs text-[#8FA3A3] -mt-2">Todos os campos são opcionais</p>
            {[
                { label: 'Tipo sanguíneo', value: tipoSanguineo, set: setTipoSanguineo, placeholder: '' },
                { label: 'Alergias', value: alergias, set: setAlergias, placeholder: '' },
                { label: 'Medicamentos em uso', value: medicamentos, set: setMedicamentos, placeholder: '' },
                { label: 'Pediatra', value: pediatra, set: setPediatra, placeholder: '' },
                { label: 'Telefone do pediatra', value: pediatraTelefone, set: setPediatraTelefone, placeholder: '' },
            ].map((field, i) => (
                <div key={i}>
                <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest mb-1">{field.label}</p>
                <input
                    type="text"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={e => field.set(e.target.value)}
                    className="w-full border-2 border-[#E2EEEE] rounded-xl px-4 py-3 text-sm text-[#1C2B2B] outline-none focus:border-[#3D8C8C] bg-white"
                />
                </div>
                ))}
            </div>
            )}

        {/* STEP 3 — Escola */}
        {step === 3 && (
            <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-[#1C2B2B]">Escola</h2>
            <p className="text-xs text-[#8FA3A3] -mt-2">Todos os campos são opcionais</p>
            {[
                { label: 'Nome da escola', value: escola, set: setEscola, placeholder: '' },
                { label: 'Série', value: serie, set: setSerie, placeholder: '' },
                { label: 'Período', value: periodo, set: setPeriodo, placeholder: '' },
                { label: 'Professora', value: professora, set: setProfessora, placeholder: '' },
            ].map((field, i) => (
                <div key={i}>
                <p className="text-xs font-bold text-[#8FA3A3] uppercase tracking-widest mb-1">{field.label}</p>
                <input
                    type="text"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={e => field.set(e.target.value)}
                    className="w-full border-2 border-[#E2EEEE] rounded-xl px-4 py-3 text-sm text-[#1C2B2B] outline-none focus:border-[#3D8C8C] bg-white"
                />
                </div>
            ))}
            </div>
            )}

        {/* Erro */}
        {erro && <p className="text-sm text-[#E07A5F] mt-3 font-medium">{erro}</p>}

        {/* Botões */}
        <div className="flex gap-3 mt-8">
            {step > 1 && (
                <button
                onClick={() => setStep(step - 1)}
                className="flex-1 border-2 border-[#E2EEEE] text-[#8FA3A3] font-semibold py-4 rounded-full text-sm"
            >
                ← Voltar
            </button>
            )}
            {step < 3 ? (
            <button
                onClick={() => {
                if (step === 1 && !nome) return setErro('Informe o nome da criança.')
                if (step === 1 && !dataNascimento) return setErro('Informe a data de nascimento.')
                const nasc = new Date(dataNascimento)
                const hoje = new Date()
                if (nasc > hoje) return setErro('A data não pode ser no futuro.')
                if (hoje.getFullYear() - nasc.getFullYear() > 18) return setErro('Idade máxima é 18 anos.')
                setErro('')
                setStep(step + 1)
                }}
                className="flex-1 bg-[#3D8C8C] text-white font-semibold py-4 rounded-full text-sm"
            >
                Continuar →
            </button>
            ) : (
            <button
                onClick={handleSalvar}
                disabled={loading}
                className="flex-1 bg-[#3D8C8C] text-white font-semibold py-4 rounded-full text-sm disabled:opacity-60"
            >
                {loading ? 'Salvando...' : 'Salvar e começar →'}
            </button>
            )}
        </div>

        </div>
    </div>
    )
}