import { Briefcase, MapPin, DollarSign, Clock } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button";
import { cx } from "@/shared/utils/cx";
import { useLanguage } from "@/shared/contexts/LanguageContext";

export interface LocalizedString {
    en: string;
    ua: string;
}

export interface Job {
    id: string;
    slug: string;
    title: LocalizedString;
    description: LocalizedString;
    salary: string;
    location: LocalizedString;
    type: LocalizedString; // e.g., "Full-time", "Contract"
    tags: string[];
}

interface JobCardProps {
    job: Job;
    onApply: (job: Job) => void;
    className?: string;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply, className }) => {
    const { t, language } = useLanguage();

    const getLocalized = (obj: LocalizedString) => obj[language as keyof LocalizedString];

    return (
        <div className={cx(
            "group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] hover:border-brand-primary/20",
            className
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-brand-solid/5 rounded-xl group-hover:bg-brand-solid/10 transition-colors">
                    <Briefcase className="size-6 text-brand-solid" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {t("vacancies.active")}
                </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-solid transition-colors">
                {getLocalized(job.title)}
            </h3>

            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 flex-grow">
                {getLocalized(job.description)}
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="size-4" />
                    {getLocalized(job.location)}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <DollarSign className="size-4" />
                    {job.salary}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="size-4" />
                    {getLocalized(job.type)}
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                <div className="flex gap-2 flex-wrap">
                    {job.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                            {tag}
                        </span>
                    ))}
                    {job.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded text-xs">
                            +{job.tags.length - 2}
                        </span>
                    )}
                </div>

                <Button
                    color="primary"
                    size="sm"
                    onClick={() => onApply(job)}
                    className="shrink-0"
                >
                    {t("vacancies.apply")}
                </Button>
            </div>
        </div>
    );
};
