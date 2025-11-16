// src/Pages/vision-bot/ModuleEditor/ModuleEditorPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ModuleEditorPage.module.css";
import type {VisionBotModule} from "../../../../types/VisionBot.ts";
import {visionBotApi} from "../../../../api/visionBot.ts";
import DefaultPage from "../../../basic/DefaultPage/DefaultPage.tsx";
import CodeEditor from "../CodeEditor/CodeEditor.tsx";
import Button from "../../../basic/Button/Button.tsx";
import {Undo2} from "lucide-react";

const ModuleEditorPage: React.FC = () => {
    const { moduleId } = useParams<{ moduleId: string }>();
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

    const handleSave = async () => {
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
    };

    const returnElement = () => {
        return (<Button variant="secondary" adaptive={true}
                        onClick={() => navigate("/finance")}
        ><Undo2 /> Повернутись</Button>);
    }

    const titlePage = moduleData ? `Модуль: ${moduleData.name}` : "Модуль";

    if (!moduleId) {
        return <DefaultPage title={titlePage} action={returnElement()}>Невірний ID модуля.</DefaultPage>;
    }

    return (
        <DefaultPage title={titlePage}
            action={(
                <>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Збереження..." : "Зберегти"}
                    </Button>
                    returnElement()
                </>
            )}
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
