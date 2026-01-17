import type { Badge } from "../UserDetailsPage.tsx";

interface BadgesSectionProps {
    badges: Badge[];
}

const BadgesSection = ({ badges }: BadgesSectionProps) => {
    return badges.length > 0 && (
        <div className="flex w-full flex-col gap-2.5">
            {badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 rounded-[10px] border border-gray-200 bg-gray-50 px-3 py-2.5 transition-colors duration-150 hover:bg-gray-100">
                    <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-gray-200 bg-white text-[1.4rem]">
                        {badge.emoji ? (
                            <span className="text-[1.4rem]">{badge.emoji}</span>
                        ) : (
                            <img src={badge.icon_url} alt={badge.name} className="h-[70%] w-[70%] object-contain" />
                        )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[0.95rem] font-semibold text-gray-900">{badge.name}</p>
                        {badge.description && (
                            <p className="text-xs leading-tight text-gray-500">{badge.description}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default BadgesSection;








