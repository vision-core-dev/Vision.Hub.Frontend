import * as Monaco from "monaco-editor";

import type {
    editor,
    languages,
    Position,
    IMarkdownString,
} from "monaco-editor";

type Model = editor.ITextModel;

export const VISIONBOT_EVENTS = [
    "member_joined",
    "member_leaved",
    "message_created",
    "message_reaction_add",
    "message_reaction_remove"
];

export const VISIONBOT_API = {
    globals: ["http", "logger", "guild", "member", "message", "reaction", "vars", "store", "await", "event"],

    event: { params: ["event_name: string", "callback: function"], doc: "Виконує певну подію." },

    http: {
        get: { params: ["url: string", "callback: function"], doc: "HTTP GET запит." },
        post: { params: ["url: string", "callback: function"], doc: "HTTP POST запит." },
        put: { params: ["url: string", "callback: function"], doc: "HTTP PUT запит." },
        delete: { params: ["url: string", "callback: function"], doc: "HTTP DELETE запит." }
    },

    logger: {
        info:    { params: ["text: string"], doc: "Інформаційне повідомлення." },
        warn:    { params: ["text: string"], doc: "Попередження." },
        error:   { params: ["text: string"], doc: "Помилка." },
        debug:   { params: ["text: string"], doc: "Дебаг." },
        success: { params: ["text: string"], doc: "Успішна дія." },
        trace:   { params: ["text: string"], doc: "Детальний лог." }
    },

    guild: {
        get_info:           { returns: "GuildInfo", doc: "Повертає інформацію про сервер." },
        fetch_channels:     { returns: "Channel[]", doc: "Отримує всі канали сервера." },
        fetch_roles:        { returns: "Role[]", doc: "Отримує всі ролі сервера." },
        get_member:         { params: ["user_id: number"], returns: "LuaMember", doc: "Отримує учасника." },
        get_user:           { params: ["user_id: number"], returns: "LuaUser", doc: "Отримує юзера." },
        get_channel:        { params: ["channel_id: number"], returns: "LuaChannel", doc: "Отримує канал." },
        create_text_channel:{ params: ["name:string","parent_id?:number","topic?:string"], doc:"Створює текстовий канал." },
        create_category:    { params: ["name:string"], doc:"Створює категорію." },
        create_role:        { params: ["name:string","color?:number"], doc:"Створює роль." },
        edit:               { params: ["name?:string","description?:string"], doc:"Редагує сервер." },
        ban_member:         { params: ["user_id:number","reason?:string"], doc:"Банить учасника." },
        unban_member:       { params: ["user_id:number","reason?:string"], doc:"Розбанює учасника." },
        kick_member:        { params: ["user_id:number","reason?:string"], doc:"Кікає учасника." },
        add_role_to_member:    { params:["user_id:number","role_id:number"], doc:"Додає роль." },
        remove_role_from_member:{ params:["user_id:number","role_id:number"], doc:"Знімає роль." },
    },

    member: {
        id: { type: "number" },
        username: { type: "string" },
        global_name: { type: "string" },
        nickname: { type: "string" },
        mention: { type: "string" },
        role_ids: { type: "number[]" },
        is_bot: { type: "boolean" },
        is_timeout: { type: "boolean" },

        send_dm_message: { params: ["text:string"], doc: "Надсилає DM." },
        kick:        { params: ["reason?:string"], doc: "Кікає." },
        ban:         { params: ["reason?:string","delete_msg_days?:number"], doc: "Банить." },
        unban:       { params: ["reason?:string"], doc: "Розбан." },
        timeout:     { params: ["reason:string","seconds:number"], doc: "Дисейбл на N секунд." },
        add_role:    { params: ["role_id:number"], doc: "Додає роль." },
        remove_role: { params: ["role_id:number"], doc: "Знімає роль." }
    },

    message: {
        id:        { type: "number" },
        content:   { type: "string" },
        member:    { type: "LuaMember" },
        channel_id:{ type: "number" },
        guild_id:  { type: "number" },

        answer: { params: ["text:string"], doc:"Відповідає у той самий канал." },
        delete: { params: [], doc:"Видаляє повідомлення." },
        edit:   { params:["new_content:string"], doc:"Редагує повідомлення." }
    },

    reaction: {
        emoji:      { type:"string" },
        emoji_name: { type:"string" },
        emoji_id:   { type:"number" },
        user_id:    { type:"number" },
        message_id: { type:"number" },
        channel_id: { type:"number" },

        member: { type:"LuaMember" },
    },

    store: {
        module: {
            get:    { params:["key:string"], returns:"any" },
            set:    { params:["key:string","value:any"], returns:"void" },
            remove: { params:["key:string"] },
            query:  { params:["pattern:string"], returns:"table" }
        },
        server: {
            get:    { params:["key:string"], returns:"any" },
            set:    { params:["key:string","value:any"], returns:"void" },
            remove: { params:["key:string"] },
            query:  { params:["pattern:string"], returns:"table" }
        }
    },

    vars: {
        module: { type:"table" },
        server: { type:"table" }
    }
};

// ------------------------------
// Utils
// ------------------------------

function getGlobalFunction(model: Model, position: Position) {
    const line = model.getValueInRange({
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: 1,
        endColumn: position.column,
    });

    const match = line.match(/([a-zA-Z_]\w*)\s*\($/);
    if (!match) return null;

    const fn = match[1];
    if ((VISIONBOT_API as any)[fn] && typeof (VISIONBOT_API as any)[fn] === "object") {
        return fn;
    }

    return null;
}

export function getFullCall(model: Model, position: Position) {
    const line = model.getValueInRange({
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: 1,
        endColumn: position.column,
    });

    const match = line.match(/([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)+)\s*\($/);
    if (!match) return null;

    const parts = match[1].split(".");
    if (parts.length < 2) return null;

    return {
        object: parts[parts.length - 2],
        member: parts[parts.length - 1],
    };
}

function findMethodByName(name: string) {
    for (const obj of Object.keys(VISIONBOT_API)) {
        if (obj === "globals") continue;

        const group = (VISIONBOT_API as any)[obj];
        if (typeof group !== "object") continue;

        if (group[name]) {
            return {
                object: obj,
                member: name,
                meta: group[name]
            };
        }
    }
    return null;
}

function findCallAtPosition(model: Model, position: Position) {
    const full = model.getValueInRange({
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: 1,
        endColumn: model.getLineLength(position.lineNumber)
    });

    // шукаємо найближчу '(' перед курсором
    const before = full.substring(0, position.column);
    const openIndex = before.lastIndexOf("(");
    if (openIndex === -1) return null;

    // шукаємо назву методу: object.method
    const callMatch = before.substring(0, openIndex).match(/([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)+)$/);
    if (!callMatch) return null;

    const parts = callMatch[1].split(".");
    return {
        object: parts[parts.length - 2],
        member: parts[parts.length - 1],
        argIndex: before.substring(openIndex + 1).split(",").length - 1
    };
}

function getActiveParameter(model: Model, position: Position) {
    const line = model.getLineContent(position.lineNumber);
    const before = line.substring(0, position.column);

    // рахуємо скільки ком ПІСЛЯ відкритої дужки
    const openIndex = before.lastIndexOf("(");
    if (openIndex === -1) return 0;

    const argsPart = before.substring(openIndex + 1);
    const commas = argsPart.split(",").length - 1;

    return commas < 0 ? 0 : commas;
}

export function extractObjectMember(model: Model, position: Position) {
    const line = model.getLineContent(position.lineNumber);
    const text = line.substring(0, position.column);

    // ⚡ Дозволяємо будь-які токени: vision-method, vision-value, identifier
    const match = text.match(/([a-zA-Z_]\w*)\s*\.\s*([a-zA-Z_]\w*)$/);

    if (!match) return { object: null, member: null };

    return {
        object: match[1],
        member: match[2],
    };
}


export function resolveObjectAndMethod(model: Model, position: Position) {
    const line = model.getLineContent(position.lineNumber).slice(
        0,
        position.column
    );
    const match = line.match(/([\w\.]+)\s*\($/);
    if (!match) return null;

    const parts = match[1].split(".");
    if (parts.length < 2) return null;

    return {
        object: parts[parts.length - 2],
        method: parts[parts.length - 1],
    };
}

export function getWordBefore(model: Model, position: Position) {
    const line = model.getLineContent(position.lineNumber);
    const text = line.substring(0, position.column - 1).trim();

    const match = text.match(/([a-zA-Z_][a-zA-Z0-9_]*)\.$/);
    return match ? match[1] + "." : "";
}


// ------------------------------
// Main registration (Hover + Signature + Autocomplete)
// ------------------------------

export function registerVisionbotDocs(m: typeof Monaco) {
    // ------------------------------
    // Hover Provider
    // ------------------------------
    m.languages.registerHoverProvider("lua", {
        provideHover(model, position) {
            // -------- 1) object.method --------
            const { object, member } = extractObjectMember(model, position);
            if (object && member) {
                const api = (VISIONBOT_API as any)[object]?.[member];
                if (api) {
                    return {
                        contents: [
                            { value: `### ${object}.${member}` },
                            api.doc && { value: api.doc },
                            api.params && { value: "**Параметри:** " + api.params.join(", ") },
                            api.returns && { value: "**Повертає:** `" + api.returns + "`" }
                        ].filter(Boolean) as IMarkdownString[]
                    };
                }
            }

            // -------- 2) globalFunction(...) --------
            const globalFn = getGlobalFunction(model, position);
            if (globalFn) {
                const api = (VISIONBOT_API as any)[globalFn];
                if (api) {
                    return {
                        contents: [
                            { value: `### ${globalFn}()` },
                            api.doc && { value: api.doc },
                            api.params && { value: "**Параметри:** " + api.params.join(", ") }
                        ].filter(Boolean) as IMarkdownString[]
                    };
                }
            }

            // -------- 🆕 3) "answer" → знайти в API --------
            const wordInfo = model.getWordAtPosition(position);
            if (wordInfo) {
                const name = wordInfo.word;

                const found = findMethodByName(name);
                if (found) {
                    const { object, member, meta } = found;

                    return {
                        contents: [
                            { value: `### ${object}.${member}` },
                            meta.doc && { value: meta.doc },
                            meta.params && { value: "**Параметри:** " + meta.params.join(", ") },
                            meta.returns && { value: "**Повертає:** `" + meta.returns + "`" }
                        ].filter(Boolean) as IMarkdownString[]
                    };
                }
            }

            return null;
        }
    });


    // ------------------------------
    // Signature Help
    // ------------------------------
    m.languages.registerSignatureHelpProvider("lua", {
        signatureHelpTriggerCharacters: ["(", ",", " ", '"', "'"],

        provideSignatureHelp(model, position) {
            const call = findCallAtPosition(model, position);
            if (!call) return null;

            const api = (VISIONBOT_API as any)[call.object]?.[call.member];
            if (!api || !api.params) return null;

            return {
                value: {
                    signatures: [
                        {
                            label: `${call.object}.${call.member}(${api.params.join(", ")})`,
                            parameters: api.params.map(p => ({ label: p })),
                            documentation: api.doc || ""
                        }
                    ],
                    activeSignature: 0,
                    activeParameter: Math.min(call.argIndex, api.params.length - 1)
                },
                dispose() {}
            };
        }
    });



    // ------------------------------
    // Autocomplete
    // ------------------------------
    m.languages.registerCompletionItemProvider("lua", {
        triggerCharacters: [".", '"', "'", "("],

        provideCompletionItems(model, position) {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            const suggestions: languages.CompletionItem[] = [];

            const textBefore = model.getLineContent(position.lineNumber).slice(0, position.column);

            // global objects & global functions
            VISIONBOT_API.globals.forEach(g =>
                suggestions.push({
                    label: g,
                    kind: m.languages.CompletionItemKind.Module,
                    insertText: g,
                    range,
                    detail: "Global object/function"
                })
            );

            // object.
            const before = getWordBefore(model, position);

            if (before.endsWith(".")) {
                const obj = before.replace(".", "");
                const methods = (VISIONBOT_API as any)[obj];

                if (methods) {
                    Object.keys(methods).forEach(mname => {
                        suggestions.push({
                            label: mname,
                            kind: m.languages.CompletionItemKind.Method,
                            insertText: mname,
                            range,
                            documentation: methods[mname].doc || ""
                        });
                    });
                }
            }

            // event("...")
            if (textBefore.includes('event("')) {
                VISIONBOT_EVENTS.forEach(e =>
                    suggestions.push({
                        label: e,
                        kind: m.languages.CompletionItemKind.EnumMember,
                        insertText: e,
                        detail: "Event name",
                        range
                    })
                );
            }

            return { suggestions };
        }
    });

}