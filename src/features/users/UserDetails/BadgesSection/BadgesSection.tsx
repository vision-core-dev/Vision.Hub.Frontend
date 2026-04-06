import type { Badge } from "../UserDetailsPage.tsx";
import { Tooltip, TooltipTrigger } from "@/shared/ui/tooltip/tooltip.tsx";

interface BadgesSectionProps {
    badges: Badge[];
}

const BadgesSection = ({ badges }: BadgesSectionProps) => {
    if (badges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5">
            {badges.map((badge) => (
                <Tooltip key={badge.id} title={badge.name} description={badge.description}>
                    <TooltipTrigger className="flex h-8 w-8 items-center justify-center rounded-full border border-secondary bg-secondary/30 text-base cursor-default transition-colors hover:bg-secondary/60">
                        {badge.emoji || (
                            <img src={badge.icon_url} alt={badge.name} className="h-4 w-4 object-contain" />
                        )}
                    </TooltipTrigger>
                </Tooltip>
            ))}
        </div>
    );
};

export default BadgesSection;
