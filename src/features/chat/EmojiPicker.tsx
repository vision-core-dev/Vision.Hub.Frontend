import { useState, useRef, useEffect } from "react";
import { Button as AriaButton } from "react-aria-components";
import { cx } from "@/shared/utils/cx";

// Common emojis organized by category
const EMOJI_CATEGORIES = {
    "😀 Смайлики": [
        "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘",
        "😗", "😙", "😚", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐",
        "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "🫠", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕",
    ],
    "❤️ Серця": [
        "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
        "💘", "💝", "💟", "♥️", "🫶", "🩷", "🩵", "🩶",
    ],
    "👋 Жести": [
        "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆",
        "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏",
    ],
    "🎉 Святкування": [
        "🎉", "🎊", "🎈", "🎁", "🎂", "🍰", "🧁", "🥳", "🥂", "🍾", "✨", "🌟", "⭐", "🏆", "🥇", "🎯",
    ],
    "👍 Реакції": [
        "👍", "👎", "👏", "🙌", "🔥", "💯", "✅", "❌", "⭕", "❗", "❓", "💡", "📌", "🚀", "💪", "🤝",
    ],
};

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

export function EmojiPicker({ onEmojiSelect, isOpen, onClose, className }: EmojiPickerProps) {
    const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={pickerRef}
            className={cx(
                "absolute bottom-full right-0 mb-2 w-80 rounded-xl bg-primary shadow-xl ring-1 ring-secondary",
                className
            )}
        >
            {/* Category tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-secondary p-2">
                {Object.keys(EMOJI_CATEGORIES).map((category) => (
                    <AriaButton
                        key={category}
                        onPress={() => setActiveCategory(category)}
                        className={cx(
                            "shrink-0 rounded-lg px-2 py-1 text-sm transition-colors",
                            activeCategory === category
                                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                                : "text-tertiary hover:bg-secondary hover:text-secondary"
                        )}
                    >
                        {category.split(" ")[0]}
                    </AriaButton>
                ))}
            </div>

            {/* Emoji grid */}
            <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto p-2">
                {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
                    <AriaButton
                        key={emoji}
                        onPress={() => {
                            onEmojiSelect(emoji);
                            onClose();
                        }}
                        className="flex size-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-secondary"
                    >
                        {emoji}
                    </AriaButton>
                ))}
            </div>
        </div>
    );
}
