import { type RefAttributes } from "react";
import { Tooltip } from "@/shared/ui/tooltip/tooltip";
import { cx } from "@/shared/utils/cx";
import {
    TextEditorAlignCenter,
    TextEditorAlignLeft,
    TextEditorBold,
    TextEditorBulletList,
    TextEditorColor,
    TextEditorFontFamily,
    TextEditorFontSize,
    // TextEditorGenerate,
    TextEditorImage,
    TextEditorItalic,
    TextEditorLink,
    TextEditorUnderline,
} from "./text-editor-extensions";

interface TextEditorToolbarProps extends RefAttributes<HTMLDivElement> {
    className?: string;
    type?: "simple" | "advanced";
    floating?: boolean;
    hideFontSize?: boolean;
}

export const TextEditorToolbar = ({ className, ref, type = "simple", floating = false, hideFontSize }: TextEditorToolbarProps) => {
    if (type === "simple") {
        return (
            <div
                className={cx(
                    "flex w-max flex-wrap gap-0.5 md:flex-nowrap",
                    floating && "rounded-lg bg-primary p-1 shadow-lg ring-1 ring-secondary_alt",
                    className,
                )}
            >
                <Tooltip title="Жирним">
                    <TextEditorBold />
                </Tooltip>
                <Tooltip title="Курсивом">
                    <TextEditorItalic />
                </Tooltip>
                <Tooltip title="Підкреслення">
                    <TextEditorUnderline />
                </Tooltip>

                <div className="p-1.5">
                    <div className="h-full w-px rounded-full bg-border-primary" />
                </div>

                <TextEditorColor />

                <div className="p-1.5">
                    <div className="h-full w-px rounded-full bg-border-primary" />
                </div>

                <Tooltip title="Вирівнювання по лівому краю">
                    <TextEditorAlignLeft />
                </Tooltip>
                <Tooltip title="Вирівнювання по центру">
                    <TextEditorAlignCenter />
                </Tooltip>
                <Tooltip title="Маркований список">
                    <TextEditorBulletList />
                </Tooltip>
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className={cx(
                "flex w-max flex-col items-start justify-center gap-2 md:flex-row md:items-center md:justify-start md:gap-3",
                floating && "rounded-xl bg-primary p-2 shadow-lg ring-1 ring-secondary_alt",
                className,
            )}
        >
            {!floating && (
                <div className="flex gap-2">
                    <TextEditorFontFamily />
                    {!hideFontSize && <TextEditorFontSize />}
                </div>
            )}

            <div className="flex flex-wrap gap-0.5 md:flex-nowrap">
                <Tooltip title="Жирним">
                    <TextEditorBold />
                </Tooltip>
                <Tooltip title="Курсивом">
                    <TextEditorItalic />
                </Tooltip>
                <Tooltip title="Підкреслення">
                    <TextEditorUnderline />
                </Tooltip>

                <div className="p-1.5">
                    <div className="h-full w-px rounded-full bg-border-primary" />
                </div>

                <TextEditorColor />

                <div className="p-1.5">
                    <div className="h-full w-px rounded-full bg-border-primary" />
                </div>

                <Tooltip title="Вирівнювання по лівому краю">
                    <TextEditorAlignLeft />
                </Tooltip>
                <Tooltip title="Вирівнювання по центру">
                    <TextEditorAlignCenter />
                </Tooltip>
                <Tooltip title="Маркований список">
                    <TextEditorBulletList />
                </Tooltip>

                <div className="p-1.5">
                    <div className="h-full w-px rounded-full bg-border-primary" />
                </div>

                <Tooltip title="Посилання">
                    <TextEditorLink />
                </Tooltip>
                <Tooltip title="Вставити зображення">
                    <TextEditorImage />
                </Tooltip>

                {/*<div className="p-1.5">*/}
                {/*    <div className="h-full w-px rounded-full bg-border-primary" />*/}
                {/*</div>*/}

                {/*<Tooltip title="Generate">*/}
                {/*    <TextEditorGenerate />*/}
                {/*</Tooltip>*/}
            </div>
        </div>
    );
};









