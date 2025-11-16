import React, { useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";

type Props = {
    value: string;
    onChange: (code: string) => void;
};

const CodeEditor: React.FC<Props> = ({ value, onChange }) => {
    const handleMount: OnMount = useCallback((_editor, monaco) => {
        // -------------------------------
        //  Register Lua if not exists
        // -------------------------------

        // if (!monaco.languages.getLanguages().some((l) => l.id === "lua")) {
        monaco.languages.register({ id: "lua" });

        monaco.languages.setMonarchTokensProvider("lua", {
            tokenizer: {
                root: [
                    [
                        /\b(http|logger|guild|member|message|reaction|vars|store|await|event)\b/,
                        "vision-global"
                    ],
                    [/\b(function|local|if|then|else|for|in|end|return|while|do)\b/, "keyword"],
                    [/\b(true|false|nil)\b/, "constant"],
                    [/--.*/, "comment"],
                    [/"([^"\\]|\\.)*"/, "string"],
                    [/'([^'\\]|\\.)*'/, "string"],
                    [/[0-9]+(\.[0-9]+)?/, "number"],
                    [/[a-zA-Z_]\w*/, "identifier"],
                ],
            }
        });


        monaco.editor.defineTheme("visionbot-dark", {
            base: "vs-dark",
            inherit: true,
            colors: {
                "editor.background": "#1e1e1e",
                "editor.foreground": "#d4d4d4",
                "editorLineNumber.foreground": "#5c5c5c",
                "editorCursor.foreground": "#aeafad",
                "editor.selectionBackground": "#264f78",
                "editor.lineHighlightBackground": "#2a2d2e",
                "editorIndentGuide.background": "#404040",
                "editorIndentGuide.activeBackground": "#707070",
            },
            rules: [
                // VisionBot Globals — м'який синій
                { token: "vision-global", foreground: "66D9EF", fontStyle: "bold" },

                // Ключові слова — фіолетовий
                { token: "keyword", foreground: "C586C0", fontStyle: "bold" },

                // Стрінги — теплий оранжево-коричневий
                { token: "string", foreground: "CE9178" },

                // Коментарі — приглушені зелені
                { token: "comment", foreground: "6A9955", fontStyle: "italic" },

                // Числа — бірюзові
                { token: "number", foreground: "B5CEA8" },

                // Константи — синьо-фіолетові
                { token: "constant", foreground: "4FC1FF" },
            ]
        });

        monaco.editor.setTheme("visionbot-dark");


        monaco.languages.setLanguageConfiguration("lua", {
            comments: { lineComment: "--" },
            brackets: [
                ["{", "}"],
                ["[", "]"],
                ["(", ")"],
            ],
            autoClosingPairs: [
                { open: "{", close: "}" },
                { open: "[", close: "]" },
                { open: "(", close: ")" },
                { open: '"', close: '"' },
                { open: "'", close: "'" },
            ],
        });
        // }

        const objectFields: Record<string, string[]> = {
            guild: [
                "id",
                "name",
                "owner_id",
                "icon",
                "member_count",
                "get_role",
                "get_channel",
                "ban_member",
                "unban_member"
            ],
            member: [
                "id",
                "name",
                "nickname",
                "avatar",
                "bot",
                "roles",
                "add_role",
                "remove_role",
                "kick",
                "ban",
                "timeout"
            ],
            message: [
                "id",
                "content",
                "author",
                "channel_id",
                "guild_id",
                "answer",
                "delete",
                "edit"
            ],
            reaction: [
                "emoji",
                "emoji_id",
                "emoji_name",
                "message_id",
                "user_id",
                "member",
                "channel_id",
                "guild_id",
                "remove_self"
            ],
            vars: ["get", "set", "clear"],
            store: ["module", "server"],
        };


        // -------------------------------------
        //  Avoid double-registering providers
        // -------------------------------------
        if ((window as any).__VISIONBOT_COMPLETIONS__) return;
        (window as any).__VISIONBOT_COMPLETIONS__ = true;

        // VisionBot Globals
        const globals = [
            "http",
            "logger",
            "guild",
            "member",
            "message",
            "reaction",
            "vars",
            "store",
            "await",
            "event"
        ];

        // reaction.* methods
        const reactionFields = [
            "emoji",
            "emoji_name",
            "emoji_id",
            "message_id",
            "user_id",
            "channel_id",
            "guild_id",
            "member",
            "remove_self",
        ];

        // Other VisionBot APIs
        const loggerMethods = ["info", "warn", "error", "debug", "trace", "success"];
        const httpMethods = ["get", "post", "put", "delete"];
        const messageMethods = ["answer", "delete", "edit"];
        const memberMethods = ["kick", "ban", "unban", "timeout", "add_role", "remove_role"];

        const storeRoots = ["module", "server"];
        const storeMethods = ["get", "set", "query", "remove"];

        const make = (
            label: string,
            insertText: string,
            kind: Monaco.languages.CompletionItemKind,
            range: Monaco.IRange,
            doc: string = ""
        ): Monaco.languages.CompletionItem => ({
            label,
            insertText,
            kind,
            range,
            documentation: doc
        });

        function extractVariables(model: Monaco.editor.ITextModel): string[] {
            const text = model.getValue().split("\n");
            const vars = new Set<string>();

            for (const line of text) {
                // local x = ...
                const localMatch = line.match(/local\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
                if (localMatch) vars.add(localMatch[1]);

                // x = ...
                const assignMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
                if (assignMatch) vars.add(assignMatch[1]);

                // function f(arg)
                const funcMatch = line.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)/);
                if (funcMatch) {
                    vars.add(funcMatch[1]); // <-- ДОДАЛИ ІМ’Я ФУНКЦІЇ

                    if (funcMatch[2]) {
                        funcMatch[2].split(",").forEach(a => {
                            const clean = a.trim();
                            if (clean.length) vars.add(clean);
                        });
                    }
                }

                // local function f(arg)
                const localFuncMatch = line.match(/local\s+function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)/);
                if (localFuncMatch) {
                    vars.add(localFuncMatch[1]); // <-- ДОДАЛИ ІМ’Я ЛОКАЛЬНОЇ ФУНКЦІЇ

                    if (localFuncMatch[2]) {
                        localFuncMatch[2].split(",").forEach(a => {
                            const clean = a.trim();
                            if (clean.length) vars.add(clean);
                        });
                    }
                }
            }

            return Array.from(vars);
        }


        function runLuaLint(model: Monaco.editor.ITextModel) {
            const text = model.getValue().split("\n");
            const markers: Monaco.editor.IMarkerData[] = [];
            const stack: { keyword: string; line: number }[] = [];

            text.forEach((line, i) => {
                const ln = i + 1;

                // ------------------------------
                // Detect "if" without "then"
                // ------------------------------
                if (/^\s*if\s+.+\s*$/i.test(line) && !line.includes("then")) {
                    markers.push({
                        severity: monaco.MarkerSeverity.Error,
                        message: "`if` must end with `then`",
                        startLineNumber: ln,
                        endLineNumber: ln,
                        startColumn: 1,
                        endColumn: line.length + 1,
                    });
                }

                // ------------------------------
                // Count blocks (function/if/for/do)
                // ------------------------------
                if (/\b(function|if|for|while|do)\b/.test(line) && !/end\b/.test(line)) {
                    stack.push({ keyword: "block", line: ln });
                }

                if (/\bend\b/.test(line)) {
                    if (stack.length === 0) {
                        markers.push({
                            severity: monaco.MarkerSeverity.Error,
                            message: "Unexpected `end`",
                            startLineNumber: ln,
                            endLineNumber: ln,
                            startColumn: 1,
                            endColumn: line.length + 1,
                        });
                    } else {
                        stack.pop();
                    }
                }

                // ------------------------------
                // Unbalanced parentheses
                // ------------------------------
                const opens = (line.match(/\(/g) || []).length;
                const closes = (line.match(/\)/g) || []).length;

                if (opens !== closes) {
                    markers.push({
                        severity: monaco.MarkerSeverity.Warning,
                        message: "Unbalanced parentheses",
                        startLineNumber: ln,
                        endLineNumber: ln,
                        startColumn: 1,
                        endColumn: line.length + 1,
                    });
                }
            });

            // ------------------------------
            // Missing `end` at EOF
            // ------------------------------
            if (stack.length > 0) {
                const last = stack[stack.length - 1];
                markers.push({
                    severity: monaco.MarkerSeverity.Error,
                    message: "Missing `end` for block opened here",
                    startLineNumber: last.line,
                    endLineNumber: last.line,
                    startColumn: 1,
                    endColumn: 50,
                });
            }

            monaco.editor.setModelMarkers(model, "visionbot-lua", markers);
        }

        monaco.languages.registerCompletionItemProvider("lua", {
            triggerCharacters: [".", '"'],
            provideCompletionItems(model, position) {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                const before = model.getValueInRange({
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: 1,
                    endColumn: word.startColumn,
                }).trim();

                const suggestions: Monaco.languages.CompletionItem[] = [];

                // ------------------------------------------
                // Generic OBJECT.* (guild.*, member.*, etc)
                // ------------------------------------------
                for (const objectName of Object.keys(objectFields)) {
                    if (before.endsWith(objectName + ".")) {
                        objectFields[objectName].forEach(f =>
                            suggestions.push(
                                make(
                                    f,
                                    f,
                                    monaco.languages.CompletionItemKind.Field,
                                    range,
                                    `${objectName}.${f}`
                                )
                            )
                        );

                        return { suggestions };
                    }
                }


                // ------------------------------------------
                // reaction.*
                // ------------------------------------------
                if (before.endsWith("reaction.")) {
                    reactionFields.forEach(f =>
                        suggestions.push(
                            make(
                                f,
                                f,
                                monaco.languages.CompletionItemKind.Field,
                                range,
                                `reaction.${f}`
                            )
                        )
                    );

                    return { suggestions };
                }

                // logger.*
                if (before.endsWith("logger.")) {
                    loggerMethods.forEach(m =>
                        suggestions.push(
                            make(
                                m,
                                `${m}("message")`,
                                monaco.languages.CompletionItemKind.Function,
                                range
                            )
                        )
                    );
                    return { suggestions };
                }

                // http.*
                if (before.endsWith("http.")) {
                    httpMethods.forEach(m =>
                        suggestions.push(
                            make(
                                m,
                                `${m}("https://example.com", function(result)\n\tlogger.info(result.status)\nend)`,
                                monaco.languages.CompletionItemKind.Method,
                                range
                            )
                        )
                    );
                    return { suggestions };
                }

                // message.*
                if (before.endsWith("message.")) {
                    messageMethods.forEach(m =>
                        suggestions.push(
                            make(
                                m,
                                `${m}("text")`,
                                monaco.languages.CompletionItemKind.Method,
                                range
                            )
                        )
                    );
                    return { suggestions };
                }

                // member.*
                if (before.endsWith("member.")) {
                    memberMethods.forEach(m =>
                        suggestions.push(
                            make(
                                m,
                                `${m}()`,
                                monaco.languages.CompletionItemKind.Method,
                                range
                            )
                        )
                    );
                    return { suggestions };
                }

                // store.*
                if (before.endsWith("store.")) {
                    storeRoots.forEach(s =>
                        suggestions.push(
                            make(
                                s,
                                s,
                                monaco.languages.CompletionItemKind.Variable,
                                range
                            )
                        )
                    );
                    return { suggestions };
                }

                // store.module.* / store.server.*
                if (before.includes("store.module.") || before.includes("store.server.")) {
                    storeMethods.forEach(m =>
                        suggestions.push(
                            make(
                                m,
                                m,
                                monaco.languages.CompletionItemKind.Method,
                                range
                            )
                        )
                    );
                    return { suggestions };
                }

                // ------------------------------------------
                // USER VARIABLES
                // ------------------------------------------
                const userVars = extractVariables(model);
                userVars.forEach(v => {
                    suggestions.push({
                        label: v,
                        insertText: v,
                        kind: monaco.languages.CompletionItemKind.Variable,
                        documentation: `User variable "${v}"`,
                        range
                    });
                });


                // ------------------------------------------
                // Default: globals + event snippet
                // ------------------------------------------
                globals.forEach(g =>
                    suggestions.push({
                        label: g,
                        insertText: g,
                        kind: monaco.languages.CompletionItemKind.Module,
                        documentation: {
                            value: `**VisionBot Global**\n\n\`${g}\``
                        },
                        range
                    })
                );



                suggestions.push({
                    label: "event handler",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText:
                        'event("${1:event_name}", function(${2:arg})\n\t${3:-- code}\nend)',
                    insertTextRules:
                    monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                    documentation: "VisionBot event listener"
                });

                return { suggestions };
            }
        });

        _editor.onDidChangeModelContent(() => {
            const model = _editor.getModel();
            if (model) runLuaLint(model);
        });

        setTimeout(() => {
            const model = _editor.getModel();
            if (model) runLuaLint(model);
        }, 50);
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
                fontLigatures: true,
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 4,
                wordWrap: "on",
            }}
            theme="visionbot-dark"
        />        
    );
};

export default CodeEditor;
