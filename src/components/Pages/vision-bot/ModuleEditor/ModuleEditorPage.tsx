import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ModuleEditorPage.module.css";
import type { VisionBotModule } from "@/types/VisionBot.ts";
import { visionBotApi } from "@/api/visionBot.ts";
import DefaultPage from "../../../basic/DefaultPage/DefaultPage.tsx";
import CodeEditor from "../CodeEditor/CodeEditor.tsx";
import { Undo2 } from "lucide-react";
import {Button} from "@/ui/base/buttons/button.tsx";

const ModuleEditorPage: React.FC = () => {
    const { guildId, moduleId } = useParams<{ guildId: string,  moduleId: string }>();
    const navigate = useNavigate();

    const [moduleData, setModuleData] = useState<VisionBotModule | null>(null);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [status, setStatus] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!moduleId) return;
        visionBotApi
            .getModule(Number(moduleId))
            .then((m) => {
                setModuleData(m);
                setCode(m.code);
                setName(m.name);
                setStatus(m.status);
            })
            .catch(console.error);
    }, [moduleId]);

    const handleSave = useCallback(async () => {
        if (!moduleId) return;
        setSaving(true);
        try {
            const updated = await visionBotApi.updateModule(Number(moduleId), {
                name,
                code,
                status,
            });
            setModuleData(updated);
        } finally {
            setSaving(false);
        }
    }, [moduleId, name, code, status]);

    // 🔥 Ctrl+S autosave (працює на будь-якій розкладці)
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            // Система гарячих клавіш по фізичним кнопкам
            if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
                e.preventDefault();
                if (!saving) handleSave();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [handleSave, saving]);

    const returnElement = () => (
        <Button
            color="secondary"
            iconLeading={Undo2}
            onClick={() => navigate(`/vision-bot/s/${guildId}`)}
        >
            Повернутись
        </Button>
    );

    const titlePage = moduleData ? `Модуль: ${moduleData.name}` : "Модуль";

    if (!moduleId) {
        return (
            <DefaultPage title={titlePage} action={returnElement()}>
                Невірний ID модуля.
            </DefaultPage>
        );
    }

    return (
        <DefaultPage
            title={titlePage}
            action={
                <>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Збереження..." : "Зберегти"}
                    </Button>
                    {returnElement()}
                </>
            }
        >
            <div className={styles.card}>
                <div className={styles.formRow}>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Назва</span>
                        <input
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </label>

                    <label className={styles.fieldCheckbox}>
                        <input
                            type="checkbox"
                            checked={status}
                            onChange={(e) => setStatus(e.target.checked)}
                        />
                        <span>Активний</span>
                    </label>
                </div>

                <span className={styles.fieldLabel}>Код модуля (LuaV)</span>
                <CodeEditor value={code} onChange={setCode} />
            </div>
        </DefaultPage>
    );
};

export default ModuleEditorPage;