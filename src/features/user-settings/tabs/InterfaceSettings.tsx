import { useTheme } from "@/shared/utils/use-theme.ts";
import { ButtonGroup, ButtonGroupItem } from "@/shared/ui/button-group/button-group.tsx";
import { Moon, Sun } from "lucide-react";

export default function InterfaceSettings() {
    const { theme, setDark, setLight } = useTheme();

    return (
        <div className="flex flex-col gap-8 min-w-[320px]">
            <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-semibold text-primary">Інтерфейс</h3>
                <p className="text-sm text-tertiary">Налаштуйте зовнішній вигляд системи для зручної роботи.</p>
            </div>

            <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-secondary">Тема оформлення</span>
                <ButtonGroup
                    className="w-full"
                    selectedKeys={[theme]}
                    onSelectionChange={(keys) => {
                        if (typeof keys === "string") return;
                        const selected = Array.from(keys)[0] as string;
                        if (selected === "dark") setDark();
                        if (selected === "light") setLight();
                    }}
                >
                    <ButtonGroupItem id="light" iconLeading={Sun} className="flex-1">
                        Світла
                    </ButtonGroupItem>
                    <ButtonGroupItem id="dark" iconLeading={Moon} className="flex-1">
                        Темна
                    </ButtonGroupItem>
                </ButtonGroup>
                <p className="text-xs text-tertiary italic">Оберіть найбільш комфортну тему для ваших очей.</p>
            </div>
        </div>
    );
}
