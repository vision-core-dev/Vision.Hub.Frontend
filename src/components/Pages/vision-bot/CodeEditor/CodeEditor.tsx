import React, { useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";

import { registerVisionbotDocs } from "./VisionBotLuaAPI";

type Props = { value: string; onChange: (code: string) => void };

const CodeEditor: React.FC<Props> = ({ value, onChange }) => {
    const handleMount: OnMount = useCallback((_editor, monacoInstance) => {

        // ------------------------------
        // Register LUA language
        // ------------------------------
        monacoInstance.languages.register({ id: "lua" });

        monacoInstance.languages.setMonarchTokensProvider("lua", {
            tokenizer: {
                root: [
                    [/\b(http|logger|guild|member|message|reaction|vars|store|await|event)\b/, "vision-global"],
                    [/\b(function|local|and|or|if|then|else|for|in|end|return|while|do)\b/, "keyword"],
                    [/\b(true|false|nil)\b/, "constant"],
                    [/--.*/, "comment"],
                    [/"([^"\\]|\\.)*"/, "string"],
                    [/'([^'\\]|\\.)*'/, "string"],
                    [/[0-9]+(\.[0-9]+)?/, "number"],
                    [/[a-zA-Z_]\w*/, "identifier"],
                ]
            }
        });

        // ------------------------------
        // Theme
        // ------------------------------
        monacoInstance.editor.defineTheme("visionbot-dark", {
            base: "vs-dark",
            inherit: true,
            colors: { "editor.background": "#1e1e1e" },
            rules: [
                { token: "vision-global", foreground: "66D9EF", fontStyle: "bold" },
                { token: "keyword", foreground: "C586C0" },
                { token: "string", foreground: "CE9178" },
                { token: "comment", foreground: "6A9955" },
                { token: "number", foreground: "B5CEA8" }
            ]
        });

        monacoInstance.editor.setTheme("visionbot-dark");

        // ------------------------------
        // Register docs/signatures/autocomplete
        // ------------------------------
        registerVisionbotDocs(monacoInstance);

        // ------------------------------
        // Simple Lua Lint
        // ------------------------------
        function lint() {
            const model = _editor.getModel();
            if (!model) return;

            // 👇 РОБИМО СТЕК
            let blockStack: { line: number }[] = [];

            const lines = model.getValue().split("\n");
            const markers: monaco.editor.IMarkerData[] = [];

            lines.forEach((line, i) => {
                const ln = i + 1;

                // ❌ if ... then
                if (/^\s*if\s+.+$/.test(line) && !line.includes("then")) {
                    markers.push({
                        severity: monacoInstance.MarkerSeverity.Error,
                        message: "`if` must end with `then`",
                        startLineNumber: ln,
                        endLineNumber: ln,
                        startColumn: 1,
                        endColumn: line.length
                    });
                }

                const opens = /\b(function|if|for|while|do)\b/.test(line);
                const closes = /\bend\b/.test(line);

                if (opens && !closes) blockStack.push({ line: ln });
                if (closes) blockStack.pop();
            });

            // ❌ missing end
            if (blockStack.length) {
                const last = blockStack[0];
                markers.push({
                    severity: monacoInstance.MarkerSeverity.Error,
                    message: "Missing `end`",
                    startLineNumber: last.line,
                    endLineNumber: last.line,
                    startColumn: 1,
                    endColumn: 999
                });
            }

            monacoInstance.editor.setModelMarkers(model, "visionbot-lua", markers);
        }


        _editor.onDidChangeModelContent(() => lint());
        setTimeout(() => lint(), 50);
    }, []);

    return (
        <Editor
            height="80vh"
            defaultLanguage="lua"
            value={value}
            onChange={(code) => onChange(code || "")}
            onMount={handleMount}
            options={{
                fontFamily: "JetBrains Mono",
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                wordWrap: "on",
                scrollBeyondLastLine: false
            }}
            theme="visionbot-dark"
        />
    );
};

export default CodeEditor;
