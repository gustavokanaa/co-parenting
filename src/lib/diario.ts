import {
    IconSun, IconMoon, IconSunset2, IconTrophy, IconHeartRateMonitor, IconSparkles,
} from '@tabler/icons-react'

export const TAGS = [
    { key: '☀️ Manhã',     icon: IconSun,               label: 'Manhã',     color: '#BA7517', bg: '#FAEEDA' },
    { key: '🌙 Noite',     icon: IconMoon,              label: 'Noite',     color: '#185FA5', bg: '#E6F1FB' },
    { key: '🏠 Tarde',     icon: IconSunset2,           label: 'Tarde',     color: '#639922', bg: '#EAF3DE' },
    { key: '🚲 Conquista', icon: IconTrophy,            label: 'Conquista', color: '#534AB7', bg: '#EEEDFE' },
    { key: '🏥 Saúde',     icon: IconHeartRateMonitor,  label: 'Saúde',     color: '#A32D2D', bg: '#FCEBEB' },
    { key: '🌟 Especial',  icon: IconSparkles,          label: 'Especial',  color: '#0F6E56', bg: '#E1F5EE' },
]

export interface Post {
    id: string
    autor_id: string
    autor_nome: string
    autor_vinculo: string
    autor_papel: string
    texto: string
    tag: string
    tem_foto: boolean
    reacoes: number
    created_at: string
    resposta_a: string | null
}

export function formatarTempo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const min = Math.floor(diff / 60000)
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(diff / 86400000)
    if (min < 1) return 'Agora'
    if (min < 60) return `Há ${min} min`
    if (h < 24) return `Há ${h}h`
    if (d === 1) return 'Ontem'
    return `Há ${d} dias`
}

export function getCorAvatar(papel: string) {
    return papel === 'responsavel_principal' ? '#FCEEE9' : '#F3EAF8'
}

export function getIniciais(nome: string) {
    const partes = nome.trim().split(' ')
    if (partes.length >= 2) return partes[0][0].toUpperCase() + partes[1][0].toUpperCase()
    return partes[0].slice(0, 2).toUpperCase()
}
