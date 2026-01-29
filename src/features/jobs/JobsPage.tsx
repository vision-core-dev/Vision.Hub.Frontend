import React, { useState, useEffect } from "react";
import { Send, CheckCircle, Zap, Globe, Users, MessageCircle } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button";
import { JobCard } from "./components/JobCard";
import type { Job } from "./components/JobCard";
import { JobDetailsSidebar } from "./components/JobDetailsSidebar";
import { LanguageProvider, useLanguage } from "@/shared/contexts/LanguageContext";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { useParams, useNavigate } from "react-router-dom";

// Mock Data with Slugs and Translations
const MOCK_JOBS: Job[] = [
    {
        id: "1",
        slug: "roblox-animator",
        title: {
            en: "Roblox Animator",
            ua: "Roblox Аніматор"
        },
        description: {
            en: "We are looking for an experienced Roblox Animator to help us create animations for our Roblox game.",
            ua: "Ми шукаємо досвідченого Roblox Аніматора, щоб допомогти нам створити анімації для нашої Roblox гри."
        },
        salary: "$5-20 per animation",
        location: { en: "Remote, Free shedule", ua: "Віддалено, вільний графік" },
        type: { en: "Commissions", ua: "Часткова зайнятість" },
        tags: ["Roblox", "Animator", "Animation", "Game Development"]
    },
    // {
    //     id: "2",
    //     slug: "python-backend-developer",
    //     title: {
    //         en: "Python Backend Developer",
    //         ua: "Python Backend Розробник"
    //     },
    //     description: {
    //         en: "Join our backend team to build robust and scalable APIs using FastAPI and Python. You will be designing database schemas, optimizing queries, and ensuring high availability of our services.",
    //         ua: "Приєднуйтесь до нашої backend команди для створення надійних та масштабованих API за допомогою FastAPI та Python. Ви будете проектувати схеми баз даних, оптимізувати запити та забезпечувати високу доступність наших сервісів."
    //     },
    //     salary: "$3,500 - $5,500 / month",
    //     location: { en: "Remote", ua: "Віддалено" },
    //     type: { en: "Contract", ua: "Контракт" },
    //     tags: ["Python", "FastAPI", "PostgreSQL", "Redis"]
    // },
    // {
    //     id: "3",
    //     slug: "ui-ux-designer",
    //     title: {
    //         en: "UI/UX Designer",
    //         ua: "UI/UX Дизайнер"
    //     },
    //     description: {
    //         en: "We need a creative mind to design intuitive and clean user experiences. You will collaborate with product managers and developers to translate requirements into stunning visual designs.",
    //         ua: "Нам потрібен творчий розум для створення зручних та чистих інтерфейсів. Ви будете співпрацювати з менеджерами продуктів та розробниками, щоб перетворити вимоги на чудові візуальні дизайни."
    //     },
    //     salary: "$3,000 - $5,000 / month",
    //     location: { en: "Remote", ua: "Віддалено" },
    //     type: { en: "Full-time", ua: "Повна зайнятість" },
    //     tags: ["Figma", "Design Systems", "Prototyping"]
    // },
    // {
    //     id: "4",
    //     slug: "devops-engineer",
    //     title: {
    //         en: "DevOps Engineer",
    //         ua: "DevOps Інженер"
    //     },
    //     description: {
    //         en: "Help us maintain and improve our infrastructure. You will be responsible for CI/CD pipelines, cloud infrastructure management, and ensuring security best practices.",
    //         ua: "Допоможіть нам підтримувати та покращувати нашу інфраструктуру. Ви будете відповідати за CI/CD пайплайни, управління хмарною інфраструктурою та забезпечення найкращих практик безпеки."
    //     },
    //     salary: "$4,500 - $6,500 / month",
    //     location: { en: "Remote/Hybrid", ua: "Віддалено/Гібрид" },
    //     type: { en: "Full-time", ua: "Повна зайнятість" },
    //     tags: ["AWS", "Docker", "Kubernetes", "CI/CD"]
    // }
];

const JobsPageContent: React.FC = () => {
    const { t } = useLanguage();
    const { slug } = useParams();
    const navigate = useNavigate();
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Deep Linking Effect
    useEffect(() => {
        if (slug) {
            const job = MOCK_JOBS.find(j => j.slug === slug);
            if (job) {
                setSelectedJob(job);
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        }
    }, [slug]);

    const handleApply = (job: Job) => {
        navigate(`/jobs/${job.slug}`);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        navigate('/jobs');
    };

    const PERKS = [
        { icon: Globe, title: t("perks.remote.title"), description: t("perks.remote.desc") },
        { icon: Zap, title: t("perks.fastPaced.title"), description: t("perks.fastPaced.desc") },
        { icon: Users, title: t("perks.team.title"), description: t("perks.team.desc") },
        { icon: CheckCircle, title: t("perks.pay.title"), description: t("perks.pay.desc") },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans selection:bg-brand-solid/30">
            {/* Header with Language Switcher */}
            <div className="fixed top-4 right-4 z-50">
                <LanguageSwitcher />
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white dark:bg-gray-900 pt-24 pb-16 lg:pt-32 lg:pb-24">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.4] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:opacity-[0.1]" />

                <div className="container px-4 mx-auto relative z-10 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-solid/10 text-brand-solid text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-solid opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-solid"></span>
                        </span>
                        {t("hero.hiring")}
                    </span>

                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-100">
                        {t("hero.title.prefix")} <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-solid to-purple-600">Vision Core Dev</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-200">
                        {t("hero.subtitle")}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-300">
                        <Button size="lg" onClick={() => document.getElementById('vacancies')?.scrollIntoView({ behavior: 'smooth' })}>
                            {t("hero.viewOpenings")}
                        </Button>
                        <Button
                            size="lg"
                            color="secondary"
                            onClick={() => window.open('https://t.me/VisionCoreDevBot', '_blank')}
                            iconLeading={MessageCircle}
                        >
                            {t("hero.chatTelegram")}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Perks Section */}
            <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950/50">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {PERKS.map((perk, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-transform hover:-translate-y-1">
                                <div className="p-3 bg-brand-solid/5 rounded-xl text-brand-solid mb-4">
                                    <perk.icon size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{perk.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{perk.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vacancies Section */}
            <section id="vacancies" className="py-20 bg-white dark:bg-gray-900">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t("vacancies.title")}</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                            {t("vacancies.subtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {MOCK_JOBS.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onApply={handleApply}
                            />
                        ))}
                    </div>

                    <div className="mt-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto border border-gray-100 dark:border-gray-800">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("footer.title")}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                            {t("footer.desc")}
                        </p>
                        <Button
                            size="lg"
                            color="secondary"
                            onClick={() => window.open('https://t.me/VisionCoreDevBot', '_blank')}
                            iconLeading={Send}
                        >
                            {t("footer.contact")}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Job Details Sidebar */}
            <JobDetailsSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                job={selectedJob}
            />
        </div>
    );
};

const JobsPage: React.FC = () => (
    <LanguageProvider>
        <JobsPageContent />
    </LanguageProvider>
);

export default JobsPage;
