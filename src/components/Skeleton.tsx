import BottomNav from './BottomNav'

function Bone({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-[#E5E0DA] rounded-lg ${className}`} />
}

function BoneLight({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-white/20 rounded-lg ${className}`} />
}

export function HomeSkeleton() {
    return (
        <div className="h-screen overflow-hidden bg-[#FFF8F2] flex flex-col max-w-md mx-auto">
            <div className="px-6 pt-12 pb-6" style={{ background: 'linear-gradient(135deg, #2A1F3D 0%, #9B7FD4 100%)' }}>
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <BoneLight className="h-3 w-24" />
                        <BoneLight className="h-6 w-36" />
                    </div>
                    <BoneLight className="h-8 w-16 rounded-full" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto pb-4">
                <div className="mx-5 mt-5 rounded-3xl p-5 flex items-center gap-4 bg-white shadow-sm">
                    <Bone className="w-14 h-14 rounded-full flex-shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                        <Bone className="h-4 w-28" />
                        <Bone className="h-3 w-16" />
                        <div className="flex gap-2 mt-1">
                            <Bone className="h-5 w-20 rounded-full" />
                            <Bone className="h-5 w-20 rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="mx-5 mt-6">
                    <Bone className="h-4 w-36 mb-3" />
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
                                <Bone className="w-10 h-11 rounded-xl flex-shrink-0" />
                                <div className="flex-1 flex flex-col gap-2">
                                    <Bone className="h-3.5 w-3/5" />
                                    <Bone className="h-3 w-2/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    )
}

export function CalendarioSkeleton() {
    return (
        <div className="h-screen overflow-hidden bg-[#FFF8F2] flex flex-col max-w-md mx-auto">
            <div className="px-6 pt-12 pb-5" style={{ background: 'linear-gradient(135deg, #2A1F3D 0%, #9B7FD4 100%)' }}>
                <div className="flex justify-between items-center">
                    <BoneLight className="h-6 w-32" />
                    <div className="flex gap-2">
                        <BoneLight className="h-7 w-7 rounded-full" />
                        <BoneLight className="h-7 w-7 rounded-full" />
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pt-5 pb-32">
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <Bone key={i} className="h-3 w-4 mx-auto" />
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2 mb-6">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <Bone key={i} className="h-9 rounded-xl" />
                    ))}
                </div>
                <Bone className="h-3 w-40 mb-3" />
                <div className="flex flex-col gap-3">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-[#E5E0DA] flex flex-col gap-2">
                            <Bone className="h-4 w-2/3" />
                            <Bone className="h-3 w-1/3" />
                        </div>
                    ))}
                </div>
            </div>
            <BottomNav />
        </div>
    )
}

export function DiarioSkeleton() {
    return (
        <div className="h-screen overflow-hidden bg-[#FFF8F2] flex flex-col max-w-md mx-auto">
            <div className="px-6 pt-12 pb-5 shrink-0" style={{ background: 'linear-gradient(135deg, #2A1F3D 0%, #9B7FD4 100%)' }}>
                <BoneLight className="h-6 w-40" />
                <BoneLight className="h-3 w-52 mt-2" />
            </div>
            <div className="flex-1 min-h-0 px-5 pt-4 pb-4 overflow-y-auto">
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <Bone className="w-9 h-9 rounded-full flex-shrink-0" />
                                <div className="flex flex-col gap-1.5">
                                    <Bone className="h-3.5 w-32" />
                                    <Bone className="h-2.5 w-20" />
                                </div>
                            </div>
                            <Bone className="h-3 w-full" />
                            <Bone className="h-3 w-4/5" />
                        </div>
                    ))}
                </div>
            </div>
            <BottomNav />
        </div>
    )
}

export function PerfilSkeleton() {
    return (
        <div className="h-screen overflow-hidden bg-[#FFF8F2] flex flex-col max-w-md mx-auto">
            <div className="bg-gradient-to-br from-[#2A1F3D] to-[#9B7FD4] px-6 pt-12 pb-8 flex flex-col items-center shrink-0">
                <BoneLight className="w-20 h-20 rounded-full mb-3" />
                <BoneLight className="h-6 w-32" />
                <BoneLight className="h-3 w-48 mt-2" />
                <div className="flex gap-2 mt-3">
                    <BoneLight className="h-5 w-20 rounded-full" />
                    <BoneLight className="h-5 w-20 rounded-full" />
                </div>
            </div>
            <div className="flex-1 px-5 pt-5 pb-4 overflow-y-auto">
                <div className="flex flex-col gap-4">
                    <Bone className="h-12 w-full rounded-2xl" />
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                            <Bone className="h-10 w-full rounded-none" />
                            {[1, 2, 3].map(j => (
                                <div key={j} className="px-4 py-3 flex justify-between items-center border-b border-[#E8D5F0] last:border-0">
                                    <Bone className="h-3 w-20" />
                                    <Bone className="h-3 w-16" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <BottomNav />
        </div>
    )
}

export function FamiliaSkeleton() {
    return (
        <div className="h-screen overflow-hidden bg-[#FFF8F2] flex flex-col max-w-md mx-auto">
            <div className="bg-gradient-to-br from-[#2A1F3D] to-[#9B7FD4] px-6 pt-12 pb-6">
                <BoneLight className="h-6 w-40" />
                <BoneLight className="h-3 w-52 mt-2" />
            </div>
            <div className="flex-1 px-5 pt-5 pb-4 flex flex-col gap-5 overflow-y-auto">
                <Bone className="h-12 w-full rounded-xl" />
                <div>
                    <Bone className="h-4 w-40 mb-3" />
                    <div className="flex flex-col gap-3">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border-l-4 border-[#E5E0DA]">
                                <Bone className="w-11 h-11 rounded-full flex-shrink-0" />
                                <div className="flex-1 flex flex-col gap-2">
                                    <Bone className="h-3.5 w-2/5" />
                                    <Bone className="h-3 w-3/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    )
}
