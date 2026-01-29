import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, MapPin, DollarSign, Clock } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";
import { TextArea } from "@/shared/ui/textarea/textarea";
import { FileUpload } from "@/shared/components/file-upload/file-upload-base";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { cx } from "@/shared/utils/cx";
import type { Job } from "./JobCard";
import { CloseButton } from "@/shared/ui/buttons/close-button";
import { Select } from "@/shared/ui/select/select";
import { Label } from "@/shared/ui/input/label";

interface JobDetailsSidebarProps {
    job: Job | null;
    isOpen: boolean;
    onClose: () => void;
}

export const JobDetailsSidebar: React.FC<JobDetailsSidebarProps> = ({ job, isOpen, onClose }) => {
    const { t, language } = useLanguage();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [contactMethod, setContactMethod] = useState<string>("");

    // Reset state when sidebar opens/closes or job changes
    useEffect(() => {
        if (!isOpen) {
            // Short delay to allow animation to finish before resetting
            const timer = setTimeout(() => {
                setIsSubmitted(false);
                setUploadedFiles([]);
                setUploadProgress({});
                setContactMethod("");
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !job) return null;

    const handleDropFiles = (files: FileList) => {
        const newFiles = Array.from(files);
        setUploadedFiles((prev) => [...prev, ...newFiles]);

        // Simulate upload progress
        newFiles.forEach(file => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
                if (progress >= 100) clearInterval(interval);
            }, 200);
        });
    };

    const handleDeleteFile = (fileName: string) => {
        setUploadedFiles((prev) => prev.filter(f => f.name !== fileName));
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileName];
            return newProgress;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setIsSubmitted(true);
        }, 1000);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Helper to safer get localized string
    const getLocalized = (obj: any) => {
        if (typeof obj === 'string') return obj;
        return obj?.[language] || obj?.['en'] || '';
    };

    return (
        <div
            className={cx(
                "fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300",
                isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
            onClick={handleBackdropClick}
        >
            {job && (
                <Helmet>
                    <title>{getLocalized(job.title)} | Vision Core Dev</title>
                    <meta name="description" content={getLocalized(job.description).slice(0, 160)} />

                    {/* Open Graph / Facebook */}
                    <meta property="og:type" content="article" />
                    <meta property="og:url" content={`https://hub.vcore.dev/jobs/${job.slug}`} />
                    <meta property="og:title" content={`${getLocalized(job.title)} | Vision Core Dev`} />
                    <meta property="og:description" content={getLocalized(job.description).slice(0, 160)} />
                    <meta property="og:image" content="https://hub.vcore.dev/og-image.jpg" />

                    {/* Twitter */}
                    <meta property="twitter:card" content="summary_large_image" />
                    <meta property="twitter:url" content={`https://hub.vcore.dev/jobs/${job.slug}`} />
                    <meta property="twitter:title" content={`${getLocalized(job.title)} | Vision Core Dev`} />
                    <meta property="twitter:description" content={getLocalized(job.description).slice(0, 160)} />
                    <meta property="twitter:image" content="https://hub.vcore.dev/og-image.jpg" />
                </Helmet>
            )}
            <div
                className={cx(
                    "w-full max-w-xl bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate pr-4">
                        {job ? getLocalized(job.title) : ''}
                    </h2>
                    <CloseButton onClick={onClose} />
                </div>

                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {job && !isSubmitted && (
                        <div className="space-y-8">
                            {/* Job Details */}
                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <MapPin className="size-4 text-brand-solid" />
                                        {getLocalized(job.location)}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <DollarSign className="size-4 text-brand-solid" />
                                        {job.salary}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <Clock className="size-4 text-brand-solid" />
                                        {getLocalized(job.type)}
                                    </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                                    {getLocalized(job.description)}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {job.tags.map((tag, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-brand-solid/5 text-brand-solid dark:bg-brand-solid/10 rounded-md text-xs font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-gray-800" />

                            {/* Application Form */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    {t("modal.applyFor")}
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <Input
                                        label={t("modal.fullName")}
                                        placeholder="John Doe"
                                        isRequired
                                        name="fullName"
                                        className="w-full"
                                    />

                                    <Select
                                        label={t("modal.contact")}
                                        selectedKey={contactMethod}
                                        onSelectionChange={(key) => setContactMethod(key as string)}
                                        className="w-full"
                                        isRequired
                                        placeholder={t("modal.select")}
                                    >
                                        {[
                                            { id: "discord", label: t("discord") },
                                            { id: "telegram", label: t("telegram") },
                                            { id: "email", label: t("email") },
                                            { id: "phone", label: t("phone") },
                                        ].map((item) => (
                                            <Select.Item key={item.id} id={item.id}>
                                                {item.label}
                                            </Select.Item>
                                        ))}
                                    </Select>

                                    {contactMethod && (
                                        <Input
                                            label={t("modal.contactVariant")}
                                            placeholder={t(`modal.contact.${contactMethod}`)}
                                            isRequired
                                            name="contactVariant"
                                            className="w-full"
                                        />
                                    )}

                                    <div className="space-y-1.5">
                                        <Label isRequired>{t("modal.resume")}</Label>
                                        <FileUpload.Root>
                                            <FileUpload.DropZone
                                                onDropFiles={handleDropFiles}
                                                accept=".pdf,.doc,.docx"
                                                hint={t("modal.upload.hint")}
                                            />
                                            <FileUpload.List>
                                                {uploadedFiles.map((file) => (
                                                    <FileUpload.ListItemProgressBar
                                                        key={file.name}
                                                        name={file.name}
                                                        size={file.size}
                                                        progress={uploadProgress[file.name] || 0}
                                                        type={file.name.split('.').pop() as any}
                                                        onDelete={() => handleDeleteFile(file.name)}
                                                    />
                                                ))}
                                            </FileUpload.List>
                                        </FileUpload.Root>
                                    </div>

                                    <TextArea
                                        label={t("modal.message")}
                                        placeholder={t("modal.messagePlaceholder")}
                                        rows={4}
                                    />

                                    <div className="pt-2 pb-8">
                                        <Button type="submit" size="lg" className="w-full justify-center" color="primary">
                                            {t("modal.submit")}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {isSubmitted && (
                        <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("modal.success.title")}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm mx-auto leading-relaxed">
                                {t("modal.success.desc")}
                            </p>
                            <Button onClick={onClose} size="lg" color="secondary" className="min-w-[150px]">
                                {t("modal.success.button")}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
