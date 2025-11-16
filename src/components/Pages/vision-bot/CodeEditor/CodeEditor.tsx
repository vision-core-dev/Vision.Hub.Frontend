import React, { useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";

import { registerVisionbotDocs, VISIONBOT_API, VISIONBOT_EVENTS } from "./VisionBotLuaAPI";

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
                    [/--.*/, "comment"],

                    [/"([^"\\]|\\.)*"/, "string"],
                    [/'([^'\\]|\\.)*'/, "string"],

                    [/[0-9]+(\.[0-9]+)?/, "number"],

                    [/\b(http|logger|guild|member|message|reaction|vars|store|await|event)\b/, "vision-global"],

                    [/\b(function|local|and|or|not|if|then|else|for|in|end|return|while|do)\b/, "keyword"],

                    [/\b(true|false|nil)\b/, "constant"],

                    // ⭐ METHOD: object.method(
                    [
                      /([a-zA-Z_]\w*)(\.)([a-zA-Z_]\w*)(?=\()/,
                      [
                        "identifier",     // object
                        "delimiter",      // .
                        "vision-method"   // method (only if followed by "(")
                      ]
                    ],

                    // ⭐ VALUE: object.value  (НЕ метод)
                    [
                      /([a-zA-Z_]\w*)(\.)([a-zA-Z_]\w*)/,
                      [
                        "identifier",     // object
                        "delimiter",      // .
                        "vision-value"    // value/property (no "(" after)
                      ]
                    ],

                    // ⭐ FUNCTION DECLARATION: local function foo(...)
                    [
                      /\b(?:local\s+)?function\s+([a-zA-Z_]\w*)/,
                      [
                        "keyword",       // "function"
                        "ws",            // пробіл (Monaco вимагає, але ми його ігноруємо)
                        "vision-fn"      // ім'я функції — виділяємо
                      ]
                    ],
                    // ⭐ FUNCTION CALL: foo(
                    [
                      /([a-zA-Z_]\w*)(?=\s*\()/,
                      "vision-fn-call"
                    ],

                    // fallback
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
            colors: {
              "editor.background": "#202227"
            },
            rules: [
              { token: "comment",        foreground: "6A6F81" },
              { token: "string",         foreground: "8EE9B6" },
              { token: "number",         foreground: "F2BA2A" },

              { token: "keyword",        foreground: "EB7973", fontStyle: "bold" },
              { token: "constant",       foreground: "F2BA2A" },

              { token: "identifier",     foreground: "BCCCC8" }, // Roblox-like переменные
              { token: "delimiter",      foreground: "FFFFFF" }, // .

              { token: "vision-fn",      foreground: "fae482", fontStyle: "bold" },
              { token: "vision-fn-call", foreground: "fae482" },

              { token: "vision-global",  foreground: "6db4ff" },
              { token: "vision-method",  foreground: "fae482" },
              { token: "vision-value",   foreground: "70a0ff" }
            ]
          });



        monacoInstance.editor.setTheme("visionbot-dark");

        // ------------------------------
        // Docs + Autocomplete API
        // ------------------------------
        registerVisionbotDocs(monacoInstance);


        // -------------------------------------------------------------
        //      LOCAL VARIABLES & FUNCTIONS PARSER
        // -------------------------------------------------------------
        function collectLocals(lines: string[]) {
            const locals = new Set<string>();
            const functions = new Set<string>();

            lines.forEach(line => {
                // local foo
                const varMatch = line.match(/^\s*local\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
                if (varMatch) locals.add(varMatch[1]);

                // local function foo()
                const fnMatch = line.match(/^\s*local\s+function\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
                if (fnMatch) functions.add(fnMatch[1]);
            });

            return { locals, functions };
        }


        // ------------------------------
        // Simple Lua Lint + Undefined variables
        // ------------------------------
        function lint() {
            const model = _editor.getModel();
            if (!model) return;

            const lines = model.getValue().split("\n");
            const markers: monaco.editor.IMarkerData[] = [];

            // зібрати локальні змінні/функції
            const { locals, functions } = collectLocals(lines);

            const known = new Set([
                ...VISIONBOT_API.globals,
                "msg", "member", "message", "guild", "reaction", "store", "vars"
            ]);

            // stack для відстеження end
            let blockStack: { line: number }[] = [];

            lines.forEach((line, i) => {
                const ln = i + 1;

                // ❌ if ... (no then)
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

                // ------------------------------
                // Undefined variables (fix)
                // ------------------------------

                function extractIdentifiers(codeLine: string) {
                    // прибираємо строки "..."
                    const withoutStrings = codeLine.replace(/"([^"\\]|\\.)*"/g, "");

                    // прибираємо '...'
                    const clean = withoutStrings.replace(/'([^'\\]|\\.)*'/g, "");

                    return clean.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
                }

                const identifiers = extractIdentifiers(line);

                identifiers.forEach(tok => {
                    // RULE 1: VisionBot глобальні
                    if (known.has(tok)) return;

                    // RULE 2: локальні змінні / функції
                    if (locals.has(tok) || functions.has(tok)) return;

                    // RULE 3: ключові слова
                    if ([
                        "end","then","local","function","return","not",
                        "if","else","for","while","do","true","false","nil"
                    ].includes(tok)) return;

                    // RULE 4: msg, member, guild, message, reaction, res
                    if (["msg","message","member","guild","reaction","res"].includes(tok)) return;

                    // RULE 5: VisionBot API: msg.answer, guild.get_channel, logger.info...
                    for (const apiObj of Object.keys(VISIONBOT_API)) {
                        if (line.includes(apiObj + "." + tok)) return;
                    }

                    // RULE 6: JSON поля res.data.title
                    if (line.includes("res.data.") || line.includes("res.")) return;

                    // RULE 7: event("message_created")
                    if (VISIONBOT_EVENTS.includes(tok)) return;

                    // ❌ УСЕ ІНШЕ — undefined
                    markers.push({
                        severity: monacoInstance.MarkerSeverity.Warning,
                        message: `Undefined variable '${tok}'`,
                        startLineNumber: ln,
                        endLineNumber: ln,
                        startColumn: line.indexOf(tok) + 1,
                        endColumn: line.indexOf(tok) + tok.length
                    });
                });


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


        // -------------------------------------------------------------
        // AUTOCOMPLETE FOR LOCALS + LOCAL FUNCTIONS
        // -------------------------------------------------------------
        monacoInstance.languages.registerCompletionItemProvider("lua", {
            triggerCharacters: [".", "(", '"', "'", '`'],

            provideCompletionItems(model, position) {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };

                const suggestions: monaco.languages.CompletionItem[] = [];

                const lines = model.getValue().split("\n");
                const { locals, functions } = collectLocals(lines);

                // 🔥 locals
                locals.forEach(l => {
                    suggestions.push({
                        label: l,
                        kind: monacoInstance.languages.CompletionItemKind.Variable,
                        insertText: l,
                        range
                    });
                });

                // 🔥 functions
                functions.forEach(fn => {
                    suggestions.push({
                        label: fn,
                        kind: monacoInstance.languages.CompletionItemKind.Function,
                        insertText: fn,
                        range
                    });
                });

                return { suggestions };
            }
        });

    }, []);

    return (
        <Editor
            height="80vh"
            defaultLanguage="lua"
            value={value}
            onChange={(code) => onChange(code || "")}
            onMount={handleMount}
            options={{
                bracketPairColorization: { enabled: false },
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
