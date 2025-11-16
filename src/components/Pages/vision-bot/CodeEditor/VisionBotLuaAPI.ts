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
    globals: ["http", "logger", "guild", "member", "message", "reaction", "vars", "store", "await"],

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

export function getFullCall(model: Model, position: Position) {
    const line = model.getValueInRange({
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: 1,
        endColumn: position.column,
    });

    const match = line.match(/([a-zA-Z0-9_\.]+)\s*\($/);
    if (!match) return null;

    const parts = match[1].split(".");
    if (parts.length < 2) return null;

    return {
        object: parts[parts.length - 2],
        member: parts[parts.length - 1],
    };
}

export function extractObjectMember(model: Model, position: Position) {
    const line = model.getLineContent(position.lineNumber);
    const textBeforeCursor = line.substring(0, position.column - 1);

    const match = textBeforeCursor.match(
        /([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)$/
    );

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
        provideHover(model: Model, position: Position) {
            const { object, member } = extractObjectMember(model, position);
            if (!object || !member) return null;

            const api = (VISIONBOT_API as any)[object]?.[member];
            if (!api) return null;

            const contents: IMarkdownString[] = [
                { value: `### ${object}.${member}` },
            ];

            if (api.doc)
                contents.push({ value: api.doc });

            if (api.params)
                contents.push({
                    value: "**Параметри:** " + api.params.join(", "),
                });

            if (api.returns)
                contents.push({
                    value: "**Повертає:** `" + api.returns + "`",
                });

            return { contents };
        },
    });

    // ------------------------------
    // Signature Help
    // ------------------------------
    m.languages.registerSignatureHelpProvider("lua", {
        signatureHelpTriggerCharacters: ["(", ","],

        provideSignatureHelp(model: Model, position: Position) {
            const call = getFullCall(model, position);
            if (!call) return null;

            const api = (VISIONBOT_API as any)[call.object]?.[call.member];
            if (!api || !api.params) return null;

            return {
                value: {
                    signatures: [
                        {
                            label: `${call.object}.${call.member}(${api.params.join(
                                ", "
                            )})`,
                            parameters: api.params.map((p: string) => ({
                                label: p,
                            })),
                            documentation: api.doc || "",
                        },
                    ],
                    activeSignature: 0,
                    activeParameter: 0,
                },
                dispose() {},
            };
        },
    });

    // ------------------------------
    // Autocomplete
    // ------------------------------
    m.languages.registerCompletionItemProvider("lua", {
        triggerCharacters: [".", '"', "'", "("],

        provideCompletionItems(model: Model, position: Position) {
            const word = model.getWordUntilPosition(position);
            const range: Monaco.IRange = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            const suggestions: languages.CompletionItem[] = [];

            const textBefore = model.getValueInRange({
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: 1,
                endColumn: position.column
            });

            VISIONBOT_API.globals.forEach(g =>
                suggestions.push({
                    label: g,
                    kind: m.languages.CompletionItemKind.Module,
                    insertText: g,
                    range,
                    detail: "📦 Global object"
                })
            );

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