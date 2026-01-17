// Глобали, доступні в Lua модулях VisionBot

declare namespace visionbot {
    /** HTTP API (async via callback) */
    interface HttpResult {
        status: number;
        data: any;
    }

    interface Http {
        get(url: string, callback: (result: HttpResult) => void): void;
        post(url: string, callback: (result: HttpResult) => void): void;
        put(url: string, callback: (result: HttpResult) => void): void;
        delete(url: string, callback: (result: HttpResult) => void): void;
    }

    /** Logger API */
    interface Logger {
        info(msg: string): void;
        warn(msg: string): void;
        error(msg: string): void;
        debug(msg: string): void;
        trace(msg: string): void;
        success(msg: string): void;
    }

    /** Discord Message */
    interface Message {
        id: number;
        content: string;
        text: string;
        channel: Channel;
        member?: Member;

        answer(text: string): void;
        delete(): void;
        edit(text: string): void;
    }

    interface Channel {
        id: number;
        send_message(text: string): void;
        delete(): void;
        edit(name: string): void;

        get_message(id: number): Promise<Message>;
    }

    /** Discord Member */
    interface Member {
        id: number;
        username: string;
        nickname?: string;

        kick(reason?: string): void;
        ban(reason?: string, delete_message_days?: number): void;
        timeout(reason: string, seconds: number): void;

        add_role(role_id: number): void;
        remove_role(role_id: number): void;
    }

    /** Guild wrapper */
    interface Guild {
        id: number;

        get_info(): Promise<any>;
        fetch_channels(): Promise<any[]>;
        fetch_roles(): Promise<any[]>;

        get_member(id: number): Promise<Member>;
        get_user(id: number): Promise<any>;

        get_channel(id: number): Channel;

        create_text_channel(name: string): void;
        create_category(name: string): void;
        create_role(name: string, color?: number): void;
    }

    /** Key-value Store */
    interface StoreScope {
        get(key: string): Promise<any>;
        set(key: string, value: any): void;
        remove(key: string): void;
        query(): Promise<Record<string, any>>;
    }

    interface Store {
        module: StoreScope;
        server: StoreScope;
    }
}

declare const http: visionbot.Http;
declare const logger: visionbot.Logger;
declare const guild: visionbot.Guild;
declare const vars: {
    module: Record<string, any>;
    server: Record<string, any>;
};
declare const store: visionbot.Store;

/** Await wrapper */
declare function await(task: Promise<any>, on_result?: (v: any) => void, on_error?: (e: string) => void): void;

/** Fired events provide 'message', 'member', etc */
declare const message: visionbot.Message | undefined;
declare const member: visionbot.Member | undefined;








