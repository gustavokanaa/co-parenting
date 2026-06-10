import { useNavigate, useLocation } from 'react-router-dom'
import { IconHome, IconCalendarEvent, IconUser, IconNotebook, IconUsersGroup } from '@tabler/icons-react'

const NAV_ITEMS = [
    { path: '/home', icon: IconHome, label: 'Home' },
    { path: '/calendario', icon: IconCalendarEvent, label: 'Calendário' },
    { path: '/perfil', icon: IconUser, label: 'Perfil' },
    { path: '/diario', icon: IconNotebook, label: 'Diário' },
    { path: '/familia', icon: IconUsersGroup, label: 'Família' },
]

export default function BottomNav() {
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div className="w-full border-t border-[#E2EEEE] bg-white px-4 py-2 flex justify-around items-center shrink-0">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                const active = location.pathname === path
                return (
                    <button
                        key={path}
                        onClick={() => navigate(path)}
                        className="flex items-center gap-1.5 transition-all"
                        style={active
                            ? { backgroundColor: '#E1F5EE', borderRadius: '999px', padding: '8px 16px' }
                            : { padding: '8px' }
                        }
                    >
                        <Icon size={20} color={active ? '#0F6E56' : '#8FA3A3'} strokeWidth={1.75} />
                        {active && (
                            <span className="text-[11px] font-semibold" style={{ color: '#085041' }}>
                                {label}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
