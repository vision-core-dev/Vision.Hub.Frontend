import React from "react";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { Button } from "@/shared/ui/buttons/button";
import { Dropdown } from "@/shared/ui/dropdown/dropdown";
import { Globe01 } from "@untitledui/icons";

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <Dropdown.Root>
            <Button color="secondary" size="md" iconLeading={Globe01}>
                {language.toUpperCase()}
            </Button>
            <Dropdown.Popover>
                <Dropdown.Menu>
                    <Dropdown.Item
                        onAction={() => setLanguage("en")}
                    >
                        English (EN)
                    </Dropdown.Item>
                    <Dropdown.Item
                        onAction={() => setLanguage("ua")}
                    >
                        Українська (UA)
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown.Root>
    );
};
